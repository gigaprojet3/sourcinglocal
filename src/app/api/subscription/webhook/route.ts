import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const PLAN_NAME = "Découverte";
const PLAN_PRICE_CFA = 1000;
const WEBHOOK_SECRET = process.env.GENIUSPAY_WEBHOOK_SECRET!;

// ── Types GeniusPay webhook ───────────────────────────────────────────
interface GeniusPayWebhookPayload {
  id: string;
  event: string;
  timestamp: number;
  created_at: string;
  environment: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    metadata: {
      user_id?: string;
      plan?: string;
      plan_price?: number;
    };
  };
}

/**
 * Vérifie la signature HMAC-SHA256 du webhook GeniusPay.
 * Format : HMAC-SHA256(timestamp + "." + json_payload, secret)
 */
function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET || !signature || !timestamp) return false;

  // Protection anti-replay : rejeter les webhooks de plus de 5 minutes
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) {
    console.warn("[Webhook] Timestamp expiré:", ts, "now:", now);
    return false;
  }

  const data = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(data)
    .digest("hex");

  // timingSafeEqual pour éviter les timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // ── 1. Lire le raw body pour la vérification de signature ────────────
  const rawBody = await req.text();

  const signature = req.headers.get("X-Webhook-Signature") ?? "";
  const timestamp = req.headers.get("X-Webhook-Timestamp") ?? "";
  const event = req.headers.get("X-Webhook-Event") ?? "";

  // ── 2. Vérifier la signature ─────────────────────────────────────────
  if (!verifyWebhookSignature(rawBody, timestamp, signature)) {
    console.error("[Webhook] Signature invalide ou timestamp expiré.");
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  // ── 3. Parser le payload ─────────────────────────────────────────────
  let payload: GeniusPayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as GeniusPayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Payload invalide." }, { status: 400 });
  }

  // ── 4. Traiter selon l'événement ─────────────────────────────────────
  switch (event || payload.event) {
    case "payment.success": {
      await handlePaymentSuccess(payload);
      break;
    }

    case "payment.failed":
    case "payment.cancelled":
    case "payment.expired": {
      // Optionnel : marquer l'abonnement comme PAST_DUE si existant
      const userId = payload.data?.metadata?.user_id;
      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId, status: "INACTIVE" },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    case "webhook.test": {
      // GeniusPay teste le webhook — répondre 200 sans traitement
      console.log("[Webhook] Test reçu OK");
      break;
    }

    default:
      // Ignorer les autres événements (cashout, etc.)
      break;
  }

  // Toujours répondre 200 pour éviter les retentatives GeniusPay
  return NextResponse.json({ received: true }, { status: 200 });
}

// ── Handler payment.success ───────────────────────────────────────────
async function handlePaymentSuccess(
  payload: GeniusPayWebhookPayload
): Promise<void> {
  const { metadata, reference, amount, status } = payload.data;

  // Vérifier que le paiement est bien "completed"
  if (status !== "completed") {
    console.warn("[Webhook] payment.success mais status:", status);
    return;
  }

  const userId = metadata?.user_id;
  if (!userId) {
    console.error("[Webhook] user_id manquant dans metadata. ref:", reference);
    return;
  }

  // Calculer la période d'abonnement (30 jours)
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  try {
    // Upsert : créer ou renouveler l'abonnement
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "ACTIVE",
        planName: PLAN_NAME,
        priceCfa: PLAN_PRICE_CFA,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        geniuspayRef: reference,
      },
      update: {
        status: "ACTIVE",
        planName: PLAN_NAME,
        priceCfa: PLAN_PRICE_CFA,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        geniuspayRef: reference,
      },
    });

    console.log(
      `[Webhook] Abonnement activé pour user ${userId}. Ref: ${reference}. Expire: ${periodEnd.toISOString()}`
    );
  } catch (err) {
    console.error("[Webhook] Erreur DB:", err);
    // On throw pour que GeniusPay retente le webhook
    throw err;
  }
}

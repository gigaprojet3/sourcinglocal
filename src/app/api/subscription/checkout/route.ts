import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PLAN_NAME = "Découverte";
const PLAN_PRICE_CFA = 1000;
const GENIUSPAY_BASE_URL = process.env.GENIUSPAY_BASE_URL!;
const GENIUSPAY_API_KEY = process.env.GENIUSPAY_API_KEY!;
const GENIUSPAY_SECRET_KEY = process.env.GENIUSPAY_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(req: NextRequest) {
  // ── 1. Vérifier session ─────────────────────────────────────────────
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (session.user.role !== "BUYER") {
    return NextResponse.json(
      { error: "Réservé aux acheteurs." },
      { status: 403 }
    );
  }

  // ── 2. Vérifier si déjà abonné ────────────────────────────────────────
  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true, currentPeriodEnd: true },
  });

  if (existing?.status === "ACTIVE" && existing.currentPeriodEnd > new Date()) {
    return NextResponse.json(
      { error: "Vous avez déjà un abonnement actif." },
      { status: 400 }
    );
  }

  // ── 3. Récupérer le profil utilisateur ──────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  // ── 4. Créer la session de paiement GeniusPay ────────────────────────
  // Les clés restent côté serveur — jamais exposées au client
  const geniusPayRes = await fetch(`${GENIUSPAY_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "X-API-Key": GENIUSPAY_API_KEY,
      "X-API-Secret": GENIUSPAY_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: PLAN_PRICE_CFA,
      currency: "XOF",
      description: `Abonnement ${PLAN_NAME} — SourcingLocal`,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
      },
      success_url: `${APP_URL}/abonnements/succes`,
      error_url: `${APP_URL}/abonnements/echec`,
      // Métadonnées pour identifier la commande dans le webhook
      metadata: {
        user_id: session.user.id,
        plan: PLAN_NAME,
        plan_price: PLAN_PRICE_CFA,
      },
    }),
  });

  if (!geniusPayRes.ok) {
    const errBody = await geniusPayRes.json().catch(() => ({}));
    console.error("[GeniusPay] Erreur création paiement:", errBody);
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement. Réessayez." },
      { status: 502 }
    );
  }

  const geniusData = await geniusPayRes.json() as {
    success: boolean;
    data: {
      reference: string;
      checkout_url: string;
    };
  };

  if (!geniusData.success || !geniusData.data?.checkout_url) {
    console.error("[GeniusPay] Réponse inattendue:", geniusData);
    return NextResponse.json(
      { error: "Réponse invalide de GeniusPay." },
      { status: 502 }
    );
  }

  // ── 5. Retourner l'URL de checkout au client (pas les clés secrètes) ─
  return NextResponse.json({
    checkout_url: geniusData.data.checkout_url,
    reference: geniusData.data.reference,
  });
}

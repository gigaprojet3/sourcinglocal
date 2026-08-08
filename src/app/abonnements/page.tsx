import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle,
  MessageCircle,
  Users,
  ShoppingBag,
  Bell,
  Star,
  Shield,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCfa } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mon abonnement — Plan Découverte",
  description:
    "Abonnez-vous au Plan Découverte pour contacter directement les vendeurs locaux africains vérifiés.",
};

const PLAN_PRICE_CFA = 1000;

const ADVANTAGES = [
  {
    icon: MessageCircle,
    title: "Contactez directement les vendeurs",
    description:
      "Envoyez des messages illimités aux fournisseurs vérifiés et négociez directement vos commandes.",
  },
  {
    icon: Users,
    title: "Accès aux coordonnées complètes",
    description:
      "Téléphone, WhatsApp, adresse physique — toutes les informations de contact du vendeur débloquées.",
  },
  {
    icon: ShoppingBag,
    title: "Catalogue complet sans restriction",
    description:
      "Parcourez l'intégralité des produits publiés par nos 380+ vendeurs vérifiés en Afrique.",
  },
  {
    icon: Bell,
    title: "Alertes produits en avant-première",
    description:
      "Soyez notifié dès qu'un nouveau produit correspondant à vos intérêts est publié.",
  },
  {
    icon: Star,
    title: "Priorité de visibilité auprès des vendeurs",
    description:
      "Votre profil acheteur est mis en avant. Les vendeurs voient vos demandes en premier.",
  },
];

const FAQ = [
  {
    question: "Comment fonctionne le paiement ?",
    answer:
      "Vous êtes redirigé vers la page de paiement sécurisée de GeniusPay. Vous pouvez payer par Wave, Orange Money, MTN Mobile Money, carte bancaire ou tout autre moyen disponible dans votre pays.",
  },
  {
    question: "Mon abonnement se renouvelle-t-il automatiquement ?",
    answer:
      "Non. L'abonnement est valable 30 jours. Pour continuer à bénéficier des fonctionnalités, vous devrez souscrire à nouveau avant ou après l'expiration.",
  },
  {
    question: "Que se passe-t-il après les 30 jours ?",
    answer:
      "Votre accès aux fonctionnalités premium (contact vendeurs, coordonnées) sera suspendu. Vous pouvez toujours parcourir la marketplace et voir les produits.",
  },
];

export default async function AbonnementsPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isBuyer = session?.user?.role === "BUYER";

  // Récupérer l'abonnement actuel si connecté
  let subscription = null;
  if (session?.user?.id && isBuyer) {
    subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        status: true,
        currentPeriodEnd: true,
        planName: true,
        priceCfa: true,
      },
    });
  }

  const isActive =
    subscription?.status === "ACTIVE" &&
    !!subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date();

  const daysLeft = isActive && subscription?.currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil(
          (subscription.currentPeriodEnd.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-white border-b border-zinc-100 py-16 px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-600">
              <Shield size={13} strokeWidth={1.5} className="text-black" />
              Paiement sécurisé via GeniusPay
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              Accédez à tous les vendeurs
              <br />
              <span className="text-zinc-400 font-normal">de la marketplace</span>
            </h1>
            <p className="text-zinc-500 max-w-xl mx-auto text-base leading-relaxed">
              Un seul plan. Un accès complet aux fournisseurs locaux africains
              vérifiés pour sourcer vos produits directement.
            </p>
          </div>
        </section>

        {/* ── Plan + CTA ── */}
        <section className="py-12 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid lg:grid-cols-5 gap-8 items-start">

              {/* Carte plan — 2/5 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6 sticky top-24">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-black text-white px-3 py-1 text-xs font-medium">
                    Plan unique
                  </div>

                  {/* Nom + Prix */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-zinc-900">
                      Plan Découverte
                    </h2>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold text-zinc-900 tabular-nums">
                        {formatCfa(PLAN_PRICE_CFA)}
                      </span>
                      <span className="text-sm text-zinc-400">/ mois</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Accès complet pendant 30 jours
                    </p>
                  </div>

                  {/* Séparateur */}
                  <div className="h-px bg-zinc-100" />

                  {/* Avantages résumés */}
                  <ul className="space-y-2.5">
                    {ADVANTAGES.map((a) => (
                      <li key={a.title} className="flex items-start gap-2.5">
                        <CheckCircle
                          size={15}
                          strokeWidth={1.5}
                          className="text-emerald-600 shrink-0 mt-0.5"
                        />
                        <span className="text-sm text-zinc-700">{a.title}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Séparateur */}
                  <div className="h-px bg-zinc-100" />

                  {/* Statut abonnement (buyer connecté) */}
                  {isBuyer && isActive && subscription?.currentPeriodEnd && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-emerald-700">
                        Votre abonnement est actif
                      </p>
                      <p className="text-xs text-emerald-600">
                        Expire dans{" "}
                        <span className="font-bold">{daysLeft} jour{daysLeft > 1 ? "s" : ""}</span>
                        {" · "}
                        {subscription.currentPeriodEnd.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <SubscribeButton
                    isLoggedIn={isLoggedIn && isBuyer}
                    isActive={isActive}
                  />

                  {/* Paiements acceptés */}
                  <p className="text-xs text-zinc-400 text-center">
                    Wave · Orange Money · MTN · Moov · Carte bancaire
                  </p>
                </div>
              </div>

              {/* Avantages détaillés — 3/5 */}
              <div className="lg:col-span-3 space-y-4">
                <h2 className="text-base font-semibold text-zinc-900">
                  Ce que vous obtenez
                </h2>

                {ADVANTAGES.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="bg-white rounded-xl border border-zinc-100 p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                      <Icon size={18} strokeWidth={1.5} className="text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{title}</p>
                      <p className="text-sm text-zinc-400 mt-0.5 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Garantie */}
                <div className="bg-zinc-900 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Shield size={18} strokeWidth={1.5} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Paiement 100% sécurisé
                    </p>
                    <p className="text-sm text-zinc-400 mt-0.5 leading-relaxed">
                      Toutes les transactions sont traitées par GeniusPay,
                      certifié PCI DSS. Aucune information bancaire n&apos;est
                      stockée sur nos serveurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 px-4 bg-white border-t border-zinc-100">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} strokeWidth={1.5} className="text-black" />
              <h2 className="text-base font-semibold text-zinc-900">
                Questions fréquentes
              </h2>
            </div>

            <div className="divide-y divide-zinc-100">
              {FAQ.map(({ question, answer }) => (
                <details key={question} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                    <span className="text-sm font-medium text-zinc-800">
                      {question}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.5}
                      className="text-zinc-400 shrink-0 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}

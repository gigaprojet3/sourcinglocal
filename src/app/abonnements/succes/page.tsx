import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Paiement réussi" };

export default function AbonnementSuccesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-6">

          {/* Icône succès */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
              <CheckCircle
                size={40}
                strokeWidth={1.5}
                className="text-emerald-600"
              />
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900">
              Abonnement activé !
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Votre abonnement <span className="font-semibold text-zinc-700">Plan Découverte</span> est
              maintenant actif. Vous pouvez contacter directement les vendeurs
              et accéder à toutes les fonctionnalités.
            </p>
          </div>

          {/* Détails */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Plan</span>
              <span className="text-sm font-semibold text-zinc-900">Découverte</span>
            </div>
            <div className="h-px bg-zinc-50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Montant payé</span>
              <span className="text-sm font-semibold text-zinc-900">1 000 FCFA</span>
            </div>
            <div className="h-px bg-zinc-50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Durée</span>
              <span className="text-sm font-semibold text-zinc-900">30 jours</span>
            </div>
            <div className="h-px bg-zinc-50" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Statut</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Actif
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link href="/marketplace">
              <Button className="w-full gap-2" size="lg">
                <ShoppingBag size={16} strokeWidth={1.5} className="text-white" />
                Explorer la marketplace
              </Button>
            </Link>
            <Link href="/abonnements">
              <Button variant="ghost" className="w-full gap-2 text-zinc-500">
                Voir mon abonnement
                <ArrowRight size={14} strokeWidth={1.5} className="text-zinc-400" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-zinc-400">
            Un email de confirmation vous a été envoyé.
          </p>
        </div>
      </main>
    </div>
  );
}

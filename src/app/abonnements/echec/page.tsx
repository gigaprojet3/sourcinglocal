import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Paiement échoué" };

export default function AbonnementEchecPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center space-y-6">

          {/* Icône échec */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
              <XCircle
                size={40}
                strokeWidth={1.5}
                className="text-red-500"
              />
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900">
              Paiement non abouti
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Votre paiement n&apos;a pas pu être traité. Aucun montant n&apos;a
              été débité. Vous pouvez réessayer à tout moment.
            </p>
          </div>

          {/* Causes possibles */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 text-left space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Causes possibles
            </p>
            {[
              "Solde insuffisant sur votre compte Mobile Money",
              "Transaction annulée ou expirée",
              "Problème de connexion internet",
              "Numéro de téléphone ou carte invalide",
            ].map((cause) => (
              <div key={cause} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
                <span className="text-sm text-zinc-600">{cause}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <Link href="/abonnements">
              <Button className="w-full gap-2" size="lg">
                <RefreshCw size={16} strokeWidth={1.5} className="text-white" />
                Réessayer
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" className="w-full gap-2 text-zinc-500">
                <ArrowLeft size={14} strokeWidth={1.5} className="text-zinc-400" />
                Retour à la marketplace
              </Button>
            </Link>
          </div>

          <p className="text-xs text-zinc-400">
            Besoin d&apos;aide ?{" "}
            <Link href="/aide" className="underline hover:no-underline">
              Contactez le support
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

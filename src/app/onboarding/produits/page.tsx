import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Package, Plus, ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Votre boutique est prête !",
};

export default async function OnboardingProduitsPage() {
  const session = await auth();

  if (!session) redirect("/connexion");
  if (session.user.role !== "SELLER") redirect("/");

  // Vérifier que la boutique existe bien
  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, slug: true },
  });

  // Si pas de boutique, retour à l'étape 2
  if (!shop) redirect("/onboarding/boutique");

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Stepper — toutes les étapes complètes */}
          <div className="mb-8 flex items-center justify-center gap-0">
            <Step number={1} label="Compte" done />
            <StepLine done />
            <Step number={2} label="Boutique" done />
            <StepLine done />
            <Step number={3} label="Produits" active />
          </div>

          {/* Succès */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
              <CheckCircle size={26} strokeWidth={1.5} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Boutique créée avec succès !
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              <span className="font-medium text-zinc-700">{shop.name}</span> est prête.
              Ajoutez vos premiers produits pour commencer à vendre.
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8 space-y-4">
            <Link href="/dashboard/seller/produits/nouveau" className="block">
              <Button className="w-full gap-2" size="lg">
                <Plus size={16} strokeWidth={1.5} className="text-white" />
                Ajouter mon premier produit
              </Button>
            </Link>

            <Link href="/dashboard/seller" className="block">
              <Button variant="outline" className="w-full gap-2" size="lg">
                Aller au dashboard
                <ArrowRight size={15} strokeWidth={1.5} className="text-black" />
              </Button>
            </Link>
          </div>

          {/* Info */}
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-zinc-50 border border-zinc-100 p-4">
            <Package size={15} strokeWidth={1.5} className="text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Vous pouvez ajouter autant de produits que vous le souhaitez depuis votre dashboard.
              Chaque produit sera visible par les acheteurs abonnés.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Step({
  number, label, active = false, done = false,
}: {
  number: number; label: string; active?: boolean; done?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
        done
          ? "border-black bg-black text-white"
          : active
            ? "border-black bg-black text-white"
            : "border-zinc-200 bg-white text-zinc-400"
      }`}>
        {done ? "✓" : number}
      </div>
      <span className={`text-xs ${active || done ? "text-zinc-900 font-medium" : "text-zinc-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ done = false }: { done?: boolean }) {
  return <div className={`w-12 h-px mb-4 ${done ? "bg-black" : "bg-zinc-200"}`} />;
}

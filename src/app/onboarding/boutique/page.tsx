import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { CreateShopForm } from "@/components/onboarding/create-shop-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Configurer votre boutique",
};

export default async function OnboardingBoutiquePage() {
  const session = await auth();

  if (!session) redirect("/connexion");
  if (session.user.role !== "SELLER") redirect("/");

  // Vérification directe en DB — le JWT peut être en retard
  const existingShop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (existingShop) redirect("/dashboard/seller");

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Étapes */}
          <div className="mb-8 flex items-center justify-center gap-0">
            <Step number={1} label="Compte" done />
            <StepLine done />
            <Step number={2} label="Boutique" active />
            <StepLine />
            <Step number={3} label="Produits" active={false} />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Créez votre boutique
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Ces informations seront visibles par les acheteurs sur votre profil.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <CreateShopForm sellerName={session.user.name ?? ""} />
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

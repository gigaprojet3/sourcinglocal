import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegisterSellerForm } from "@/components/auth/register-seller-form";

export const metadata: Metadata = {
  title: "Créer un compte Vendeur",
};

export default function InscriptionVendeurPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header minimal */}
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Titre */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 shadow-sm mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-600">
                Rejoignez 380+ vendeurs vérifiés
              </span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Créer un compte Vendeur
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Vendez vos produits locaux à des acheteurs partout en Afrique.
            </p>
          </div>

          {/* Étapes visuelles */}
          <div className="mb-6 flex items-center justify-center gap-0">
            <Step number={1} label="Compte" active />
            <StepLine />
            <Step number={2} label="Boutique" active={false} />
            <StepLine />
            <Step number={3} label="Produits" active={false} />
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <RegisterSellerForm />
          </div>

          {/* Liens */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-zinc-500">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="font-medium text-zinc-900 underline underline-offset-4 hover:no-underline"
              >
                Se connecter
              </Link>
            </p>
            <p className="text-sm text-zinc-500">
              Vous êtes acheteur ?{" "}
              <Link
                href="/inscription"
                className="font-medium text-zinc-900 underline underline-offset-4 hover:no-underline"
              >
                Créer un compte acheteur
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Step({ number, label, active }: { number: number; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
        active ? "border-black bg-black text-white" : "border-zinc-200 bg-white text-zinc-400"
      }`}>
        {number}
      </div>
      <span className={`text-xs ${active ? "text-zinc-900 font-medium" : "text-zinc-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine() {
  return <div className="w-12 h-px bg-zinc-200 mb-4" />;
}

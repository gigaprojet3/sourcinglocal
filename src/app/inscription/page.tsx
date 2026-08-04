import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegisterBuyerForm } from "@/components/auth/register-buyer-form";

export const metadata: Metadata = {
  title: "Créer un compte Acheteur",
};

export default function InscriptionBuyerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header minimal */}
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      {/* Contenu */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Titre */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Créer un compte Acheteur
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Accédez à des milliers de produits locaux africains authentiques.
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <RegisterBuyerForm />
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
              Vous êtes vendeur ?{" "}
              <Link
                href="/inscription-vendeur"
                className="font-medium text-zinc-900 underline underline-offset-4 hover:no-underline"
              >
                Créer une boutique
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

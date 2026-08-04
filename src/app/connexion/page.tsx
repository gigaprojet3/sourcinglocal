import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function ConnexionPage(props: PageProps<"/connexion">) {
  const { registered, role, callbackUrl } = await props.searchParams as {
    registered?: string;
    role?: string;
    callbackUrl?: string;
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="px-6 py-4 border-b border-zinc-100 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Se connecter
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Acheteur ou vendeur, un seul accès pour votre compte.
            </p>
          </div>

          {/* Message post-inscription */}
          {registered === "1" && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
              ✅ Compte créé avec succès ! Connectez-vous maintenant.
            </div>
          )}

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <LoginForm callbackUrl={callbackUrl} defaultRole={role} />
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-zinc-500">
              Pas encore de compte acheteur ?{" "}
              <Link href="/inscription" className="font-medium text-zinc-900 underline underline-offset-4 hover:no-underline">
                S&apos;inscrire
              </Link>
            </p>
            <p className="text-sm text-zinc-500">
              Vous souhaitez vendre ?{" "}
              <Link href="/inscription-vendeur" className="font-medium text-zinc-900 underline underline-offset-4 hover:no-underline">
                Créer une boutique
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

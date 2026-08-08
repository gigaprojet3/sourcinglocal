"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscribeButtonProps {
  isLoggedIn: boolean;
  isActive: boolean;
}

export function SubscribeButton({ isLoggedIn, isActive }: SubscribeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubscribe() {
    // Non connecté → inscription buyer
    if (!isLoggedIn) {
      router.push("/inscription?redirect=/abonnements");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Appel API serveur — les clés GeniusPay restent côté serveur
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json() as {
        checkout_url?: string;
        error?: string;
      };

      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }

      // Redirection vers la page de paiement GeniusPay
      window.location.href = data.checkout_url;
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (isActive) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Abonnement actif
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={loading}
        size="lg"
        className="w-full gap-2 rounded-xl"
      >
        {loading ? (
          <>
            <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
            Redirection en cours...
          </>
        ) : (
          <>
            <Zap size={16} strokeWidth={1.5} className="text-white" />
            {isLoggedIn ? "S'abonner maintenant" : "Commencer — 1 000 FCFA/mois"}
          </>
        )}
      </Button>

      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}

      {!isLoggedIn && (
        <p className="text-xs text-zinc-400 text-center">
          Vous serez invité à créer un compte gratuitement.
        </p>
      )}
    </div>
  );
}

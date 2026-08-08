"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  whatsapp: string | null;
  productName: string;
  // auth state passé depuis le Server Component
  isAuthenticated: boolean;
  isSubscribed: boolean;
  isBuyer: boolean;
}

/**
 * Logique du bouton :
 * 1. Pas de numéro WhatsApp → bouton grisé désactivé
 * 2. Non authentifié → redirect /inscription
 * 3. Seller connecté → caché (return null)
 * 4. Buyer non abonné → redirect /abonnements
 * 5. Buyer abonné → ouvre WhatsApp avec message pré-rempli
 */
export function WhatsAppButton({
  whatsapp,
  productName,
  isAuthenticated,
  isSubscribed,
  isBuyer,
}: WhatsAppButtonProps) {
  const router = useRouter();

  // Les sellers ne voient pas ce bouton
  if (isAuthenticated && !isBuyer) return null;

  const hasNumber = !!whatsapp?.trim();

  function handleClick() {
    if (!hasNumber) return;

    if (!isAuthenticated) {
      router.push("/inscription");
      return;
    }

    if (!isSubscribed) {
      router.push("/abonnements");
      return;
    }

    // Nettoyer le numéro : retirer espaces, tirets, parenthèses
    const cleaned = whatsapp!.replace(/[\s\-()]/g, "");
    // Enlever le + initial si présent pour l'URL WhatsApp
    const number = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

    const message = encodeURIComponent(
      `Bonjour, je vous contacte via SourcingLocal concernant votre produit : ${productName}. vous en avez encore une bonne partie en Stock ?`
    );

    window.open(`https://wa.me/${number}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  const isDisabled = !hasNumber;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label="Contacter le fournisseur sur WhatsApp"
      className={cn(
        "w-full flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all",
        isDisabled
          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          : "bg-[#25D366] hover:bg-[#1ebe5c] text-white shadow-sm hover:shadow-md active:scale-[0.98]"
      )}
    >
      <MessageCircle
        size={18}
        strokeWidth={1.5}
        className={cn(isDisabled ? "text-zinc-400" : "text-white")}
      />
      {isDisabled
        ? "Numéro WhatsApp non renseigné"
        : isAuthenticated && isSubscribed
          ? "Contacter le fournisseur"
          : "Contacter le fournisseur"}
    </button>
  );
}

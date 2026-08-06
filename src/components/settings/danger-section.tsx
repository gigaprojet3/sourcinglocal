"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, TriangleAlert, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/lib/actions/settings";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const schema = z.object({
  confirmation: z.literal("SUPPRIMER", {
    errorMap: () => ({ message: 'Tapez exactement "SUPPRIMER"' }),
  }),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormData = z.infer<typeof schema>;

export function DangerSection() {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const confirmValue = watch("confirmation") ?? "";
  const isReady = confirmValue === "SUPPRIMER";

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await deleteAccount(data);
    if (!result.success) {
      setServerError(result.error ?? result.fieldErrors?.password?.[0] ?? "Erreur.");
      return;
    }
    // Déconnecter côté client puis rediriger
    await signOut({ callbackUrl: "/" });
  }

  return (
    <section className="bg-white rounded-xl border border-red-100 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
          <TriangleAlert size={14} strokeWidth={1.5} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Zone de danger</h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Ces actions sont irréversibles. Agissez avec précaution.
          </p>
        </div>
      </div>

      {/* Card suppression */}
      <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-zinc-800">Supprimer mon compte</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Supprime définitivement votre compte, votre boutique et tous vos produits.
            Cette action est irréversible.
          </p>
        </div>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-red-600 hover:text-red-700 underline underline-offset-2 hover:no-underline transition-colors"
          >
            Supprimer mon compte
          </button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-1">
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Confirmation textuelle */}
            <div className="space-y-1.5">
              <label className="block text-sm text-zinc-700">
                Tapez{" "}
                <span className="font-mono font-semibold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                  SUPPRIMER
                </span>{" "}
                pour confirmer
              </label>
              <Input
                {...register("confirmation")}
                placeholder="SUPPRIMER"
                className={cn(
                  "font-mono",
                  isReady
                    ? "border-red-300 focus-visible:ring-red-400"
                    : ""
                )}
                autoComplete="off"
              />
              {errors.confirmation && (
                <p className="text-xs text-red-600">{errors.confirmation.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="block text-sm text-zinc-700">
                Confirmez avec votre mot de passe
              </label>
              <div className="relative">
                <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Votre mot de passe"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !isReady}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting
                  ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Suppression...</>
                  : "Confirmer la suppression"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

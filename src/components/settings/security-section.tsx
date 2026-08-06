"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePassword } from "@/lib/actions/settings";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Requis"),
    newPassword: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function SecuritySection() {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSuccess(false);
    const result = await updatePassword(data);
    if (result.success) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 4000);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Sécurité</h2>
        <p className="text-sm text-zinc-400 mt-0.5">
          Modifiez votre mot de passe de connexion.
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
          ✓ Mot de passe mis à jour avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <PasswordField
          label="Mot de passe actuel"
          registration={register("currentPassword")}
          error={errors.currentPassword?.message}
          show={showCurrent}
          onToggle={() => setShowCurrent((p) => !p)}
          placeholder="Votre mot de passe actuel"
          autoComplete="current-password"
        />

        <PasswordField
          label="Nouveau mot de passe"
          registration={register("newPassword")}
          error={errors.newPassword?.message}
          show={showNew}
          onToggle={() => setShowNew((p) => !p)}
          placeholder="Minimum 8 caractères"
          autoComplete="new-password"
        />

        <PasswordField
          label="Confirmer le nouveau mot de passe"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          show={showConfirm}
          onToggle={() => setShowConfirm((p) => !p)}
          placeholder="Répétez le nouveau mot de passe"
          autoComplete="new-password"
        />

        <p className="text-xs text-zinc-400">
          Min. 8 caractères, 1 majuscule et 1 chiffre.
        </p>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting
              ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Mise à jour...</>
              : "Mettre à jour"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function PasswordField({
  label,
  registration,
  error,
  show,
  onToggle,
  placeholder,
  autoComplete,
}: {
  label: string;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
  error?: string;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <div className="relative">
        <Lock size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input
          {...registration}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pl-9 pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
        >
          {show
            ? <EyeOff size={14} strokeWidth={1.5} />
            : <Eye size={14} strokeWidth={1.5} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

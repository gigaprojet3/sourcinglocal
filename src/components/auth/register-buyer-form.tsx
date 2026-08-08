"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, User, Mail, Lock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { registerBuyer } from "@/lib/actions/auth";
import { COUNTRIES, getCitiesByCountry } from "@/lib/geo-data";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
    phone: z.string().min(8, "Numéro invalide"),
    country: z.string().min(1, "Sélectionnez un pays"),
    city: z.string().min(1, "Sélectionnez une ville"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const countryOptions = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  prefix: c.flag,
}));

export function RegisterBuyerForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedCountry = watch("country");
  const selectedCity = watch("city");

  const cityOptions = React.useMemo(
    () =>
      getCitiesByCountry(selectedCountry).map((c) => ({
        value: c.name,
        label: c.name,
      })),
    [selectedCountry]
  );

  // Reset ville quand pays change
  React.useEffect(() => {
    setValue("city", "");
  }, [selectedCountry, setValue]);

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await registerBuyer({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      country: data.country,
      city: data.city,
    });

    if (!result.success) {
      // Afficher l'erreur principale ou le premier fieldError trouvé
      const firstFieldError = result.fieldErrors
        ? Object.values(result.fieldErrors).flat()[0]
        : undefined;
      setServerError(result.error ?? firstFieldError ?? "Une erreur est survenue.");
      return;
    }

    // Connexion automatique après inscription
    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.ok) {
      router.push("/marketplace");
      router.refresh();
    } else {
      router.push("/connexion?registered=1");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Erreur serveur */}
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Nom complet */}
      <Field label="Nom complet" error={errors.name?.message}>
        <div className="relative">
          <User size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("name")}
            placeholder="Jean Dupont"
            className="pl-9"
            autoComplete="name"
          />
        </div>
      </Field>

      {/* Email */}
      <Field label="Adresse email" error={errors.email?.message}>
        <div className="relative">
          <Mail size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("email")}
            type="email"
            placeholder="vous@exemple.com"
            className="pl-9"
            autoComplete="email"
          />
        </div>
      </Field>

      {/* Téléphone */}
      <Field label="Numéro de téléphone" error={errors.phone?.message}>
        <div className="relative">
          <Phone size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("phone")}
            type="tel"
            placeholder="+242 06 000 0000"
            className="pl-9"
            autoComplete="tel"
          />
        </div>
      </Field>

      {/* Pays */}
      <Field label="Pays de résidence" error={errors.country?.message}>
        <Combobox
          options={countryOptions}
          value={selectedCountry ?? ""}
          onChange={(v) => setValue("country", v, { shouldValidate: true })}
          placeholder="Sélectionnez votre pays"
          searchPlaceholder="Rechercher un pays..."
        />
      </Field>

      {/* Ville */}
      <Field label="Ville" error={errors.city?.message}>
        <Combobox
          options={cityOptions}
          value={selectedCity ?? ""}
          onChange={(v) => setValue("city", v, { shouldValidate: true })}
          placeholder={selectedCountry ? "Sélectionnez votre ville" : "Choisissez d'abord un pays"}
          searchPlaceholder="Rechercher une ville..."
          disabled={!selectedCountry}
        />
      </Field>

      {/* Mot de passe */}
      <Field label="Mot de passe" error={errors.password?.message}>
        <div className="relative">
          <Lock size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 caractères"
            className="pl-9 pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword
              ? <EyeOff size={15} strokeWidth={1.5} />
              : <Eye size={15} strokeWidth={1.5} />}
          </button>
        </div>
        <PasswordHint />
      </Field>

      {/* Confirmation */}
      <Field label="Confirmer le mot de passe" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Lock size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder="Répétez le mot de passe"
            className="pl-9 pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            aria-label={showConfirm ? "Masquer" : "Afficher"}
          >
            {showConfirm
              ? <EyeOff size={15} strokeWidth={1.5} />
              : <Eye size={15} strokeWidth={1.5} />}
          </button>
        </div>
      </Field>

      <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 size={15} strokeWidth={1.5} className="animate-spin" />
            Création en cours...
          </>
        ) : (
          "Créer mon compte"
        )}
      </Button>

      <p className="text-center text-xs text-zinc-400 pt-1">
        En créant un compte, vous acceptez nos{" "}
        <a href="/conditions" className="underline hover:no-underline">conditions d&apos;utilisation</a>.
      </p>
    </form>
  );
}

// ── Sous-composants ───────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PasswordHint() {
  return (
    <p className="text-xs text-zinc-400 mt-1">
      Min. 8 caractères, 1 majuscule et 1 chiffre.
    </p>
  );
}

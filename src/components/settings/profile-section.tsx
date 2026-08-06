"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { updateProfile } from "@/lib/actions/settings";
import { COUNTRIES, getCitiesByCountry } from "@/lib/geo-data";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(60),
  phone: z.string().min(8, "Numéro invalide").optional().or(z.literal("")),
  country: z.string().optional(),
  city: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const countryOptions = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  prefix: c.flag,
}));

interface ProfileSectionProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  /** Pays/ville déduits du champ avatar JSON */
  initialCountry?: string;
  initialCity?: string;
}

export function ProfileSection({ user, initialCountry = "", initialCity = "" }: ProfileSectionProps) {
  const router = useRouter();
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      country: initialCountry,
      city: initialCity,
    },
  });

  const selectedCountry = watch("country") ?? "";
  const selectedCity = watch("city") ?? "";

  const cityOptions = React.useMemo(
    () => getCitiesByCountry(selectedCountry).map((c) => ({ value: c.name, label: c.name })),
    [selectedCountry]
  );

  React.useEffect(() => {
    setValue("city", "");
  }, [selectedCountry, setValue]);

  async function onSubmit(data: FormData) {
    setServerError(null);
    setSuccess(false);
    const result = await updateProfile(data);
    if (!result.success) {
      setServerError(result.error ?? "Une erreur est survenue.");
      return;
    }
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Profil personnel</h2>
        <p className="text-sm text-zinc-400 mt-0.5">
          Vos informations visibles sur la plateforme.
        </p>
      </div>

      {/* Avatar */}
      <AvatarUpload name={user.name} currentAvatar={user.avatar} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
            ✓ Profil mis à jour avec succès.
          </div>
        )}

        {/* Email (lecture seule) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Adresse email
          </label>
          <Input
            value={user.email}
            disabled
            className="bg-zinc-50 text-zinc-400 cursor-not-allowed"
          />
          <p className="text-xs text-zinc-400">
            L&apos;email ne peut pas être modifié.
          </p>
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input {...register("name")} placeholder="Jean Dupont" className="pl-9" />
          </div>
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Téléphone
          </label>
          <div className="relative">
            <Phone size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input {...register("phone")} type="tel" placeholder="+242 06 000 0000" className="pl-9" />
          </div>
          {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        {/* Pays + Ville */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Pays</label>
            <Combobox
              options={countryOptions}
              value={selectedCountry}
              onChange={(v) => setValue("country", v)}
              placeholder="Sélectionnez un pays"
              searchPlaceholder="Rechercher..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Ville</label>
            <Combobox
              options={cityOptions}
              value={selectedCity}
              onChange={(v) => setValue("city", v)}
              placeholder={selectedCountry ? "Sélectionnez une ville" : "Choisissez un pays"}
              searchPlaceholder="Rechercher..."
              disabled={!selectedCountry}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || !isDirty} size="sm">
            {isSubmitting
              ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Enregistrement...</>
              : "Enregistrer"}
          </Button>
        </div>
      </form>
    </section>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { updateShop } from "@/lib/actions/settings";
import { COUNTRIES, getCitiesByCountry } from "@/lib/geo-data";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(60),
  description: z.string().max(300, "Maximum 300 caractères").optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[0-9\s\-()]{8,20}$/, "Numéro invalide (ex: +2250748123456)")
    .optional()
    .or(z.literal("")),
  country: z.string().min(1, "Sélectionnez un pays"),
  city: z.string().min(1, "Sélectionnez une ville"),
});
type FormData = z.infer<typeof schema>;

const countryOptions = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  prefix: c.flag,
}));

interface ShopSectionProps {
  shop: {
    name: string;
    description: string | null;
    city: string | null;
    country: string;
    whatsapp: string | null;
    isVerified: boolean;
  };
}

export function ShopSection({ shop }: ShopSectionProps) {
  const router = useRouter();
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Résoudre le code pays depuis le nom stocké
  const initialCountryCode =
    COUNTRIES.find((c) => c.name === shop.country)?.code ?? "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shop.name,
      description: shop.description ?? "",
      whatsapp: shop.whatsapp ?? "",
      country: initialCountryCode,
      city: shop.city ?? "",
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

    // Convertir le code pays en nom complet pour le stockage
    const countryName = COUNTRIES.find((c) => c.code === data.country)?.name ?? data.country;

    const result = await updateShop({
      name: data.name,
      description: data.description,
      city: data.city,
      country: countryName,
      whatsapp: data.whatsapp,
    });

    if (!result.success) {
      setServerError(result.error ?? "Une erreur est survenue.");
      return;
    }
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Ma boutique</h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Informations visibles par les acheteurs.
          </p>
        </div>
        {shop.isVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 shrink-0">
            <ShieldCheck size={12} strokeWidth={1.5} />
            Vérifiée
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
            ✓ Boutique mise à jour.
          </div>
        )}

        {/* Nom boutique */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Nom de la boutique <span className="text-red-500">*</span>
          </label>
          <Input {...register("name")} placeholder="Ex: Karité Nature" maxLength={60} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Description{" "}
            <span className="text-xs font-normal text-zinc-400">(optionnelle)</span>
          </label>
          <textarea
            {...register("description")}
            rows={3}
            maxLength={300}
            placeholder="Décrivez votre boutique..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm placeholder:text-zinc-400 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
          <div className="flex justify-end">
            <span className="text-xs text-zinc-400">
              {watch("description")?.length ?? 0}/300
            </span>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Numéro WhatsApp{" "}
            <span className="text-xs font-normal text-zinc-400">(optionnel)</span>
          </label>
          <div className="relative">
            <Phone size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              {...register("whatsapp")}
              type="tel"
              placeholder="Ex: +2250748123456"
              className="pl-9"
            />
          </div>
          <p className="text-xs text-zinc-400">
            Les acheteurs abonnés vous contacteront via ce numéro WhatsApp.
          </p>
          {errors.whatsapp && <p className="text-xs text-red-600">{errors.whatsapp.message}</p>}
        </div>

        {/* Pays + Ville */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Pays <span className="text-red-500">*</span>
            </label>
            <Combobox
              options={countryOptions}
              value={selectedCountry}
              onChange={(v) => setValue("country", v, { shouldValidate: true })}
              placeholder="Sélectionnez un pays"
              searchPlaceholder="Rechercher..."
            />
            {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Ville <span className="text-red-500">*</span>
            </label>
            <Combobox
              options={cityOptions}
              value={selectedCity}
              onChange={(v) => setValue("city", v, { shouldValidate: true })}
              placeholder={selectedCountry ? "Sélectionnez une ville" : "Choisissez un pays"}
              searchPlaceholder="Rechercher..."
              disabled={!selectedCountry}
            />
            {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
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

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, MapPin, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { createShop } from "@/lib/actions/shop";
import { COUNTRIES, getCitiesByCountry } from "@/lib/geo-data";

const schema = z.object({
  name: z.string().min(2, "Le nom doit avoir au moins 2 caractères").max(60, "Maximum 60 caractères"),
  description: z.string().max(300, "Maximum 300 caractères").optional(),
  country: z.string().min(1, "Sélectionnez un pays"),
  city: z.string().min(1, "Sélectionnez une ville"),
});

type FormData = z.infer<typeof schema>;

const countryOptions = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  prefix: c.flag,
}));

export function CreateShopForm({ sellerName }: { sellerName: string }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: sellerName ? `Boutique de ${sellerName.split(" ")[0]}` : "" },
  });

  const selectedCountry = watch("country");
  const selectedCity = watch("city");
  const shopName = watch("name");

  const cityOptions = React.useMemo(
    () => getCitiesByCountry(selectedCountry).map((c) => ({ value: c.name, label: c.name })),
    [selectedCountry]
  );

  React.useEffect(() => { setValue("city", ""); }, [selectedCountry, setValue]);

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await createShop(data);

    if (!result.success) {
      // Si la boutique existe déjà en DB, c'est qu'une soumission précédente a réussi
      // On redirige directement sans afficher l'erreur
      if (result.error === "Vous avez déjà une boutique.") {
        router.push("/onboarding/produits");
        router.refresh();
        return;
      }
      setServerError(result.error ?? "Une erreur est survenue.");
      return;
    }

    // Succès → étape 3
    router.push("/onboarding/produits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Aperçu slug */}
      {shopName && (
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2">
          <Store size={13} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-400">
            Votre boutique :{" "}
            <span className="font-medium text-zinc-700">{shopName}</span>
          </span>
        </div>
      )}

      {/* Nom de la boutique */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Nom de la boutique <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Store size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input {...register("name")} placeholder="Ex: Karité Nature" className="pl-9" maxLength={60} />
        </div>
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Description{" "}
          <span className="text-zinc-400 font-normal">(optionnelle)</span>
        </label>
        <div className="relative">
          <FileText size={15} strokeWidth={1.5} className="absolute left-3 top-3 text-zinc-400" />
          <textarea
            {...register("description")}
            placeholder="Décrivez votre boutique en quelques mots..."
            maxLength={300}
            rows={3}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
        <p className="text-xs text-zinc-400">
          {watch("description")?.length ?? 0}/300 caractères
        </p>
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      {/* Pays */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Pays d&apos;activité <span className="text-red-500">*</span>
        </label>
        <Combobox
          options={countryOptions}
          value={selectedCountry ?? ""}
          onChange={(v) => setValue("country", v, { shouldValidate: true })}
          placeholder="Sélectionnez votre pays"
          searchPlaceholder="Rechercher un pays..."
        />
        {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
      </div>

      {/* Ville */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Ville <span className="text-red-500">*</span>
        </label>
        <Combobox
          options={cityOptions}
          value={selectedCity ?? ""}
          onChange={(v) => setValue("city", v, { shouldValidate: true })}
          placeholder={selectedCountry ? "Sélectionnez votre ville" : "Choisissez d'abord un pays"}
          searchPlaceholder="Rechercher une ville..."
          disabled={!selectedCountry}
        />
        {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 size={15} strokeWidth={1.5} className="animate-spin" /> Création de la boutique...</>
        ) : (
          "Créer ma boutique →"
        )}
      </Button>
    </form>
  );
}

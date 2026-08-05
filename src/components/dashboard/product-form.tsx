"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Tag, FileText, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { createProduct, updateProduct } from "@/lib/actions/product";
import { COUNTRIES, getCitiesByCountry } from "@/lib/geo-data";

// ── Types ─────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface ProductFormProps {
  categories: Category[];
  /** Si fourni → mode édition */
  productId?: string;
  defaultValues?: {
    name: string;
    description: string;
    priceCfa: number;
    categoryIds: string[];
    originCountry: string;
    originCity: string;
    imageMain: string;
    imageSecond: string;
    inStock: boolean;
  };
}

// ── Schema ────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(100, "Maximum 100 caractères"),
  description: z.string().max(1000, "Maximum 1000 caractères").optional(),
  priceCfa: z.coerce
    .number({ invalid_type_error: "Entrez un prix valide" })
    .int("Le prix doit être un entier")
    .positive("Le prix doit être positif"),
  categoryIds: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une catégorie")
    .max(3, "Maximum 3 catégories"),
  originCountry: z.string().optional(),
  originCity: z.string().optional(),
  imageMain: z.string().min(1, "L'image principale est obligatoire"),
  imageSecond: z.string().optional(),
  inStock: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const countryOptions = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  prefix: c.flag,
}));

// ── Composant ─────────────────────────────────────────────────────────
export function ProductForm({ categories, productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      priceCfa: 0,
      categoryIds: [],
      originCountry: "",
      originCity: "",
      imageMain: "",
      imageSecond: "",
      inStock: true as boolean,
    },
  });

  const selectedCategoryIds = watch("categoryIds") ?? [];
  const imageMain = watch("imageMain");
  const imageSecond = watch("imageSecond");
  const selectedCountry = watch("originCountry") ?? "";
  const selectedCity = watch("originCity") ?? "";

  const cityOptions = React.useMemo(
    () =>
      getCitiesByCountry(selectedCountry).map((c) => ({
        value: c.name,
        label: c.name,
      })),
    [selectedCountry]
  );

  // Reset ville quand le pays change
  React.useEffect(() => {
    setValue("originCity", "");
  }, [selectedCountry, setValue]);

  function toggleCategory(id: string) {
    const current = selectedCategoryIds;
    if (current.includes(id)) {
      setValue("categoryIds", current.filter((c) => c !== id), {
        shouldValidate: true,
      });
    } else {
      if (current.length >= 3) return;
      setValue("categoryIds", [...current, id], { shouldValidate: true });
    }
  }

  async function onSubmit(data: FormData) {
    setServerError(null);

    // Composer l'origine "Ville, Pays"
    const countryName =
      COUNTRIES.find((c) => c.code === data.originCountry)?.name ?? "";
    const origin =
      data.originCity && countryName
        ? `${data.originCity}, ${countryName}`
        : countryName || data.originCity || undefined;

    const payload = {
      name: data.name,
      description: data.description,
      priceCfa: Number(data.priceCfa),
      categoryIds: data.categoryIds,
      origin,
      imageMain: data.imageMain,
      imageSecond: data.imageSecond ?? "",
      inStock: data.inStock,
    };

    const result = isEditing
      ? await updateProduct(productId, payload)
      : await createProduct(payload);

    if (!result.success) {
      setServerError(result.error ?? "Une erreur est survenue.");
      return;
    }

    router.push("/dashboard/seller/produits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Informations générales ── */}
      <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <FileText size={14} strokeWidth={1.5} className="text-black" />
          Informations générales
        </h2>

        {/* Nom */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Nom du produit <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            placeholder="Ex: Boubou Brodé Prestige"
            maxLength={100}
          />
          {errors.name && (
            <p className="text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Description{" "}
            <span className="text-xs font-normal text-zinc-400">(optionnelle)</span>
          </label>
          <textarea
            {...register("description")}
            rows={4}
            maxLength={1000}
            placeholder="Décrivez votre produit : matière, dimensions, utilisation..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
          <div className="flex justify-between">
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-400">
              {watch("description")?.length ?? 0}/1000
            </span>
          </div>
        </div>

        {/* Prix */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">
            Prix <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-xs">
            <Input
              {...register("priceCfa")}
              type="number"
              min={1}
              placeholder="Ex: 15000"
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400">
              FCFA
            </span>
          </div>
          {errors.priceCfa && (
            <p className="text-xs text-red-600">{errors.priceCfa.message}</p>
          )}
        </div>

        {/* Origine géographique — Pays + Ville */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-zinc-700 flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={1.5} className="text-black" />
            Origine du produit{" "}
            <span className="text-xs font-normal text-zinc-400">(optionnelle)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="block text-xs text-zinc-500">Pays</span>
              <Combobox
                options={countryOptions}
                value={selectedCountry}
                onChange={(v) =>
                  setValue("originCountry", v, { shouldValidate: true })
                }
                placeholder="Sélectionnez un pays"
                searchPlaceholder="Rechercher un pays..."
              />
            </div>
            <div className="space-y-1.5">
              <span className="block text-xs text-zinc-500">Ville</span>
              <Combobox
                options={cityOptions}
                value={selectedCity}
                onChange={(v) =>
                  setValue("originCity", v, { shouldValidate: true })
                }
                placeholder={
                  selectedCountry
                    ? "Sélectionnez une ville"
                    : "Choisissez un pays d'abord"
                }
                searchPlaceholder="Rechercher une ville..."
                disabled={!selectedCountry}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Catégories ── */}
      <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Tag size={14} strokeWidth={1.5} className="text-black" />
            Catégories <span className="text-red-500">*</span>
          </h2>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              selectedCategoryIds.length === 3
                ? "text-amber-600"
                : "text-zinc-400"
            )}
          >
            {selectedCategoryIds.length}/3 sélectionnées
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id);
            const disabled = !selected && selectedCategoryIds.length >= 3;
            return (
              <button
                key={cat.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all",
                  selected
                    ? "bg-black text-white border-black"
                    : disabled
                    ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {cat.name}
                {selected && <span className="text-white/60 text-xs">✓</span>}
              </button>
            );
          })}
        </div>

        {errors.categoryIds && (
          <p className="text-xs text-red-600">{errors.categoryIds.message}</p>
        )}
      </section>

      {/* ── Photos ── */}
      <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Package size={14} strokeWidth={1.5} className="text-black" />
          Photos du produit
        </h2>
        <p className="text-xs text-zinc-400">
          Ajoutez jusqu&apos;à 2 photos. La première sera utilisée comme photo
          principale.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploader
            slot="main"
            label="Photo principale"
            required
            value={imageMain ?? ""}
            onChange={(url) =>
              setValue("imageMain", url, { shouldValidate: true })
            }
          />
          <ImageUploader
            slot="second"
            label="Photo secondaire"
            required={false}
            value={imageSecond ?? ""}
            onChange={(url) =>
              setValue("imageSecond", url, { shouldValidate: true })
            }
          />
        </div>

        {errors.imageMain && (
          <p className="text-xs text-red-600">{errors.imageMain.message}</p>
        )}
      </section>

      {/* ── Disponibilité ── */}
      <section className="bg-white rounded-xl border border-zinc-100 p-6">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Package size={14} strokeWidth={1.5} className="text-black" />
          Disponibilité
        </h2>
        <Controller
          control={control}
          name="inStock"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  field.value ? "bg-black" : "bg-zinc-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                    field.value ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <span className="text-sm font-medium text-zinc-700">
                {field.value ? (
                  <span className="text-emerald-700">En stock</span>
                ) : (
                  <span className="text-red-600">En rupture de stock</span>
                )}
              </span>
            </div>
          )}
        />
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/seller/produits")}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            <>
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              {isEditing ? "Enregistrement..." : "Publication..."}
            </>
          ) : isEditing ? (
            "Enregistrer les modifications"
          ) : (
            "Publier le produit"
          )}
        </Button>
      </div>
    </form>
  );
}

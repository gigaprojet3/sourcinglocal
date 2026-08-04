"use client";

import * as React from "react";
import {
  Shirt,
  Sparkles,
  Home,
  Cpu,
  Dumbbell,
  LayoutGrid,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, type Category } from "@/lib/mock-data";

/* Map des icônes par slug de catégorie */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "mode-vetements": Shirt,
  "beaute-soins": Sparkles,
  "maison-decoration": Home,
  electronique: Cpu,
  "sport-fitness": Dumbbell,
};

type FilterSlug = Category | "tous";

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = React.useState<FilterSlug>("tous");

  const filteredProducts = React.useMemo(() => {
    if (activeCategory === "tous") return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(
      (p) => p.category.slug === activeCategory
    );
  }, [activeCategory]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Produits du moment
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Sélection de produits locaux authentiques
          </p>
        </div>
        <span className="text-sm text-zinc-400">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Filtres catégories ── */}
      <div className="mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
          {/* Bouton "Tous" */}
          <CategoryFilterButton
            active={activeCategory === "tous"}
            onClick={() => setActiveCategory("tous")}
            icon={LayoutGrid}
            label="Tous"
            count={MOCK_PRODUCTS.length}
          />

          {MOCK_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? LayoutGrid;
            return (
              <CategoryFilterButton
                key={cat.slug}
                active={activeCategory === cat.slug}
                onClick={() => setActiveCategory(cat.slug as FilterSlug)}
                icon={Icon}
                label={cat.name}
                count={cat.count}
              />
            );
          })}
        </div>
      </div>

      {/* ── Grille produits ── */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* État vide */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <LayoutGrid size={20} strokeWidth={1.5} className="text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-700">
            Aucun produit dans cette catégorie
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Revenez bientôt, de nouveaux produits arrivent chaque jour.
          </p>
        </div>
      )}
    </section>
  );
}

/* ── Composant interne : bouton filtre ── */
interface CategoryFilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
}

function CategoryFilterButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: CategoryFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 whitespace-nowrap shrink-0",
        active
          ? "bg-black text-white border-black shadow-sm"
          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      <Icon
        size={14}
        strokeWidth={1.5}
        className={cn(active ? "text-white" : "text-black")}
      />
      {label}
      <span
        className={cn(
          "text-xs tabular-nums rounded-md px-1.5 py-0.5 font-normal",
          active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-400"
        )}
      >
        {count}
      </span>
    </button>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/geo-data";

const CATEGORIES = [
  { slug: "mode-vetements",    name: "Mode & Vêtements" },
  { slug: "beaute-soins",      name: "Beauté & Soins" },
  { slug: "maison-decoration", name: "Maison & Décoration" },
  { slug: "electronique",      name: "Électronique & High-Tech" },
  { slug: "sport-fitness",     name: "Sport & Fitness" },
];

// ── Hook partagé ──────────────────────────────────────────────────────
function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("categorie") ?? "";
  const activeCountry  = searchParams.get("pays") ?? "";
  const activeFilterCount = [activeCategory, activeCountry].filter(Boolean).length;

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAllFilters() {
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { activeCategory, activeCountry, activeFilterCount, applyFilter, clearAllFilters, searchParams, pathname, router };
}

// ── Contenu des filtres (réutilisé sidebar + drawer) ──────────────────
function FiltersContent({
  activeCategory,
  activeCountry,
  activeFilterCount,
  applyFilter,
  clearAllFilters,
}: {
  activeCategory: string;
  activeCountry: string;
  activeFilterCount: number;
  applyFilter: (key: string, value: string) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Catégories */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Catégories
        </p>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => applyFilter("categorie", cat.slug)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                activeCategory === cat.slug
                  ? "bg-black text-white font-medium"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      {/* Pays d'origine */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Pays d&apos;origine
        </p>
        <div className="space-y-0.5">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => applyFilter("pays", country.code)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5",
                activeCountry === country.code
                  ? "bg-black text-white font-medium"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <span className="text-base leading-none shrink-0">{country.flag}</span>
              <span className="truncate">{country.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Réinitialiser */}
      {activeFilterCount > 0 && (
        <>
          <div className="h-px bg-zinc-100" />
          <button
            type="button"
            onClick={clearAllFilters}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors border border-zinc-200"
          >
            <X size={13} strokeWidth={1.5} />
            Réinitialiser
          </button>
        </>
      )}
    </div>
  );
}

// ── Barre de recherche + bouton filtres mobile ────────────────────────
export function MarketplaceSearchBar() {
  const { searchParams, pathname, router, activeFilterCount } = useFilters();
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [showDrawer, setShowDrawer] = React.useState(false);
  const { activeCategory, activeCountry, applyFilter, clearAllFilters } = useFilters();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Barre recherche + bouton filtres mobile */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-9 bg-white"
          />
        </div>

        {/* Bouton filtres — mobile uniquement */}
        <button
          type="button"
          onClick={() => setShowDrawer(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0"
        >
          <SlidersHorizontal size={15} strokeWidth={1.5} className="text-black" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer filtres mobile */}
      {showDrawer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDrawer(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl border-t border-zinc-100 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 sticky top-0 bg-white">
              <span className="text-sm font-semibold text-zinc-900">Filtres</span>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
              >
                <X size={14} strokeWidth={1.5} className="text-black" />
              </button>
            </div>
            <div className="px-5 py-5">
              <FiltersContent
                activeCategory={activeCategory}
                activeCountry={activeCountry}
                activeFilterCount={activeFilterCount}
                applyFilter={applyFilter}
                clearAllFilters={clearAllFilters}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Sidebar filtres desktop ───────────────────────────────────────────
export function MarketplaceSidebar() {
  const { activeCategory, activeCountry, activeFilterCount, applyFilter, clearAllFilters } =
    useFilters();

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <FiltersContent
        activeCategory={activeCategory}
        activeCountry={activeCountry}
        activeFilterCount={activeFilterCount}
        applyFilter={applyFilter}
        clearAllFilters={clearAllFilters}
      />
    </aside>
  );
}

// ── Export combiné (pour compatibilité avec le code existant) ─────────
export function MarketplaceFilters() {
  return (
    <>
      <MarketplaceSearchBar />
      <MarketplaceSidebar />
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatCfa } from "@/lib/utils";
import { toggleProductStock, deleteProduct } from "@/lib/actions/product";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────
interface ProductRow {
  id: string;
  name: string;
  slug: string;
  priceCfa: number;
  inStock: boolean;
  images: string;
  createdAt: Date;
  viewCount: number;
  categories: { category: { name: string; slug: string } }[];
}

interface ProductsTableProps {
  products: ProductRow[];
  allCategories: { id: string; name: string; slug: string }[];
}

type FilterStatus = "all" | "inStock" | "outOfStock";

// ── Composant principal ───────────────────────────────────────────────
export function ProductsTable({ products, allCategories }: ProductsTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState<FilterStatus>("all");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  // ── Filtrage ─────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        filterCategory === "all" ||
        p.categories.some((pc) => pc.category.slug === filterCategory);
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "inStock" && p.inStock) ||
        (filterStatus === "outOfStock" && !p.inStock);
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, filterCategory, filterStatus]);

  // ── Actions ───────────────────────────────────────────────────────────
  async function handleToggleStock(id: string) {
    setLoadingId(id);
    setOpenMenuId(null);
    await toggleProductStock(id);
    router.refresh();
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    setLoadingId(id);
    setConfirmDeleteId(null);
    setOpenMenuId(null);
    await deleteProduct(id);
    router.refresh();
    setLoadingId(null);
  }

  // Fermer menu si clic ailleurs
  React.useEffect(() => {
    function close() { setOpenMenuId(null); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Barre filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Filtre catégorie */}
          <FilterSelect
            value={filterCategory}
            onChange={setFilterCategory}
            options={[
              { value: "all", label: "Toutes catégories" },
              ...allCategories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />

          {/* Filtre statut */}
          <FilterSelect
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as FilterStatus)}
            options={[
              { value: "all", label: "Tous les statuts" },
              { value: "inStock", label: "En stock" },
              { value: "outOfStock", label: "En rupture" },
            ]}
          />
        </div>
      </div>

      {/* ── Compteur ── */}
      <p className="text-xs text-zinc-400">
        {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
        {(search || filterCategory !== "all" || filterStatus !== "all") && (
          <button
            onClick={() => { setSearch(""); setFilterCategory("all"); setFilterStatus("all"); }}
            className="ml-2 text-zinc-500 underline hover:no-underline"
          >
            Réinitialiser
          </button>
        )}
      </p>

      {/* ── Tableau ── */}
      {filtered.length === 0 ? (
        <EmptyState hasFilters={!!(search || filterCategory !== "all" || filterStatus !== "all")} />
      ) : (
        <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
          {/* Header tableau */}
          <div className="hidden md:grid grid-cols-[48px_1fr_160px_120px_100px_80px_48px] gap-4 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
            <div />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Produit</span>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Catégories</span>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Prix</span>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Statut</span>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Vues</span>
            <div />
          </div>

          {/* Lignes */}
          {filtered.map((product, idx) => {
            let images: string[] = [];
            try { images = JSON.parse(product.images); } catch { images = []; }
            const thumb = images[0];
            const isLoading = loadingId === product.id;

            return (
              <div
                key={product.id}
                className={cn(
                  "grid grid-cols-[48px_1fr_auto] md:grid-cols-[48px_1fr_160px_120px_100px_80px_48px] gap-4 items-center px-4 py-3 transition-colors hover:bg-zinc-50",
                  idx !== filtered.length - 1 && "border-b border-zinc-50",
                  isLoading && "opacity-50"
                )}
              >
                {/* Miniature */}
                <div className="w-11 h-11 rounded-lg bg-zinc-100 overflow-hidden shrink-0 relative">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} strokeWidth={1.5} className="text-zinc-300" />
                    </div>
                  )}
                </div>

                {/* Nom + date */}
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/seller/produits/${product.id}/modifier`}
                    className="font-medium text-sm text-zinc-900 hover:underline truncate block"
                  >
                    {product.name}
                  </Link>
                  <span className="text-xs text-zinc-400">
                    {new Date(product.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>

                {/* Catégories — masqué sur mobile */}
                <div className="hidden md:flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map((pc) => (
                    <Badge key={pc.category.slug} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      {pc.category.name}
                    </Badge>
                  ))}
                  {product.categories.length > 2 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                      +{product.categories.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Prix */}
                <span className="hidden md:block text-sm font-semibold text-zinc-900 tabular-nums">
                  {formatCfa(product.priceCfa)}
                </span>

                {/* Statut stock */}
                <div className="hidden md:flex">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                    product.inStock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      product.inStock ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    {product.inStock ? "En stock" : "Rupture"}
                  </span>
                </div>

                {/* Vues */}
                <span className="hidden md:block text-sm text-zinc-400 tabular-nums">
                  {product.viewCount}
                </span>

                {/* Menu actions */}
                <div
                  className="relative flex justify-end"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                    aria-label="Actions"
                  >
                    {isLoading
                      ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                      : <MoreHorizontal size={16} strokeWidth={1.5} />
                    }
                  </button>

                  {openMenuId === product.id && (
                    <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl border border-zinc-100 bg-white shadow-lg shadow-zinc-200/50 py-1">
                      <Link
                        href={`/dashboard/seller/produits/${product.id}/modifier`}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <Pencil size={13} strokeWidth={1.5} className="text-black" />
                        Modifier
                      </Link>

                      <button
                        onClick={() => handleToggleStock(product.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        {product.inStock
                          ? <ToggleLeft size={13} strokeWidth={1.5} className="text-black" />
                          : <ToggleRight size={13} strokeWidth={1.5} className="text-black" />
                        }
                        {product.inStock ? "Passer en rupture" : "Remettre en stock"}
                      </button>

                      <div className="h-px bg-zinc-100 my-1" />

                      {confirmDeleteId === product.id ? (
                        <div className="px-3 py-2 space-y-2">
                          <p className="text-xs text-red-600 font-medium">Confirmer la suppression ?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex-1 text-xs bg-red-600 text-white rounded-md py-1 hover:bg-red-700 transition-colors"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex-1 text-xs border border-zinc-200 rounded-md py-1 hover:bg-zinc-50 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(product.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Composants utilitaires ────────────────────────────────────────────

function FilterSelect({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={1.5}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
      />
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
        <Package size={20} strokeWidth={1.5} className="text-zinc-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-700">
          {hasFilters ? "Aucun produit ne correspond à votre recherche" : "Aucun produit pour l'instant"}
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          {hasFilters
            ? "Essayez de modifier vos filtres."
            : "Ajoutez votre premier produit pour commencer à vendre."}
        </p>
      </div>
      {!hasFilters && (
        <Link href="/dashboard/seller/produits/nouveau">
          <Button size="sm" className="gap-1.5 mt-1">
            <Plus size={13} strokeWidth={1.5} className="text-white" />
            Ajouter un produit
          </Button>
        </Link>
      )}
    </div>
  );
}

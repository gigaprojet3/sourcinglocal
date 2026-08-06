"use client";

import * as React from "react";
import { Loader2, PackageSearch } from "lucide-react";
import { MarketplaceCard, type MarketplaceProduct } from "@/components/marketplace/marketplace-card";
import { Button } from "@/components/ui/button";

interface MarketplaceGridProps {
  initialProducts: MarketplaceProduct[];
  initialTotal: number;
  pageSize: number;
  searchParams: {
    q?: string;
    categorie?: string;
    pays?: string;
  };
}

export function MarketplaceGrid({
  initialProducts,
  initialTotal,
  pageSize,
  searchParams,
}: MarketplaceGridProps) {
  const [products, setProducts] = React.useState<MarketplaceProduct[]>(initialProducts);
  const [total, setTotal] = React.useState(initialTotal);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // Reset quand les filtres changent (nouveaux initialProducts du Server)
  React.useEffect(() => {
    setProducts(initialProducts);
    setTotal(initialTotal);
    setPage(1);
  }, [initialProducts, initialTotal]);

  const hasMore = products.length < total;

  async function loadMore() {
    setLoading(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams();
      if (searchParams.q) params.set("q", searchParams.q);
      if (searchParams.categorie) params.set("categorie", searchParams.categorie);
      if (searchParams.pays) params.set("pays", searchParams.pays);
      params.set("page", String(nextPage));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/marketplace/products?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur réseau");

      const data = await res.json() as {
        products: MarketplaceProduct[];
        total: number;
      };

      setProducts((prev) => [...prev, ...data.products]);
      setTotal(data.total);
      setPage(nextPage);
    } catch {
      // Silencieux — on garde les produits actuels
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
          <PackageSearch size={24} strokeWidth={1.5} className="text-zinc-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-700">
            Aucun produit trouvé
          </p>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Essayez d&apos;autres mots-clés ou modifiez vos filtres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grille */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <MarketplaceCard key={product.id} product={product} />
        ))}
      </div>

      {/* Compteur + Load more */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-zinc-400">
          {products.length} sur {total} produits
        </p>

        {hasMore && (
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="gap-2 min-w-[160px]"
          >
            {loading ? (
              <>
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                Chargement...
              </>
            ) : (
              "Charger plus"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

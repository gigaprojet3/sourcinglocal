import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { COUNTRIES } from "@/lib/geo-data";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { MarketplaceSearchBar, MarketplaceSidebar } from "@/components/marketplace/marketplace-filters";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";

export const metadata: Metadata = {
  title: "Marketplace — Produits locaux africains",
  description:
    "Découvrez des milliers de produits locaux authentiques auprès de vendeurs vérifiés en Afrique.",
};

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    pays?: string;
  }>;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q         = params.q         ?? "";
  const categorie = params.categorie ?? "";
  const pays      = params.pays      ?? "";

  const countryName = pays
    ? (COUNTRIES.find((c) => c.code === pays)?.name ?? "")
    : "";

  const where = buildWhere(q, categorie, countryName);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceCfa: true,
        images: true,
        origin: true,
        shop: {
          select: { name: true, slug: true, isVerified: true },
        },
        categories: {
          select: {
            category: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const headingLabel =
    getCategoryName(categorie)
    ?? (pays ? (COUNTRIES.find((c) => c.code === pays)?.name ?? null) : null)
    ?? (q ? `"${q}"` : null);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {headingLabel ? (
              <>
                <span className="text-zinc-400 font-normal text-lg mr-2">
                  Marketplace /
                </span>
                {headingLabel}
              </>
            ) : (
              "Marketplace"
            )}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {total === 0
              ? "Aucun produit trouvé"
              : `${total} produit${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Barre recherche + bouton filtres mobile (pleine largeur) */}
        <Suspense>
          <MarketplaceSearchBar />
        </Suspense>

        {/* Layout : sidebar gauche + grille droite */}
        <div className="lg:flex lg:items-start lg:gap-8">

          {/* Sidebar filtres — desktop uniquement */}
          <Suspense>
            <MarketplaceSidebar />
          </Suspense>

          {/* Grille produits */}
          <div className="flex-1 min-w-0">
            <MarketplaceGrid
              initialProducts={products}
              initialTotal={total}
              pageSize={PAGE_SIZE}
              searchParams={{ q, categorie, pays }}
            />
          </div>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function buildWhere(q: string, categorie: string, countryName: string) {
  const conditions: object[] = [
    { isActive: true },
    { inStock: true },
  ];
  if (q)          conditions.push({ name: { contains: q } });
  if (categorie)  conditions.push({ categories: { some: { category: { slug: categorie } } } });
  if (countryName) conditions.push({ origin: { contains: countryName } });
  return { AND: conditions };
}

function getCategoryName(slug: string): string | null {
  const map: Record<string, string> = {
    "mode-vetements":    "Mode & Vêtements",
    "beaute-soins":      "Beauté & Soins",
    "maison-decoration": "Maison & Décoration",
    "electronique":      "Électronique & High-Tech",
    "sport-fitness":     "Sport & Fitness",
  };
  return map[slug] ?? null;
}

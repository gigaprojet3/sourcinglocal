import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Store,
  ShieldCheck,
  ChevronRight,
  Tag,
  PackageX,
  PackageCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { WhatsAppButton } from "@/components/product/whatsapp-button";
import { formatCfa } from "@/lib/utils";

// ── Metadata dynamique ────────────────────────────────────────────────
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description:
      product.description ?? `Découvrez ${product.name} sur SourcingLocal.`,
  };
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function ProductDetailPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;

  // ── Produit + catégories ──────────────────────────────────────────
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!product) notFound();

  // ── Boutique (requête séparée pour supporter whatsapp) ────────────
  // On passe par $queryRaw pour lire whatsapp sans dépendre
  // de la version du client Prisma en cache dans le process.
  const shopRows = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      slug: string;
      city: string | null;
      country: string;
      description: string | null;
      isVerified: number;   // SQLite stocke les booléens en 0/1
      whatsapp: string | null;
    }[]
  >`
    SELECT id, name, slug, city, country, description, isVerified, whatsapp
    FROM Shop
    WHERE id = ${product.shopId}
    LIMIT 1
  `;

  const shopData = shopRows[0] ?? null;

  // SQLite renvoie 0/1 pour les booléens
  const shop = shopData
    ? {
        ...shopData,
        isVerified: shopData.isVerified === 1 || (shopData.isVerified as unknown) === true,
      }
    : null;

  // ── Session + abonnement ──────────────────────────────────────────
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const isBuyer = session?.user?.role === "BUYER";

  let isSubscribed = false;
  if (isAuthenticated && isBuyer && session.user.id) {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, currentPeriodEnd: true },
    });
    isSubscribed =
      sub?.status === "ACTIVE" &&
      !!sub.currentPeriodEnd &&
      sub.currentPeriodEnd > new Date();
  }

  // ── Images ────────────────────────────────────────────────────────
  let images: string[] = [];
  try { images = JSON.parse(product.images); } catch { images = []; }

  const mainCategory = product.categories[0]?.category;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Fil d'Ariane ── */}
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6 flex-wrap"
        >
          <Link href="/marketplace" className="hover:text-zinc-700 transition-colors">
            Marketplace
          </Link>
          {mainCategory && (
            <>
              <ChevronRight size={12} strokeWidth={1.5} />
              <Link
                href={`/marketplace?categorie=${mainCategory.slug}`}
                className="hover:text-zinc-700 transition-colors"
              >
                {mainCategory.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} strokeWidth={1.5} />
          <span className="text-zinc-600 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* ── Layout deux colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Colonne gauche : Gallery */}
          <div>
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* Colonne droite : Infos */}
          <div className="space-y-6">

            {/* Catégories */}
            <div className="flex flex-wrap gap-2">
              {product.categories.map(({ category }) => (
                <Link
                  key={category.slug}
                  href={`/marketplace?categorie=${category.slug}`}
                >
                  <Badge
                    variant="secondary"
                    className="gap-1 hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <Tag size={10} strokeWidth={1.5} />
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Nom + Prix + Stock */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-zinc-900 tabular-nums">
                  {formatCfa(product.priceCfa)}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    product.inStock
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}
                >
                  {product.inStock ? (
                    <><PackageCheck size={13} strokeWidth={1.5} /> En stock</>
                  ) : (
                    <><PackageX size={13} strokeWidth={1.5} /> Rupture de stock</>
                  )}
                </span>
              </div>
            </div>

            {/* Origine */}
            {product.origin && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <MapPin size={14} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
                <span>{product.origin}</span>
              </div>
            )}

            <div className="h-px bg-zinc-100" />

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
                  Description
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="h-px bg-zinc-100" />

            {/* Carte Boutique */}
            {shop && (
              <div className="bg-white rounded-xl border border-zinc-100 p-4 space-y-3">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Vendu par
                </h2>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Store size={15} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
                      <span className="text-sm font-semibold text-zinc-900">
                        {shop.name}
                      </span>
                      {shop.isVerified && (
                        <ShieldCheck
                          size={14}
                          strokeWidth={1.5}
                          className="text-black shrink-0"
                          aria-label="Boutique vérifiée"
                        />
                      )}
                    </div>
                    {(shop.city || shop.country) && (
                      <div className="flex items-center gap-1 pl-0.5">
                        <MapPin size={12} strokeWidth={1.5} className="text-zinc-300 shrink-0" />
                        <span className="text-xs text-zinc-400">
                          {[shop.city, shop.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {shop.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {shop.description}
                      </p>
                    )}
                  </div>

                  {shop.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 shrink-0 whitespace-nowrap">
                      <ShieldCheck size={10} strokeWidth={1.5} />
                      Vérifié
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bouton WhatsApp */}
            <WhatsAppButton
              whatsapp={shop?.whatsapp ?? null}
              productName={product.name}
              isAuthenticated={isAuthenticated}
              isSubscribed={isSubscribed}
              isBuyer={isBuyer}
            />

            {/* Indication contextuelle */}
            {isAuthenticated && isBuyer && !isSubscribed && shop?.whatsapp && (
              <p className="text-xs text-center text-zinc-400">
                <Link
                  href="/abonnements"
                  className="text-zinc-600 underline underline-offset-2 hover:no-underline"
                >
                  Abonnez-vous
                </Link>{" "}
                pour contacter ce fournisseur directement.
              </p>
            )}

            {!isAuthenticated && shop?.whatsapp && (
              <p className="text-xs text-center text-zinc-400">
                <Link
                  href="/inscription"
                  className="text-zinc-600 underline underline-offset-2 hover:no-underline"
                >
                  Créez un compte
                </Link>{" "}
                et abonnez-vous pour contacter ce fournisseur.
              </p>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

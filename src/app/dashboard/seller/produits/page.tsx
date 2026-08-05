import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/dashboard/products-table";

export const metadata: Metadata = { title: "Mes produits" };

export default async function MesProduitsPage() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") redirect("/connexion");

  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, name: true },
  });
  if (!shop) redirect("/onboarding/boutique");

  // Charger tous les produits de la boutique
  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  });

  // Toutes les catégories pour le filtre
  const allCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Stats rapides
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Mes produits</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Boutique :{" "}
            <span className="font-medium text-zinc-600">{shop.name}</span>
          </p>
        </div>
        <Link href="/dashboard/seller/produits/nouveau">
          <Button className="gap-2">
            <Plus size={15} strokeWidth={1.5} className="text-white" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={totalProducts} />
        <StatCard
          label="En stock"
          value={inStockCount}
          color="text-emerald-700"
          bg="bg-emerald-50"
        />
        <StatCard
          label="En rupture"
          value={outOfStockCount}
          color="text-red-600"
          bg="bg-red-50"
        />
      </div>

      {/* ── Tableau ── */}
      <ProductsTable products={products} allCategories={allCategories} />
    </div>
  );
}

function StatCard({
  label, value, color = "text-zinc-900", bg = "bg-white",
}: {
  label: string;
  value: number;
  color?: string;
  bg?: string;
}) {
  return (
    <div className={`rounded-xl border border-zinc-100 ${bg} px-4 py-3`}>
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

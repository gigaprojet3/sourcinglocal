import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Package,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Store,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") redirect("/connexion");

  if (!session.user.hasShop) redirect("/onboarding/boutique");

  // ── Boutique + compteur produits ──────────────────────────────────
  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      isVerified: true,
    },
  });

  if (!shop) redirect("/onboarding/boutique");

  // ── Derniers produits (new schema: categories many-to-many) ───────
  const recentProducts = await prisma.product.findMany({
    where: { shopId: shop.id, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      priceCfa: true,
      categories: {
        take: 1,
        select: { category: { select: { name: true } } },
      },
    },
  });

  // ── Compteur total ────────────────────────────────────────────────
  const productCount = await prisma.product.count({
    where: { shopId: shop.id },
  });

  const stats = [
    { label: "Produits", value: productCount, icon: Package, href: "/dashboard/seller/produits" },
    { label: "Vues ce mois", value: "—", icon: Eye, href: "#" },
    { label: "Messages", value: "—", icon: MessageSquare, href: "/dashboard/seller/messages" },
    { label: "Contacts", value: "—", icon: TrendingUp, href: "#" },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Store size={15} strokeWidth={1.5} className="text-zinc-700" />
            </div>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {shop.isVerified ? "Boutique vérifiée ✓" : "En attente de vérification"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Bonjour, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Boutique :{" "}
            <span className="font-medium text-zinc-700">{shop.name}</span>
          </p>
        </div>
        <Link href="/dashboard/seller/produits">
          <Button variant="outline" className="gap-2">
            <Package size={15} strokeWidth={1.5} className="text-black" />
            Mes produits
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-zinc-200 hover:shadow-sm transition-all cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    {label}
                  </CardTitle>
                  <Icon size={14} strokeWidth={1.5} className="text-black" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-zinc-900 tabular-nums">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Derniers produits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-900">Derniers produits</h2>
          <Link
            href="/dashboard/seller/produits"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            Voir tout
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                <Package size={18} strokeWidth={1.5} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700">
                  Aucun produit pour l&apos;instant
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Ajoutez votre premier produit pour commencer à vendre.
                </p>
              </div>
              <Link href="/dashboard/seller/produits/nouveau">
                <Button size="sm" variant="outline" className="gap-1.5 mt-1">
                  <Plus size={13} strokeWidth={1.5} className="text-black" />
                  Ajouter un produit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    Produit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden sm:table-cell">
                    Catégorie
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    Prix
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-800 truncate max-w-[200px]">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">
                      {product.categories[0]?.category.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-900 tabular-nums whitespace-nowrap">
                      {product.priceCfa.toLocaleString("fr-FR")} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/actions/product";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Modifier le produit" };

export default async function ModifierProduitPage(
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") redirect("/connexion");

  const { id } = await props.params;

  const product = await prisma.product.findFirst({
    where: { id, shop: { ownerId: session.user.id } },
    include: {
      categories: { include: { category: true } },
    },
  });

  if (!product) notFound();

  const categories = await getCategories();

  // Parser les images JSON
  let images: string[] = [];
  try { images = JSON.parse(product.images); } catch { images = []; }

  const defaultValues = {
    name: product.name,
    description: product.description ?? "",
    priceCfa: product.priceCfa,
    categoryIds: product.categories.map((pc) => pc.categoryId),
    origin: product.origin ?? "",
    imageMain: images[0] ?? "",
    imageSecond: images[1] ?? "",
    inStock: product.inStock,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/seller/produits"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.5} className="text-black" />
          Mes produits
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Modifier le produit</h1>
        <p className="text-sm text-zinc-400 mt-1 truncate">{product.name}</p>
      </div>

      <ProductForm
        categories={categories}
        productId={product.id}
        defaultValues={defaultValues}
      />
    </div>
  );
}

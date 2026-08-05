import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/actions/product";
import { ProductForm } from "@/components/dashboard/product-form";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NouveauProduitPage() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") redirect("/connexion");

  const categories = await getCategories();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <Link
          href="/dashboard/seller/produits"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.5} className="text-black" />
          Mes produits
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Nouveau produit</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Votre produit sera publié immédiatement après validation.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Store, ShieldCheck } from "lucide-react";
import { formatCfa } from "@/lib/utils";

export interface MarketplaceProduct {
  id: string;
  name: string;
  slug: string;
  priceCfa: number;
  images: string;
  origin: string | null;
  shop: {
    name: string;
    slug: string;
    isVerified: boolean;
  };
  categories: {
    category: { name: string; slug: string };
  }[];
}

interface MarketplaceCardProps {
  product: MarketplaceProduct;
}

export function MarketplaceCard({ product }: MarketplaceCardProps) {
  let imageUrl = "";
  try {
    const imgs: string[] = JSON.parse(product.images);
    imageUrl = imgs[0] ?? "";
  } catch {
    imageUrl = "";
  }

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-md hover:shadow-zinc-100/60 transition-all duration-200"
    >
      {/* ── Image ── */}
      <div className="relative aspect-square bg-zinc-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Store size={32} strokeWidth={1} className="text-zinc-200" />
          </div>
        )}
      </div>

      {/* ── Infos ── */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        {/* Nom produit */}
        <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-black">
          {product.name}
        </h3>

        {/* Prix */}
        <p className="text-base font-bold text-zinc-900 tabular-nums">
          {formatCfa(product.priceCfa)}
        </p>

        {/* Boutique */}
        <div className="flex items-center gap-1 mt-auto pt-1 border-t border-zinc-50">
          <Store size={11} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">{product.shop.name}</span>
          {product.shop.isVerified && (
            <ShieldCheck
              size={11}
              strokeWidth={1.5}
              className="text-black shrink-0 ml-auto"
              aria-label="Vendeur vérifié"
            />
          )}
        </div>

        {/* Origine */}
        {product.origin && (
          <div className="flex items-center gap-1">
            <MapPin size={11} strokeWidth={1.5} className="text-zinc-300 shrink-0" />
            <span className="text-xs text-zinc-400 truncate">{product.origin}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

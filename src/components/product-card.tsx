import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCfa } from "@/lib/utils";
import type { MockProduct } from "@/lib/mock-data";

interface ProductCardProps {
  product: MockProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const {
    name,
    slug,
    description,
    priceCfa,
    images,
    origin,
    isFeatured,
    shop,
    reviewCount,
    averageRating,
  } = product;

  const imageUrl = images[0] ?? "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80";

  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md hover:shadow-zinc-200/60",
        className
      )}
    >
      {/* ── Image ── */}
      <Link href={`/produits/${slug}`} className="block overflow-hidden relative aspect-[4/3] bg-zinc-50">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="text-[10px] px-2 py-0.5 shadow-sm">
              Vedette
            </Badge>
          </div>
        )}
      </Link>

      {/* ── Contenu ── */}
      <CardContent className="flex flex-col flex-1 gap-2 pt-4">
        {/* Boutique */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-400 truncate">{shop.name}</span>
          {shop.isVerified && (
            <ShieldCheck
              size={12}
              strokeWidth={1.5}
              className="text-black shrink-0"
              aria-label="Vendeur vérifié"
            />
          )}
        </div>

        {/* Nom produit */}
        <Link href={`/produits/${slug}`}>
          <h3 className="font-semibold text-sm text-zinc-900 leading-snug line-clamp-2 hover:text-black transition-colors">
            {name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{description}</p>

        {/* Origine */}
        <div className="flex items-center gap-1 mt-auto">
          <MapPin size={11} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">{origin}</span>
        </div>
      </CardContent>

      {/* ── Footer ── */}
      <CardFooter className="flex items-center justify-between pt-3 pb-4 border-t border-zinc-50">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-zinc-900 tabular-nums">
            {formatCfa(priceCfa)}
          </span>
          {/* Note */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star
                size={11}
                strokeWidth={1.5}
                className="text-black fill-black"
              />
              <span className="text-xs text-zinc-500">
                {averageRating.toFixed(1)}{" "}
                <span className="text-zinc-400">({reviewCount})</span>
              </span>
            </div>
          )}
        </div>
        <Link href={`/produits/${slug}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs rounded-lg"
          >
            Voir
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

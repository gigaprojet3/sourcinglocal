"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = React.useState(0);

  const hasSecond = images.length > 1;
  const mainImage = images[selected] ?? images[0];

  return (
    <div className="space-y-3">
      {/* Image principale */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-200"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-zinc-300 text-sm">Aucune image</span>
          </div>
        )}
      </div>

      {/* Miniatures (si 2 images) */}
      {hasSecond && (
        <div className="flex gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelected(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                selected === idx
                  ? "border-black shadow-sm"
                  : "border-zinc-100 hover:border-zinc-300"
              )}
              aria-label={`Image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

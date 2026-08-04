import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "2 400+", label: "Produits locaux" },
  { value: "380+", label: "Vendeurs vérifiés" },
  { value: "12", label: "Pays africains" },
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Vendeurs vérifiés",
  },
  {
    icon: MapPin,
    label: "Origine garantie",
  },
  {
    icon: Star,
    label: "Avis authentiques",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Fond décoratif — grille légère */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #e4e4e7 1px, transparent 0)",
          backgroundSize: "32px 32px",
          opacity: 0.4,
        }}
      />

      {/* Dégradé blanc pour adoucir le bas */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, white)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center py-20 md:py-28 lg:py-32">

          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-zinc-600">
              La marketplace des produits locaux africains
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-[1.1]">
            Sourcez local,{" "}
            <span className="relative inline-block">
              <span className="relative z-10">achetez authentique</span>
              {/* Soulignement décoratif */}
              <span
                className="absolute bottom-1 left-0 right-0 h-3 -z-0 rounded"
                style={{ background: "rgba(22, 163, 74, 0.12)" }}
                aria-hidden="true"
              />
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="mt-6 max-w-xl text-base text-zinc-500 leading-relaxed sm:text-lg">
            Découvrez des milliers de produits authentiques directement auprès
            de fournisseurs locaux africains vérifiés. Paiement en{" "}
            <span className="font-medium text-zinc-700">FCFA</span>, livraison locale.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/produits">
              <Button size="lg" className="gap-2 rounded-xl px-8 shadow-sm">
                Explorer les produits
                <ArrowRight size={16} strokeWidth={1.5} className="text-white" />
              </Button>
            </Link>
            <Link href="/inscription-vendeur">
              <Button variant="outline" size="lg" className="gap-2 rounded-xl px-8">
                Vendre sur SourcingLocal
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-zinc-900 tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-400 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2"
              >
                <Icon
                  size={15}
                  strokeWidth={1.5}
                  className="text-black shrink-0"
                />
                <span className="text-xs font-medium text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES = [
  { label: "Mode & Vêtements", href: "/categorie/mode-vetements" },
  { label: "Beauté & Soins", href: "/categorie/beaute-soins" },
  { label: "Maison & Décoration", href: "/categorie/maison-decoration" },
  { label: "Électronique", href: "/categorie/electronique" },
  { label: "Sport & Fitness", href: "/categorie/sport-fitness" },
];

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/95 backdrop-blur-sm">
      {/* ── Barre principale ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>

          {/* ── Recherche desktop ── */}
          <div className="hidden flex-1 max-w-md md:flex">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={16}
                strokeWidth={1.5}
              />
              <Input
                type="search"
                placeholder="Rechercher des produits, boutiques..."
                className="pl-9 pr-4 h-10 rounded-lg bg-zinc-50 border-zinc-200 focus-visible:bg-white"
              />
            </div>
          </div>

          {/* ── Actions desktop ── */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Catégories dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
                aria-expanded={isCategoriesOpen}
              >
                Catégories
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className={cn(
                    "text-zinc-400 transition-transform duration-200",
                    isCategoriesOpen && "rotate-180"
                  )}
                />
              </button>

              {isCategoriesOpen && (
                <>
                  {/* Overlay pour fermer */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoriesOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 z-20 w-56 rounded-xl border border-zinc-100 bg-white shadow-lg shadow-zinc-100/50 py-1">
                    {NAV_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="block px-4 py-2.5 text-sm text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link
              href="/vendeurs"
              className="px-3 py-2 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Vendeurs
            </Link>

            <Link
              href="/abonnements"
              className="px-3 py-2 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Abonnements
            </Link>

            <div className="w-px h-5 bg-zinc-200 mx-1" />

            <Link href="/connexion">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <User size={15} strokeWidth={1.5} className="text-black" />
                Connexion
              </Button>
            </Link>

            <Link href="/inscription-vendeur">
              <Button size="sm">Vendre</Button>
            </Link>
          </nav>

          {/* ── Actions mobile ── */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-lg hover:bg-zinc-50 transition-colors"
              aria-label="Rechercher"
            >
              <Search size={20} strokeWidth={1.5} className="text-black" />
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-lg hover:bg-zinc-50 transition-colors"
              aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMobileOpen ? (
                <X size={20} strokeWidth={1.5} className="text-black" />
              ) : (
                <Menu size={20} strokeWidth={1.5} className="text-black" />
              )}
            </button>
          </div>
        </div>

        {/* ── Recherche mobile ── */}
        {isSearchOpen && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={16}
                strokeWidth={1.5}
              />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-9 bg-zinc-50"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Menu mobile ── */}
      {isMobileOpen && (
        <div className="border-t border-zinc-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <p className="px-3 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Catégories
            </p>
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setIsMobileOpen(false)}
                className="block px-3 py-2.5 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
              >
                {cat.label}
              </Link>
            ))}

            <div className="h-px bg-zinc-100 my-3" />

            <Link
              href="/vendeurs"
              onClick={() => setIsMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Vendeurs
            </Link>
            <Link
              href="/abonnements"
              onClick={() => setIsMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Abonnements
            </Link>

            <div className="h-px bg-zinc-100 my-3" />

            <div className="flex flex-col gap-2 pt-1">
              <Link href="/connexion" onClick={() => setIsMobileOpen(false)}>
                <Button variant="outline" className="w-full justify-center gap-2">
                  <User size={15} strokeWidth={1.5} className="text-black" />
                  Connexion
                </Button>
              </Link>
              <Link href="/inscription-vendeur" onClick={() => setIsMobileOpen(false)}>
                <Button className="w-full justify-center">Vendre sur SourcingLocal</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

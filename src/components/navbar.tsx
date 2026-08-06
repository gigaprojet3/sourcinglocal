"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Search, User, Menu, X, ChevronDown,
  LayoutDashboard, ShoppingBag, LogOut, Settings,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV_CATEGORIES = [
  { label: "Mode & Vêtements",      href: "/marketplace?categorie=mode-vetements" },
  { label: "Beauté & Soins",         href: "/marketplace?categorie=beaute-soins" },
  { label: "Maison & Décoration",    href: "/marketplace?categorie=maison-decoration" },
  { label: "Électronique & High-Tech", href: "/marketplace?categorie=electronique" },
  { label: "Sport & Fitness",        href: "/marketplace?categorie=sport-fitness" },
];

// Initiales depuis un nom
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;
  const role = user?.role as "BUYER" | "SELLER" | undefined;

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Fermer user menu si clic extérieur
  React.useEffect(() => {
    function handle(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href={role === "BUYER" ? "/marketplace" : "/"} className="shrink-0">
            <Logo />
          </Link>

          {/* Recherche desktop */}
          <div className="hidden flex-1 max-w-md md:flex">
            <div className="relative w-full">
              <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <form action="/marketplace" method="get">
                <Input
                  name="q"
                  type="search"
                  placeholder="Rechercher des produits..."
                  className="pl-9 pr-4 h-10 rounded-lg bg-zinc-50 border-zinc-200 focus-visible:bg-white"
                />
              </form>
            </div>
          </div>

          {/* Actions desktop */}
          <nav className="hidden md:flex items-center gap-1">

            {/* Catégories */}
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
                  className={cn("text-zinc-400 transition-transform duration-200", isCategoriesOpen && "rotate-180")}
                />
              </button>

              {isCategoriesOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCategoriesOpen(false)} />
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

            <Link href="/marketplace" className="px-3 py-2 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors">
              Marketplace
            </Link>

            {/* Lien abonnements pour buyers non connectés */}
            {!user && (
              <Link href="/abonnements" className="px-3 py-2 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors">
                Abonnements
              </Link>
            )}

            <div className="w-px h-5 bg-zinc-200 mx-1" />

            {/* ── Utilisateur connecté ── */}
            {!isLoading && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl hover:bg-zinc-50 transition-colors"
                  aria-expanded={isUserMenuOpen}
                >
                  {/* Avatar / initiales */}
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {user.name ? getInitials(user.name) : <User size={13} />}
                  </div>
                  <span className="text-sm text-zinc-700 max-w-[100px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={1.5}
                    className={cn("text-zinc-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-30 w-52 rounded-xl border border-zinc-100 bg-white shadow-lg py-1">
                    {/* Info */}
                    <div className="px-4 py-2.5 border-b border-zinc-50">
                      <p className="text-xs font-medium text-zinc-900 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>

                    {/* Liens selon rôle */}
                    {role === "BUYER" && (
                      <>
                        <Link
                          href="/marketplace"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <ShoppingBag size={14} strokeWidth={1.5} className="text-black shrink-0" />
                          Marketplace
                        </Link>
                        <Link
                          href="/abonnements"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <Settings size={14} strokeWidth={1.5} className="text-black shrink-0" />
                          Mon abonnement
                        </Link>
                      </>
                    )}

                    {role === "SELLER" && (
                      <Link
                        href="/dashboard/seller"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        <LayoutDashboard size={14} strokeWidth={1.5} className="text-black shrink-0" />
                        Mon dashboard
                      </Link>
                    )}

                    <div className="h-px bg-zinc-50 my-1" />

                    <button
                      onClick={() => { setIsUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <LogOut size={14} strokeWidth={1.5} className="text-black shrink-0" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : !isLoading ? (
              /* Non connecté */
              <>
                <Link href="/connexion">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User size={15} strokeWidth={1.5} className="text-black" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription-vendeur">
                  <Button size="sm">Vendre</Button>
                </Link>
              </>
            ) : null}
          </nav>

          {/* Actions mobile */}
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
              aria-label={isMobileOpen ? "Fermer" : "Menu"}
            >
              {isMobileOpen
                ? <X size={20} strokeWidth={1.5} className="text-black" />
                : <Menu size={20} strokeWidth={1.5} className="text-black" />}
            </button>
          </div>
        </div>

        {/* Recherche mobile */}
        {isSearchOpen && (
          <div className="pb-3 md:hidden">
            <form action="/marketplace" method="get">
              <div className="relative">
                <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input name="q" type="search" placeholder="Rechercher..." className="pl-9 bg-zinc-50" autoFocus />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Menu mobile */}
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
                {cat.label.replace(/^.+\?categorie=.+$/, cat.label)}
              </Link>
            ))}

            <div className="h-px bg-zinc-100 my-3" />

            <Link href="/marketplace" onClick={() => setIsMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-50 transition-colors">
              Marketplace
            </Link>

            <div className="h-px bg-zinc-100 my-3" />

            {user ? (
              <div className="flex flex-col gap-2 pt-1">
                <div className="px-3 py-2 bg-zinc-50 rounded-lg">
                  <p className="text-xs font-medium text-zinc-900">{user.name}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </div>
                {role === "SELLER" && (
                  <Link href="/dashboard/seller" onClick={() => setIsMobileOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <LayoutDashboard size={15} strokeWidth={1.5} className="text-black" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => { setIsMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                >
                  <LogOut size={15} strokeWidth={1.5} className="text-black" />
                  Déconnexion
                </Button>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </header>
  );
}

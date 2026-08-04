"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Package, MessageSquare, Settings, User } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface DashboardNavProps {
  session: Session;
}

const NAV_ITEMS = [
  { href: "/dashboard/seller", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/seller/produits", label: "Mes produits", icon: Package },
  { href: "/dashboard/seller/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/seller/parametres", label: "Paramètres", icon: Settings },
];

export function DashboardNav({ session }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/">
            <Logo size={28} />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === href
                    ? "bg-zinc-100 text-zinc-900 font-medium"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                <Icon size={14} strokeWidth={1.5} className="text-black" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Profil + déconnexion */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600">
              <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center">
                <User size={13} strokeWidth={1.5} className="text-zinc-500" />
              </div>
              <span className="max-w-[120px] truncate font-medium text-zinc-800">
                {session.user?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-1.5 text-zinc-500 hover:text-zinc-900"
            >
              <LogOut size={14} strokeWidth={1.5} className="text-black" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

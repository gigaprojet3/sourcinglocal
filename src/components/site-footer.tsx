import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  Marketplace: [
    { label: "Comment ça marche", href: "/comment-ca-marche" },
    { label: "Devenir vendeur", href: "/inscription-vendeur" },
    { label: "Abonnements", href: "/abonnements" },
    { label: "Vendeurs vérifiés", href: "/vendeurs" },
  ],
  Catégories: [
    { label: "Mode & Vêtements", href: "/categorie/mode-vetements" },
    { label: "Beauté & Soins", href: "/categorie/beaute-soins" },
    { label: "Maison & Décoration", href: "/categorie/maison-decoration" },
    { label: "Électronique", href: "/categorie/electronique" },
    { label: "Sport & Fitness", href: "/categorie/sport-fitness" },
  ],
  Support: [
    { label: "Centre d'aide", href: "/aide" },
    { label: "Nous contacter", href: "/contact" },
    { label: "Signaler un problème", href: "/signalement" },
  ],
  Légal: [
    { label: "Conditions d'utilisation", href: "/conditions" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        {/* ── Grille principale ── */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Branding */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Logo />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[180px]">
              La marketplace des produits locaux africains authentiques.
            </p>
            <p className="text-xs text-zinc-300 mt-auto">
              Paiements en{" "}
              <span className="font-semibold text-zinc-400">FCFA</span>
            </p>
          </div>

          {/* Colonnes de liens */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                {section}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* ── Bas de page ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <p>
            © {new Date().getFullYear()} SourcingLocal. Tous droits réservés.
          </p>
          <p>
            Fait avec ❤️ en Afrique
          </p>
        </div>
      </div>
    </footer>
  );
}

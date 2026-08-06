import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SourcingLocal — La marketplace africaine",
    template: "%s | SourcingLocal",
  },
  description:
    "Découvrez des produits locaux authentiques : mode, beauté, maison, électronique et sport. Connectez-vous directement avec des fournisseurs locaux africains.",
  keywords: ["marketplace", "africain", "sourcing", "local", "fournisseurs", "CFA"],
  authors: [{ name: "SourcingLocal" }],
  creator: "SourcingLocal",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "SourcingLocal",
    title: "SourcingLocal — La marketplace africaine",
    description:
      "Découvrez des produits locaux authentiques et connectez-vous avec des fournisseurs locaux africains.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

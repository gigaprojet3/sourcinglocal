import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProductGrid />
      </main>
      <SiteFooter />
    </>
  );
}

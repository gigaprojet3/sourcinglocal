/**
 * Prisma seed — SourcingLocal
 * Usage: npm run db:seed
 *
 * Prisma 7: driver adapter obligatoire, import depuis generated path
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding SourcingLocal database...");

  // ── Catégories ──────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "mode-vetements" },
      update: {},
      create: { name: "Mode & Vêtements", slug: "mode-vetements", icon: "Shirt" },
    }),
    prisma.category.upsert({
      where: { slug: "beaute-soins" },
      update: {},
      create: { name: "Beauté & Soins", slug: "beaute-soins", icon: "Sparkles" },
    }),
    prisma.category.upsert({
      where: { slug: "maison-decoration" },
      update: {},
      create: { name: "Maison & Décoration", slug: "maison-decoration", icon: "Home" },
    }),
    prisma.category.upsert({
      where: { slug: "electronique" },
      update: {},
      create: { name: "Électronique & High-Tech", slug: "electronique", icon: "Cpu" },
    }),
    prisma.category.upsert({
      where: { slug: "sport-fitness" },
      update: {},
      create: { name: "Sport & Fitness", slug: "sport-fitness", icon: "Dumbbell" },
    }),
  ]);

  console.log(`✅ ${categories.length} catégories créées`);

  // ── Utilisateur vendeur démo ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Demo1234!", 12);

  const seller = await prisma.user.upsert({
    where: { email: "vendeur@sourcinglocal.demo" },
    update: {},
    create: {
      email: "vendeur@sourcinglocal.demo",
      password: hashedPassword,
      name: "Boutique Démo",
      role: "SELLER",
      shop: {
        create: {
          name: "Karité Nature",
          slug: "karite-nature",
          description:
            "Spécialiste des produits naturels à base de karité du Burkina Faso.",
          city: "Ouagadougou",
          country: "Burkina Faso",
          isVerified: true,
        },
      },
    },
    include: { shop: true },
  });

  console.log(`✅ Vendeur démo: ${seller.email}`);

  // ── Utilisateur acheteur démo ────────────────────────────────────────
  const buyer = await prisma.user.upsert({
    where: { email: "acheteur@sourcinglocal.demo" },
    update: {},
    create: {
      email: "acheteur@sourcinglocal.demo",
      password: hashedPassword,
      name: "Acheteur Démo",
      role: "BUYER",
    },
  });

  console.log(`✅ Acheteur démo: ${buyer.email}`);

  // ── Produit démo ─────────────────────────────────────────────────────
  if (seller.shop) {
    const beauteCategory = categories.find((c) => c.slug === "beaute-soins")!;

    const product = await prisma.product.upsert({
      where: { slug: "huile-de-karite-pure" },
      update: {},
      create: {
        name: "Huile de Karité Pure",
        slug: "huile-de-karite-pure",
        description:
          "Beurre de karité 100% naturel et non raffiné, récolte manuelle. 500 ml.",
        priceCfa: 8500,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
        ]),
        origin: "Ouagadougou, Burkina Faso",
        isFeatured: true,
        inStock: true,
        shopId: seller.shop.id,
        categories: {
          create: [{ categoryId: beauteCategory.id }],
        },
      },
    });

    await prisma.review.upsert({
      where: {
        authorId_productId: { authorId: buyer.id, productId: product.id },
      },
      update: {},
      create: {
        rating: 5,
        comment: "Excellent produit, très hydratant !",
        authorId: buyer.id,
        productId: product.id,
      },
    });

    console.log(`✅ Produit démo: ${product.name}`);
  }

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

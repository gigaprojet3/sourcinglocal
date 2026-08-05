"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

// ── Cloudinary config ─────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Types ─────────────────────────────────────────────────────────────
export interface ProductActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  productId?: string;
  slug?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Schema validation ─────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(100, "Maximum 100 caractères"),
  description: z.string().max(1000, "Maximum 1000 caractères").optional(),
  priceCfa: z
    .number({ invalid_type_error: "Prix invalide" })
    .int("Le prix doit être un entier")
    .positive("Le prix doit être positif")
    .max(100_000_000, "Prix trop élevé"),
  categoryIds: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une catégorie")
    .max(3, "Maximum 3 catégories"),
  origin: z.string().max(100).optional(),
  imageMain: z.string().url("URL image invalide"),
  imageSecond: z.string().url("URL image invalide").optional().or(z.literal("")),
  inStock: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

// ── CREATE ────────────────────────────────────────────────────────────
export async function createProduct(
  data: ProductInput
): Promise<ProductActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return { success: false, error: "Non autorisé." };
  }

  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!shop) return { success: false, error: "Boutique introuvable." };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, priceCfa, categoryIds, origin, imageMain, imageSecond, inStock } =
    parsed.data;

  // Vérifier que les catégories existent
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    return { success: false, error: "Une ou plusieurs catégories sont invalides." };
  }

  // Générer un slug unique
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  // Construire le JSON des images (max 2)
  const images: string[] = [imageMain];
  if (imageSecond && imageSecond.trim() !== "") images.push(imageSecond);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description ?? null,
      priceCfa,
      images: JSON.stringify(images),
      origin: origin ?? null,
      inStock,
      shopId: shop.id,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  revalidatePath("/dashboard/seller/produits");
  revalidatePath("/");

  return { success: true, productId: product.id, slug: product.slug };
}

// ── UPDATE ────────────────────────────────────────────────────────────
export async function updateProduct(
  productId: string,
  data: ProductInput
): Promise<ProductActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return { success: false, error: "Non autorisé." };
  }

  // Vérifier que le produit appartient bien à ce seller
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { ownerId: session.user.id },
    },
    select: { id: true, images: true },
  });
  if (!existing) return { success: false, error: "Produit introuvable." };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, priceCfa, categoryIds, origin, imageMain, imageSecond, inStock } =
    parsed.data;

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    return { success: false, error: "Une ou plusieurs catégories sont invalides." };
  }

  const images: string[] = [imageMain];
  if (imageSecond && imageSecond.trim() !== "") images.push(imageSecond);

  // Supprimer les anciennes images Cloudinary si elles ont changé
  try {
    const oldImages: string[] = JSON.parse(existing.images ?? "[]");
    const newImages = images;
    const toDelete = oldImages.filter((url) => !newImages.includes(url));
    for (const url of toDelete) {
      // Extraire le public_id depuis l'URL Cloudinary
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/);
      if (match) await cloudinary.uploader.destroy(match[1]);
    }
  } catch { /* silencieux */ }

  await prisma.$transaction([
    // Supprimer les anciennes liaisons catégories
    prisma.productCategory.deleteMany({ where: { productId } }),
    // Mettre à jour le produit
    prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description: description ?? null,
        priceCfa,
        images: JSON.stringify(images),
        origin: origin ?? null,
        inStock,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    }),
  ]);

  revalidatePath("/dashboard/seller/produits");
  revalidatePath("/");

  return { success: true, productId };
}

// ── TOGGLE STOCK ──────────────────────────────────────────────────────
export async function toggleProductStock(
  productId: string
): Promise<ProductActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return { success: false, error: "Non autorisé." };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { ownerId: session.user.id },
    },
    select: { id: true, inStock: true },
  });
  if (!product) return { success: false, error: "Produit introuvable." };

  await prisma.product.update({
    where: { id: productId },
    data: { inStock: !product.inStock },
  });

  revalidatePath("/dashboard/seller/produits");

  return { success: true };
}

// ── DELETE ────────────────────────────────────────────────────────────
export async function deleteProduct(
  productId: string
): Promise<ProductActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return { success: false, error: "Non autorisé." };
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { ownerId: session.user.id },
    },
    select: { id: true, images: true },
  });
  if (!product) return { success: false, error: "Produit introuvable." };

  // Supprimer les images Cloudinary
  try {
    const images: string[] = JSON.parse(product.images ?? "[]");
    for (const url of images) {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/);
      if (match) await cloudinary.uploader.destroy(match[1]);
    }
  } catch { /* silencieux */ }

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/dashboard/seller/produits");
  revalidatePath("/");

  return { success: true };
}

// ── GET categories (pour le formulaire) ──────────────────────────────
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });
}

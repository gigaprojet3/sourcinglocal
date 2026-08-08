"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const createShopSchema = z.object({
  name: z.string().min(2, "Le nom doit avoir au moins 2 caractères").max(60),
  description: z.string().max(300, "Maximum 300 caractères").optional(),
  whatsapp: z
    .string()
    .regex(/^\+?[0-9\s\-()]{8,20}$/, "Numéro invalide")
    .optional()
    .or(z.literal("")),
  city: z.string().min(1, "Sélectionnez une ville"),
  country: z.string().min(1, "Sélectionnez un pays"),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;

export interface ShopActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  shopSlug?: string;
}

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

export async function createShop(data: CreateShopInput): Promise<ShopActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return { success: false, error: "Non autorisé." };
  }

  // Vérifier si le vendeur a déjà une boutique
  const existingShop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
  });
  if (existingShop) {
    return { success: false, error: "Vous avez déjà une boutique." };
  }

  const parsed = createShopSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, city, country, whatsapp } = parsed.data;

  // Générer un slug unique
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.shop.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  await prisma.shop.create({
    data: {
      name,
      slug,
      description: description ?? null,
      city,
      country,
      whatsapp: whatsapp || null,
      ownerId: session.user.id,
    },
  });

  return { success: true, shopSlug: slug };
}

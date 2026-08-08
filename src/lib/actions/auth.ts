"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// ── Schemas de validation ─────────────────────────────────────────────

const registerBuyerSchema = z.object({
  name: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit avoir au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
  phone: z.string().min(8, "Numéro invalide"),
  country: z.string().min(1, "Sélectionnez un pays"),
  city: z.string().min(1, "Sélectionnez une ville"),
});

const registerSellerSchema = registerBuyerSchema;

export type RegisterBuyerInput = z.infer<typeof registerBuyerSchema>;
export type RegisterSellerInput = z.infer<typeof registerSellerSchema>;

export interface ActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ── Register Buyer ────────────────────────────────────────────────────

export async function registerBuyer(
  data: RegisterBuyerInput
): Promise<ActionResult> {
  const parsed = registerBuyerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone, country, city } = parsed.data;

  // Vérifier si l'email existe déjà
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Un compte avec cet email existe déjà." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      // On stocke pays + ville dans le champ avatar temporairement
      // → Dans une V2, ajouter des champs country/city au modèle User
      role: "BUYER",
      // Stockage pays/ville comme JSON dans le champ avatar (workaround SQLite V1)
      avatar: JSON.stringify({ country, city }),
    },
  });

  return { success: true };
}

// ── Register Seller ───────────────────────────────────────────────────

export async function registerSeller(
  data: RegisterSellerInput
): Promise<ActionResult> {
  const parsed = registerSellerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone, country, city } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Un compte avec cet email existe déjà." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: "SELLER",
      avatar: JSON.stringify({ country, city }),
    },
  });

  return { success: true };
}

// ── Login ─────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export async function loginUser(
  data: LoginInput
): Promise<ActionResult & { role?: string; hasShop?: boolean }> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email ou mot de passe incorrect." };
        default:
          return { success: false, error: "Une erreur est survenue. Réessayez." };
      }
    }
    throw error;
  }
}

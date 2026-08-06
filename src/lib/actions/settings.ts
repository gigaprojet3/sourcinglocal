"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { COUNTRIES, getCitiesByCountry } from "@/lib/geo-data";

// ── Types ─────────────────────────────────────────────────────────────
export interface SettingsResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ── Helper: obtenir l'utilisateur courant vérifié ─────────────────────
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      password: true,
      notifNewMessage: true,
      notifNewContact: true,
      notifNewsletter: true,
    },
  });
}

// ── UPDATE PROFILE ────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit avoir au moins 2 caractères").max(60),
  phone: z.string().min(8, "Numéro invalide").max(20).optional().or(z.literal("")),
  country: z.string().optional(),
  city: z.string().optional(),
  avatar: z.string().url("URL invalide").optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfile(data: UpdateProfileInput): Promise<SettingsResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, phone, country, city, avatar } = parsed.data;

  // Composer l'info pays/ville dans le champ avatar metadata (JSON)
  // On utilise le champ existant avatar pour stocker les données profil en JSON
  // si pas d'image uploadée, sinon on stocke l'URL de l'image directement
  let avatarValue = user.avatar;
  if (avatar && avatar.trim() !== "") {
    avatarValue = avatar;
  } else if (!avatar || avatar.trim() === "") {
    // Garder l'avatar existant si pas de changement
    try {
      const existing = user.avatar ? JSON.parse(user.avatar) : {};
      if (typeof existing === "object" && !existing.startsWith?.("http")) {
        avatarValue = JSON.stringify({ ...existing, country, city });
      }
    } catch {
      avatarValue = JSON.stringify({ country, city });
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: phone || null,
      avatar: avatarValue,
    },
  });

  revalidatePath("/dashboard/seller/parametres");
  revalidatePath("/dashboard/buyer/parametres");

  return { success: true };
}

// ── UPDATE PROFILE AVATAR (Cloudinary URL) ────────────────────────────
const updateAvatarSchema = z.object({
  avatarUrl: z.string().url("URL invalide"),
});

export async function updateAvatar(avatarUrl: string): Promise<SettingsResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const parsed = updateAvatarSchema.safeParse({ avatarUrl });
  if (!parsed.success) return { success: false, error: "URL invalide." };

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: avatarUrl },
  });

  revalidatePath("/dashboard/seller/parametres");
  revalidatePath("/dashboard/buyer/parametres");

  return { success: true };
}

// ── UPDATE SHOP ───────────────────────────────────────────────────────
const updateShopSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères").max(60),
  description: z.string().max(300, "Maximum 300 caractères").optional().or(z.literal("")),
  city: z.string().min(1, "Sélectionnez une ville"),
  country: z.string().min(1, "Sélectionnez un pays"),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;

export async function updateShop(data: UpdateShopInput): Promise<SettingsResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SELLER") {
    return { success: false, error: "Non autorisé." };
  }

  const parsed = updateShopSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });
  if (!shop) return { success: false, error: "Boutique introuvable." };

  await prisma.shop.update({
    where: { id: shop.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      city: parsed.data.city,
      country: parsed.data.country,
    },
  });

  revalidatePath("/dashboard/seller/parametres");

  return { success: true };
}

// ── UPDATE PASSWORD ───────────────────────────────────────────────────
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export async function updatePassword(data: UpdatePasswordInput): Promise<SettingsResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const parsed = updatePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Vérifier l'ancien mot de passe
  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!isValid) {
    return {
      success: false,
      fieldErrors: { currentPassword: ["Mot de passe actuel incorrect."] },
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}

// ── UPDATE NOTIFICATIONS ──────────────────────────────────────────────
export interface UpdateNotificationsInput {
  notifNewMessage: boolean;
  notifNewContact: boolean;
  notifNewsletter: boolean;
}

export async function updateNotifications(
  data: UpdateNotificationsInput
): Promise<SettingsResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non authentifié." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      notifNewMessage: data.notifNewMessage,
      notifNewContact: data.notifNewContact,
      notifNewsletter: data.notifNewsletter,
    },
  });

  revalidatePath("/dashboard/seller/parametres");
  revalidatePath("/dashboard/buyer/parametres");

  return { success: true };
}

// ── DELETE ACCOUNT ────────────────────────────────────────────────────
const deleteAccountSchema = z.object({
  confirmation: z.literal("SUPPRIMER", {
    errorMap: () => ({ message: 'Tapez exactement "SUPPRIMER" pour confirmer.' }),
  }),
  password: z.string().min(1, "Mot de passe requis"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export async function deleteAccount(data: DeleteAccountInput): Promise<SettingsResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const parsed = deleteAccountSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Vérifier le mot de passe
  const isValid = await bcrypt.compare(parsed.data.password, user.password);
  if (!isValid) {
    return {
      success: false,
      fieldErrors: { password: ["Mot de passe incorrect."] },
    };
  }

  // Supprimer le compte (cascade supprime shop, produits, messages, etc.)
  await prisma.user.delete({ where: { id: user.id } });

  // Déconnecter la session
  await signOut({ redirect: false });

  return { success: true };
}

// ── GET SETTINGS DATA (pour pré-remplir les formulaires) ──────────────
export async function getSettingsData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      notifNewMessage: true,
      notifNewContact: true,
      notifNewsletter: true,
      shop: {
        select: {
          name: true,
          description: true,
          city: true,
          country: true,
          isVerified: true,
        },
      },
    },
  });

  return user;
}

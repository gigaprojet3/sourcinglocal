import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSettingsData } from "@/lib/actions/settings";
import { COUNTRIES } from "@/lib/geo-data";
import { ProfileSection } from "@/components/settings/profile-section";
import { ShopSection } from "@/components/settings/shop-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { SecuritySection } from "@/components/settings/security-section";
import { DangerSection } from "@/components/settings/danger-section";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SellerParametresPage() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") redirect("/connexion");

  const user = await getSettingsData();
  if (!user) redirect("/connexion");
  if (!user.shop) redirect("/onboarding/boutique");

  // Extraire pays/ville depuis le champ avatar (stocké en JSON si pas d'image)
  let initialCountry = "";
  let initialCity = "";
  if (user.avatar && !user.avatar.startsWith("http")) {
    try {
      const parsed = JSON.parse(user.avatar) as { country?: string; city?: string };
      initialCountry = parsed.country ?? "";
      initialCity = parsed.city ?? "";
    } catch { /* avatar est une URL ou null */ }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Paramètres</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Gérez votre compte, votre boutique et vos préférences.
        </p>
      </div>

      {/* Sections */}
      <ProfileSection
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        }}
        initialCountry={initialCountry}
        initialCity={initialCity}
      />

      <ShopSection shop={user.shop} />

      <NotificationsSection
        role="SELLER"
        initial={{
          notifNewMessage: user.notifNewMessage,
          notifNewContact: user.notifNewContact,
          notifNewsletter: user.notifNewsletter,
        }}
      />

      <SecuritySection />

      <DangerSection />
    </div>
  );
}

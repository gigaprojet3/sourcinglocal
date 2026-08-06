import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSettingsData } from "@/lib/actions/settings";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { ProfileSection } from "@/components/settings/profile-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { SecuritySection } from "@/components/settings/security-section";
import { DangerSection } from "@/components/settings/danger-section";

export const metadata: Metadata = { title: "Paramètres" };

export default async function BuyerParametresPage() {
  const session = await auth();
  if (!session || session.user.role !== "BUYER") redirect("/connexion");

  const user = await getSettingsData();
  if (!user) redirect("/connexion");

  // Extraire pays/ville depuis le champ avatar (JSON si pas d'image uploadée)
  let initialCountry = "";
  let initialCity = "";
  if (user.avatar && !user.avatar.startsWith("http")) {
    try {
      const parsed = JSON.parse(user.avatar) as { country?: string; city?: string };
      initialCountry = parsed.country ?? "";
      initialCity = parsed.city ?? "";
    } catch { /* silencieux */ }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Paramètres</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gérez votre profil et vos préférences.
          </p>
        </div>

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

        <NotificationsSection
          role="BUYER"
          initial={{
            notifNewMessage: user.notifNewMessage,
            notifNewContact: user.notifNewContact,
            notifNewsletter: user.notifNewsletter,
          }}
        />

        <SecuritySection />

        <DangerSection />
      </main>

      <SiteFooter />
    </div>
  );
}

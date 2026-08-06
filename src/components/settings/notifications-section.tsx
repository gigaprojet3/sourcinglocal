"use client";

import * as React from "react";
import { Loader2, Bell, MessageSquare, Users, Newspaper } from "lucide-react";
import { updateNotifications } from "@/lib/actions/settings";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface NotifToggleProps {
  label: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function NotifToggle({ label, description, icon: Icon, checked, onChange }: NotifToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-zinc-50 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={14} strokeWidth={1.5} className="text-black" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-800">{label}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors mt-0.5",
          checked ? "bg-black" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

interface NotificationsSectionProps {
  role: string;
  initial: {
    notifNewMessage: boolean;
    notifNewContact: boolean;
    notifNewsletter: boolean;
  };
}

export function NotificationsSection({ role, initial }: NotificationsSectionProps) {
  const router = useRouter();
  const [values, setValues] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  function handleChange(key: keyof typeof values, val: boolean) {
    setValues((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateNotifications(values);
    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setIsDirty(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const isSeller = role === "SELLER";

  return (
    <section className="bg-white rounded-xl border border-zinc-100 p-6 space-y-1">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-900">Notifications</h2>
        <p className="text-sm text-zinc-400 mt-0.5">
          Choisissez quand vous souhaitez être notifié par email.
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 mb-3">
          ✓ Préférences enregistrées.
        </div>
      )}

      <NotifToggle
        label="Nouveaux messages"
        description="Recevoir un email quand quelqu'un vous envoie un message."
        icon={MessageSquare}
        checked={values.notifNewMessage}
        onChange={(v) => handleChange("notifNewMessage", v)}
      />

      {isSeller && (
        <NotifToggle
          label="Nouvelles demandes de contact"
          description="Recevoir un email quand un acheteur souhaite vous contacter."
          icon={Users}
          checked={values.notifNewContact}
          onChange={(v) => handleChange("notifNewContact", v)}
        />
      )}

      <NotifToggle
        label="Newsletter SourcingLocal"
        description="Recevoir nos actualités, conseils et nouvelles fonctionnalités."
        icon={Newspaper}
        checked={values.notifNewsletter}
        onChange={(v) => handleChange("notifNewsletter", v)}
      />

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? <><Loader2 size={13} strokeWidth={1.5} className="animate-spin" /> Enregistrement...</>
            : "Enregistrer"}
        </button>
      </div>
    </section>
  );
}

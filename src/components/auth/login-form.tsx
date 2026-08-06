"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, ShoppingBag, Store } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps {
  callbackUrl?: string;
  defaultRole?: string;
}

export function LoginForm({ callbackUrl, defaultRole }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  // Indicateur de rôle détecté visuellement
  const [detectedRole, setDetectedRole] = React.useState<"BUYER" | "SELLER" | null>(null);
  const [checkingRole, setCheckingRole] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const emailValue = watch("email");

  // Détection du rôle via l'email (debounce 600ms)
  React.useEffect(() => {
    if (!emailValue || !emailValue.includes("@")) {
      setDetectedRole(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingRole(true);
      try {
        const res = await fetch(`/api/auth/check-role?email=${encodeURIComponent(emailValue)}`);
        if (res.ok) {
          const data = await res.json() as { role?: string };
          if (data.role === "BUYER" || data.role === "SELLER") {
            setDetectedRole(data.role);
          } else {
            setDetectedRole(null);
          }
        }
      } catch {
        setDetectedRole(null);
      } finally {
        setCheckingRole(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [emailValue]);

  async function onSubmit(data: FormData) {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result?.ok) {
      setServerError("Email ou mot de passe incorrect.");
      return;
    }

    // Récupérer la session pour connaître le rôle et rediriger
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json() as { user?: { role?: string; hasShop?: boolean } };
    const role = session?.user?.role;
    const hasShop = session?.user?.hasShop;

    if (role === "SELLER") {
      if (!hasShop) {
        router.push("/onboarding/boutique");
      } else {
        router.push(callbackUrl ?? "/dashboard/seller");
      }
    } else {
      // BUYER → marketplace
      router.push(callbackUrl ?? "/marketplace");
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Indicateur de rôle détecté */}
      {detectedRole && (
        <div className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium border transition-all",
          detectedRole === "BUYER"
            ? "bg-blue-50 border-blue-100 text-blue-700"
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        )}>
          {detectedRole === "BUYER"
            ? <ShoppingBag size={13} strokeWidth={1.5} className="shrink-0" />
            : <Store size={13} strokeWidth={1.5} className="shrink-0" />}
          Compte {detectedRole === "BUYER" ? "Acheteur" : "Vendeur"} détecté
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Adresse email
        </label>
        <div className="relative">
          <Mail size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("email")}
            type="email"
            placeholder="vous@exemple.com"
            className="pl-9"
            autoComplete="email"
            autoFocus
          />
          {checkingRole && (
            <Loader2 size={13} strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 animate-spin" />
          )}
        </div>
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-700">
          Mot de passe
        </label>
        <div className="relative">
          <Lock size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Votre mot de passe"
            className="pl-9 pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword
              ? <EyeOff size={15} strokeWidth={1.5} />
              : <Eye size={15} strokeWidth={1.5} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 size={15} strokeWidth={1.5} className="animate-spin" /> Connexion...</>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
}

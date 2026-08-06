"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { updateAvatar } from "@/lib/actions/settings";
import { useRouter } from "next/navigation";

interface AvatarUploadProps {
  name: string;
  currentAvatar: string | null;
}

/** Génère les initiales depuis un nom complet */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Couleur de fond déterministe basée sur le nom */
function getAvatarColor(name: string): string {
  const colors = [
    "bg-zinc-700",
    "bg-stone-700",
    "bg-slate-700",
    "bg-neutral-700",
    "bg-zinc-600",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function AvatarUpload({ name, currentAvatar }: AvatarUploadProps) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Détecter si l'avatar est une vraie URL image
  const isImageUrl =
    currentAvatar?.startsWith("http") &&
    !currentAvatar?.startsWith("{");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Fichier invalide.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Max 3 Mo.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Obtenir signature Cloudinary
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "sourcinglocal/avatars" }),
      });
      if (!signRes.ok) throw new Error("Signature échouée");

      const { signature, timestamp, folder, cloudName, apiKey } =
        await signRes.json() as {
          signature: string;
          timestamp: number;
          folder: string;
          cloudName: string;
          apiKey: string;
        };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("transformation", "w_200,h_200,c_fill,g_face,q_auto,f_auto");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!uploadRes.ok) throw new Error("Upload échoué");

      const { secure_url } = await uploadRes.json() as { secure_url: string };
      await updateAvatar(secure_url);
      router.refresh();
    } catch {
      setError("Upload échoué. Réessayez.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          {isImageUrl ? (
            <Image
              src={currentAvatar!}
              alt={name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(name)}`}
            >
              {getInitials(name)}
            </div>
          )}
        </div>
        {/* Bouton overlay */}
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group"
          aria-label="Changer la photo de profil"
        >
          {uploading ? (
            <Loader2 size={16} strokeWidth={1.5} className="text-white animate-spin" />
          ) : (
            <Upload
              size={16}
              strokeWidth={1.5}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </button>
      </div>

      {/* Info */}
      <div>
        <p className="text-sm font-medium text-zinc-700">Photo de profil</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          JPG, PNG ou WEBP — max 3 Mo
        </p>
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-zinc-600 underline underline-offset-2 hover:no-underline mt-1 disabled:opacity-50"
        >
          {uploading ? "Upload en cours..." : "Changer la photo"}
        </button>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

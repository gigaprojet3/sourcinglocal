"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** URL de l'image actuelle (si déjà uploadée) */
  value: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
  /** Slot (identifiant unique pour éviter les conflits d'input) */
  slot: "main" | "second";
}

export function ImageUploader({
  value,
  onChange,
  label,
  required = false,
  slot,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    // Validation locale
    if (!file.type.startsWith("image/")) {
      setError("Fichier invalide. Seules les images sont acceptées.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // 1. Obtenir la signature sécurisée depuis notre API
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "sourcinglocal/products" }),
      });
      if (!signRes.ok) throw new Error("Erreur de signature");

      const { signature, timestamp, folder, cloudName, apiKey } =
        await signRes.json() as {
          signature: string;
          timestamp: number;
          folder: string;
          cloudName: string;
          apiKey: string;
        };

      // 2. Upload direct vers Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("transformation", "q_auto,f_auto");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) throw new Error("Échec de l'upload");

      const uploadData = await uploadRes.json() as { secure_url: string };
      onChange(uploadData.secure_url);
    } catch {
      setError("L'upload a échoué. Réessayez.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {!required && (
          <span className="ml-1.5 text-xs font-normal text-zinc-400">(optionnelle)</span>
        )}
      </label>

      {/* Zone de drop / prévisualisation */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer",
          value
            ? "border-zinc-200 bg-zinc-50 aspect-[4/3] overflow-hidden"
            : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100 h-40",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={22} strokeWidth={1.5} className="text-zinc-400 animate-spin" />
            <span className="text-xs text-zinc-400">Upload en cours...</span>
          </div>
        ) : value ? (
          <>
            <Image
              src={value}
              alt="Aperçu"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-xs font-medium">Changer</span>
            </div>
            {/* Bouton supprimer */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black flex items-center justify-center transition-colors z-10"
              aria-label="Supprimer l'image"
            >
              <X size={13} strokeWidth={2} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
              <Upload size={16} strokeWidth={1.5} className="text-zinc-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-700">
                Cliquer ou déposer
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">PNG, JPG, WEBP — max 5 Mo</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        id={`image-upload-${slot}`}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-label={label}
      />
    </div>
  );
}

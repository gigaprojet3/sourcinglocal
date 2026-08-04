import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Affiche uniquement l'icône sans le texte */
  iconOnly?: boolean;
  /** Taille de l'icône en pixels */
  size?: number;
}

/**
 * Logo SourcingLocal — reproduit fidèlement :
 * - Contour de l'Afrique en trait fin, rempli d'un bleu-gris très léger
 * - Un point de localisation (pin) positionné sur l'Afrique de l'Ouest
 * - Texte "Sourcing" en gras + "Local" en regular, couleur sombre
 */
export function Logo({ className, iconOnly = false, size = 36 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* ── Icône : contour Afrique ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/*
          Silhouette simplifiée du continent africain.
          Inspirée de la forme générale : large au nord, rétrécit vers le Cap.
          Le point de départ est la côte nord-ouest (Maroc).
        */}
        <path
          d={[
            /* Côte nord-ouest — descente vers Sénégal */
            "M 38,12",
            "L 32,15",
            "L 26,20",
            "L 22,28",
            /* Presqu'île du Cap-Vert / Sénégal */
            "L 18,33",
            "L 16,38",
            "L 18,43",
            /* Golfe de Guinée — côte concave */
            "L 22,50",
            "L 26,54",
            "L 28,60",
            "L 26,66",
            /* Afrique australe — rétrécissement */
            "L 30,72",
            "L 35,78",
            "L 40,84",
            /* Cap de Bonne-Espérance */
            "L 44,88",
            "L 48,90",
            "L 52,88",
            /* Remontée côte est */
            "L 58,82",
            "L 63,75",
            "L 66,68",
            /* Corne de l'Afrique */
            "L 70,60",
            "L 74,56",
            "L 78,52",
            "L 80,46",
            "L 78,40",
            /* Mer Rouge / côte nord-est */
            "L 74,34",
            "L 72,28",
            "L 70,22",
            /* Égypte / côte méditerranéenne */
            "L 66,16",
            "L 60,12",
            "L 54,10",
            "L 48,10",
            "L 42,11",
            "Z",
          ].join(" ")}
          fill="#dbeafe"
          stroke="#1e3a5f"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/*
          Pin de localisation — positionné sur l'Afrique de l'Ouest (Sénégal ~)
          Coordonnées dans le viewBox : x≈30, y≈38
        */}
        <circle cx="30" cy="37" r="5" fill="#1e3a5f" />
        <circle cx="30" cy="37" r="2.5" fill="#ffffff" />
        {/* Tige du pin */}
        <line
          x1="30"
          y1="42"
          x2="30"
          y2="48"
          stroke="#1e3a5f"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* ── Texte ── */}
      {!iconOnly && (
        <span className="text-[17px] leading-none tracking-tight text-zinc-900">
          <span className="font-bold">Sourcing</span>
          <span className="font-normal">Local</span>
        </span>
      )}
    </div>
  );
}

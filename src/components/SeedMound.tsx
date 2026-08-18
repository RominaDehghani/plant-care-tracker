"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface SeedMoundProps {
  onPlant: (origin: DOMRect) => void;
  emphasized: boolean;
  /** True for the sabah/öğle skies. The dashed "+" ring stands against the
   * sky rather than the soil, so a cream ring — correct at akşam and gece —
   * disappeared entirely against a pale daytime sky. */
  lightSky: boolean;
}

export default function SeedMound({
  onPlant,
  emphasized,
  lightSky,
}: SeedMoundProps) {
  const ring = lightSky
    ? "border-accent-strong/60 text-accent-strong group-hover:border-accent-strong group-hover:bg-accent-strong/10"
    : "border-card/60 text-card group-hover:border-card group-hover:bg-card/15";
  return (
    <button
      type="button"
      onClick={(event) => onPlant(event.currentTarget.getBoundingClientRect())}
      aria-label="Toprağa yeni bir tohum ek"
      className="group relative flex shrink-0 flex-col items-center justify-end outline-none"
      style={{ width: 76 }}
    >
      <motion.span
        animate={
          emphasized ? { y: [0, -4, 0] } : { y: 0 }
        }
        transition={{
          duration: 1.6,
          repeat: emphasized ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed transition-colors ${ring}`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </motion.span>
      {/* A low, shallow mound of bare earth breaking through the turf. Nudged
          down past the shared plant baseline so its foot meets the soil line
          with no green showing underneath it. */}
      <svg
        viewBox="0 0 56 18"
        className="h-4 w-14 translate-y-2"
        aria-hidden="true"
      >
        <path
          d="M0,18 C7,6 19,2 28,2 C37,2 49,6 56,18 Z"
          fill="var(--soil-crust)"
          className="opacity-90 transition-opacity group-hover:opacity-100"
        />
      </svg>
      <span className="mt-1.5 text-xs font-medium text-sky-bottom/80 group-hover:text-card">
        Yeni bitki
      </span>
    </button>
  );
}

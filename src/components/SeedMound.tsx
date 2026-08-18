"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface SeedMoundProps {
  onPlant: (origin: DOMRect) => void;
  emphasized: boolean;
}

export default function SeedMound({ onPlant, emphasized }: SeedMoundProps) {
  return (
    <button
      type="button"
      onClick={(event) => onPlant(event.currentTarget.getBoundingClientRect())}
      aria-label="Toprağa yeni bir tohum ek"
      className="group relative flex shrink-0 flex-col items-center justify-end outline-none"
      style={{ width: 88 }}
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
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-card/60 text-card transition-colors group-hover:border-card group-hover:bg-card/15"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </motion.span>
      <svg viewBox="0 0 88 40" className="h-9 w-22" aria-hidden="true">
        <path
          d="M0,40 C10,14 30,6 44,6 C58,6 78,14 88,40 Z"
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

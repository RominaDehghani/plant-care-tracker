"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Pencil } from "lucide-react";
import { Plant } from "@/interfaces/Plant";

interface PlantQuickActionsProps {
  plant: Plant;
  anchorRect: DOMRect;
  onClose: () => void;
  onWaterNow: () => void;
  onEdit: () => void;
}

export default function PlantQuickActions({
  plant,
  anchorRect,
  onClose,
  onWaterNow,
  onEdit,
}: PlantQuickActionsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({
    left: anchorRect.left + anchorRect.width / 2,
    top: anchorRect.top,
    opacity: 0,
  });

  useEffect(() => {
    function place() {
      const width = wrapperRef.current?.offsetWidth ?? 96;
      const height = wrapperRef.current?.offsetHeight ?? 48;
      const margin = 12;
      let left = anchorRect.left + anchorRect.width / 2 - width / 2;
      left = Math.max(
        margin,
        Math.min(left, window.innerWidth - width - margin)
      );
      let top = anchorRect.top - height - 12;
      if (top < margin) top = anchorRect.bottom + 12;
      setPos({ left, top, opacity: 1 });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchorRect]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onOutsideDown(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutsideDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutsideDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={wrapperRef}
      role="group"
      aria-label={plant.name}
      initial={{ opacity: 0, scale: 0.7, y: 6 }}
      animate={{
        left: pos.left,
        top: pos.top,
        opacity: pos.opacity,
        scale: 1,
        y: 0,
      }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      style={{ position: "fixed" }}
      className="z-50 flex items-center gap-2"
    >
      <button
        type="button"
        onClick={onWaterNow}
        aria-label={`${plant.name} — Sula`}
        title="Sula"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-card shadow-[0_10px_24px_-8px_rgba(79,47,31,0.5)] transition hover:bg-sky-600"
      >
        <Droplet className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`${plant.name} — Düzenle`}
        title="Düzenle"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-card-border bg-card text-foreground-soft shadow-[0_10px_24px_-8px_rgba(79,47,31,0.4)] transition hover:border-accent hover:text-accent-strong"
      >
        <Pencil className="h-4.5 w-4.5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

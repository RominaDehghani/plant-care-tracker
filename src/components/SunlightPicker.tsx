"use client";

import { Sun, SunDim, SunMedium } from "lucide-react";
import { Plant } from "@/interfaces/Plant";

const OPTIONS: {
  value: Plant["sunlight"];
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: "az", label: "Az güneş", Icon: SunDim },
  { value: "orta", label: "Orta güneş", Icon: SunMedium },
  { value: "çok", label: "Çok güneş", Icon: Sun },
];

interface SunlightPickerProps {
  value: Plant["sunlight"];
  onChange: (value: Plant["sunlight"]) => void;
}

export default function SunlightPicker({
  value,
  onChange,
}: SunlightPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
              active
                ? "border-accent bg-accent/10 text-accent-strong"
                : "border-card-border text-foreground-soft hover:border-accent/40"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

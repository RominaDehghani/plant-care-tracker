"use client";

import { motion } from "framer-motion";

export type TimeOfDay = "morning" | "noon" | "evening";

const ORDER: TimeOfDay[] = ["morning", "noon", "evening"];

const LABELS: Record<TimeOfDay, string> = {
  morning: "Sabah",
  noon: "Öğle",
  evening: "Akşam",
};

// The sun always lives in the sky's top-left quadrant — only its color and
// glow travel across the day, never its position off toward an edge, so it
// never reads as sliding out of frame.
const LOOK: Record<
  TimeOfDay,
  { top: string; left: string; size: number; core: string; glow: string; rayOpacity: number }
> = {
  morning: {
    top: "34%",
    left: "16%",
    size: 50,
    core: "#ffd98a",
    glow: "#ffedbb",
    rayOpacity: 0.5,
  },
  noon: {
    top: "14%",
    left: "22%",
    size: 68,
    core: "#fff3b0",
    glow: "#fffbe0",
    rayOpacity: 0.9,
  },
  evening: {
    top: "40%",
    left: "18%",
    size: 58,
    core: "#ff9a5a",
    glow: "#ffc79a",
    rayOpacity: 0.65,
  },
};

const RAY_COUNT = 10;

interface GardenSunProps {
  mode: TimeOfDay;
  onChange: (mode: TimeOfDay) => void;
}

export default function GardenSun({ mode, onChange }: GardenSunProps) {
  const look = LOOK[mode];
  const boxSize = look.size * 2.4;

  function cycle() {
    onChange(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
  }

  return (
    <motion.button
      type="button"
      onClick={cycle}
      aria-label={`Gökyüzü: ${LABELS[mode]}. Değiştirmek için tıkla.`}
      title={LABELS[mode]}
      className="absolute flex items-center justify-center"
      style={{ width: boxSize, height: boxSize, marginLeft: -boxSize / 2, marginTop: -boxSize / 2 }}
      animate={{ top: look.top, left: look.left }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <motion.svg
        viewBox="-60 -60 120 120"
        className="pointer-events-none absolute inset-0 h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: RAY_COUNT }).map((_, i) => (
          <rect
            key={i}
            x={-2.5}
            y={-(look.size / 2 + 20)}
            width={5}
            height={14}
            rx={2.5}
            fill={look.core}
            opacity={look.rayOpacity}
            transform={`rotate(${(i / RAY_COUNT) * 360})`}
          />
        ))}
      </motion.svg>
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          width: look.size + 26,
          height: look.size + 26,
          background: look.glow,
          opacity: 0.4,
          filter: "blur(4px)",
        }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none relative rounded-full"
        style={{
          width: look.size,
          height: look.size,
          background: `radial-gradient(circle at 35% 32%, ${look.glow}, ${look.core})`,
          boxShadow: `0 0 ${look.size * 0.7}px ${look.size * 0.18}px ${look.glow}`,
        }}
        aria-hidden="true"
      />
    </motion.button>
  );
}

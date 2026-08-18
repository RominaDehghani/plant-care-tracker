"use client";

import { motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";

export type TimeOfDay = "morning" | "noon" | "evening" | "night";

const ORDER: TimeOfDay[] = ["morning", "noon", "evening", "night"];

const LABELS: Record<TimeOfDay, string> = {
  morning: "Sabah",
  noon: "Öğle",
  evening: "Akşam",
  night: "Gece",
};

// The sun (and, at night, the moon) always lives in the sky's top-left
// quadrant — only its color and glow travel across the day, never its
// position off toward an edge, so it never reads as sliding out of frame.
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
  night: {
    top: "20%",
    left: "18%",
    size: 54,
    core: "#f4f1e2",
    glow: "#cfd8ea",
    rayOpacity: 0,
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
  const isNight = mode === "night";

  function cycle() {
    onChange(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
  }

  return (
    <motion.button
      type="button"
      onClick={cycle}
      aria-label={`Gökyüzü: ${LABELS[mode]}. Değiştirmek için tıkla.`}
      title={LABELS[mode]}
      className="absolute flex cursor-pointer items-center justify-center"
      style={{ width: boxSize, height: boxSize, marginLeft: -boxSize / 2, marginTop: -boxSize / 2 }}
      animate={{ top: look.top, left: look.left }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Rays belong to the sun only — the moon is a quiet disc, so at night
          the ray ring is not rendered at all rather than faded to zero. */}
      {!isNight && (
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
      )}
      <span
        className="pointer-events-none absolute rounded-full"
        style={{
          width: look.size + 26,
          height: look.size + 26,
          background: look.glow,
          opacity: isNight ? 0.22 : 0.4,
          filter: "blur(4px)",
        }}
        aria-hidden="true"
      />
      {isNight ? (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none relative"
          style={{
            width: look.size,
            height: look.size,
            filter: `drop-shadow(0 0 ${look.size * 0.32}px ${look.glow})`,
          }}
          aria-hidden="true"
        >
          <defs>
            {/* A crescent carved by masking a second disc out of the first —
                the sky gradient behind shows through, so the moon never
                carries a hardcoded background color. */}
            <mask id="moon-crescent">
              <rect width="100" height="100" fill="black" />
              <circle cx="50" cy="50" r="34" fill="white" />
              <circle cx="70" cy="40" r="29" fill="black" />
            </mask>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="34"
            fill={look.core}
            mask="url(#moon-crescent)"
          />
        </svg>
      ) : (
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
      )}

      {/* Just the click glyph, blinking in every few seconds so the disc
          announces itself as tappable. It is pointer-events-none and sits
          clear of the disc, so the target itself never moves or changes. */}
      <motion.span
        className="pointer-events-none absolute"
        style={{
          top: "50%",
          left: "50%",
          translate: `-50% ${look.size * 0.62}px`,
          color: isNight || mode === "evening" ? "#fff3e6" : "var(--accent-strong)",
        }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.25, 0.75, 1],
          repeat: Infinity,
          repeatDelay: 3.6,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      >
        <MousePointerClick className="h-5 w-5" strokeWidth={2.4} />
      </motion.span>
    </motion.button>
  );
}

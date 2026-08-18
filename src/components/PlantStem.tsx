"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Droplet } from "lucide-react";
import { Plant } from "@/interfaces/Plant";
import { getWateringStatus } from "@/lib/plantStatus";
import { hashString, seededRandom } from "@/lib/layoutJitter";

const statusColor: Record<ReturnType<typeof getWateringStatus>, string> = {
  overdue: "var(--status-overdue)",
  soon: "var(--status-soon)",
  ok: "var(--status-ok)",
};

const LEAF_PATH = "M0,0 C-7,-11 -16,-11 -21,-2 C-16,7 -7,7 0,0 Z";

interface LeafSpec {
  y: number;
  side: number;
  scale: number;
  key: number;
}

function buildLeaves(
  leafCount: number,
  growth: number,
  variant: number,
  stemTopY: number,
  stemBaseY: number
): LeafSpec[] {
  const baseScale = 0.8 + growth * 0.45;
  const span = stemBaseY - stemTopY - 14;

  if (variant === 1) {
    // Paired: leaves grow opposite each other at the same height, like a
    // classic pinnate arrangement.
    const levels = Math.ceil(leafCount / 2);
    const leaves: LeafSpec[] = [];
    for (let level = 0; level < levels; level++) {
      const t = levels === 1 ? 0.5 : level / (levels - 1);
      const y = stemBaseY - 6 - t * span;
      leaves.push({ y, side: 1, scale: baseScale, key: level * 2 });
      if (leaves.length < leafCount) {
        leaves.push({ y, side: -1, scale: baseScale, key: level * 2 + 1 });
      }
    }
    return leaves;
  }

  if (variant === 2) {
    // Clustered: foliage bunches toward the top, bushier and slightly larger.
    return Array.from({ length: leafCount }, (_, i) => {
      const t = leafCount === 1 ? 0.5 : i / (leafCount - 1);
      const eased = Math.pow(t, 1.5);
      const y = stemBaseY - 6 - eased * span;
      const side = i % 2 === 0 ? 1 : -1;
      return { y, side, scale: baseScale * 1.05, key: i };
    });
  }

  // Alternating (default): evenly spaced up the stem.
  return Array.from({ length: leafCount }, (_, i) => {
    const t = leafCount === 1 ? 0.5 : i / (leafCount - 1);
    const y = stemBaseY - 6 - t * span;
    const side = i % 2 === 0 ? 1 : -1;
    return { y, side, scale: baseScale, key: i };
  });
}

interface PlantStemProps {
  plant: Plant;
  growth: number;
  index: number;
  selected: boolean;
  watering: boolean;
  wind: boolean;
  verticalOffset: number;
  horizontalOffset: number;
  onSelect: (id: string, rect: DOMRect) => void;
}

export default function PlantStem({
  plant,
  growth,
  index,
  selected,
  watering,
  wind,
  verticalOffset,
  horizontalOffset,
  onSelect,
}: PlantStemProps) {
  const [hovered, setHovered] = useState(false);
  const swaying = hovered || wind;
  const status = getWateringStatus(plant);
  const color = statusColor[status];
  // The stem always spans nearly the full viewBox (base 108 -> tip 12) so a
  // young plant reads as a small *complete* seedling, never a sliver
  // squashed at the bottom of its box. Only the final pixel height (below)
  // and leaf count/scale vary with growth.
  const stemTopY = 12;
  const stemBaseY = 108;
  const leafCount = Math.round(2 + growth * 4);
  const svgHeight = 55 + growth * 85;
  const variant = Math.floor(
    seededRandom(hashString(plant.id + "-variant")) * 3
  );

  const leaves = buildLeaves(leafCount, growth, variant, stemTopY, stemBaseY);

  return (
    <button
      type="button"
      onClick={(event) =>
        onSelect(plant.id, event.currentTarget.getBoundingClientRect())
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${plant.name} — ${
        status === "overdue"
          ? "bugün sulanmalı"
          : status === "soon"
            ? "sulama yakında"
            : "iyi durumda"
      }`}
      className="group relative flex shrink-0 flex-col items-center justify-end outline-none"
      style={{
        width: 92,
        marginLeft: horizontalOffset,
        transform: `translateY(${verticalOffset}px)`,
      }}
    >
      {status !== "ok" && (
        <span
          className="absolute z-10 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm"
          style={{
            background: color,
            top: (stemTopY / 120) * svgHeight - 18,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          aria-hidden="true"
        >
          {status === "overdue" ? (
            <Droplet className="h-3 w-3" />
          ) : (
            <AlertTriangle className="h-3 w-3" />
          )}
        </span>
      )}

      {watering && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20 flex justify-center gap-1.5"
          style={{ top: (stemTopY / 120) * svgHeight - 34 }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: svgHeight * 0.6, opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.1,
                delay: i * 0.18,
                ease: "easeIn",
              }}
              className="text-sky-500"
            >
              <Droplet className="h-3 w-3" fill="currentColor" />
            </motion.span>
          ))}
        </div>
      )}

      <div className="relative">
        <motion.svg
          viewBox="0 0 60 120"
          style={{ height: svgHeight, width: svgHeight * 0.5 }}
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{
            delay: Math.min(index * 0.05, 0.6),
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="origin-bottom"
        >
          <path
            d={`M30,${stemBaseY} C ${28 + (index % 3)},${
              (stemBaseY + stemTopY) / 2
            } ${32 - (index % 3)},${stemTopY + 18} 30,${stemTopY}`}
            stroke="var(--stem)"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
          {leaves.map((leaf) => (
            <g
              key={leaf.key}
              transform={`translate(30 ${leaf.y}) scale(${
                leaf.side * leaf.scale
              } ${leaf.scale}) rotate(${leaf.side * -18})`}
            >
              <motion.g
                animate={
                  swaying
                    ? { rotate: [0, 12, -8, 10, 0] }
                    : { rotate: 0 }
                }
                transition={{
                  duration: 1,
                  repeat: swaying ? Infinity : 0,
                  ease: "easeInOut",
                  delay: leaf.key * 0.06,
                }}
              >
                <path d={LEAF_PATH} fill={color} />
              </motion.g>
            </g>
          ))}
          {growth > 0.75 && (
            <circle
              cx={30}
              cy={stemTopY - 4}
              r={5}
              fill="var(--accent-strong)"
            />
          )}
        </motion.svg>

        <svg
          viewBox="0 0 40 26"
          className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 opacity-45"
          style={{ width: 26 + growth * 18, height: 16 + growth * 12 }}
          aria-hidden="true"
        >
          <path
            d="M20,0 C17,7 11,9 5,13"
            stroke="var(--soil-deep)"
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M20,0 L20,15"
            stroke="var(--soil-deep)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M20,0 C23,8 29,10 35,16"
            stroke="var(--soil-deep)"
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <span
        className={`mt-1.5 max-w-22 truncate text-xs font-medium transition-colors ${
          selected ? "text-card" : "text-sky-bottom/80"
        } group-hover:text-card`}
      >
        {plant.name}
      </span>
    </button>
  );
}

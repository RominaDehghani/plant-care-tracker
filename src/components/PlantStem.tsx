"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowDown, Droplet } from "lucide-react";
import { Plant } from "@/interfaces/Plant";
import { getWateringStatus } from "@/lib/plantStatus";
import { hashString, seededRandom } from "@/lib/layoutJitter";

const statusColor: Record<ReturnType<typeof getWateringStatus>, string> = {
  overdue: "var(--status-overdue)",
  soon: "var(--status-soon)",
  ok: "var(--status-ok)",
};

const LEAF_PATH = "M0,0 C-7,-11 -16,-11 -21,-2 C-16,7 -7,7 0,0 Z";

// Shared by the resting root mark and the watering overlay that traces it, so
// the two can never drift out of alignment. A taproot plus two laterals and
// two finer hairs, spreading sideways as they descend so the underground half
// reads as a root system taking hold rather than three short scratches.
const ROOT_PATHS = [
  { d: "M20,0 C19,12 21,22 20,36", width: 2.1 },
  { d: "M20,2 C15,10 9,15 2,24", width: 1.8 },
  { d: "M20,2 C25,10 31,15 38,24", width: 1.7 },
  { d: "M20,15 C16,22 13,27 9,34", width: 1.2 },
  { d: "M20,15 C24,22 27,27 31,34", width: 1.1 },
];

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
    // Flowering: foliage keeps to the lower stem so the bloom at the tip
    // reads as the plant's crown instead of competing with leaves.
    return Array.from({ length: leafCount }, (_, i) => {
      const t = leafCount === 1 ? 0.35 : i / (leafCount - 1);
      const y = stemBaseY - 6 - t * span * 0.55;
      const side = i % 2 === 0 ? 1 : -1;
      return { y, side, scale: baseScale * 0.95, key: i };
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
  heightJitter: number;
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
  heightJitter,
  horizontalOffset,
  onSelect,
}: PlantStemProps) {
  const [hovered, setHovered] = useState(false);
  const swaying = hovered || wind;
  const status = getWateringStatus(plant);
  const color = statusColor[status];
  // Which of the three plant templates this record grows into. Derived from
  // the plant's own id, so it is random per plant yet never changes between
  // renders for the same plant.
  const variant = Math.floor(
    seededRandom(hashString(plant.id + "-variant")) * 3
  );
  // The stem always spans nearly the full viewBox (base 108 -> tip 12) so a
  // young plant reads as a small *complete* seedling, never a sliver
  // squashed at the bottom of its box. Only the final pixel height (below)
  // and leaf count/scale vary with growth. The flowering template stops
  // short of the top so its bloom has room inside the viewBox.
  const stemTopY = variant === 2 ? 26 : 12;
  const stemBaseY = 108;
  const leafCount =
    variant === 2 ? Math.round(2 + growth * 2) : Math.round(2 + growth * 4);
  // Jitter varies the plant's own height rather than its position, so every
  // stem still stands squarely on the lawn line.
  const svgHeight = Math.max(46, 55 + growth * 85 + heightJitter);
  // Roots scale with the plant: the oldest, tallest plant has visibly the
  // deepest, widest system. Square, matching the root viewBox, so the
  // drawing is never letterboxed by preserveAspectRatio.
  const rootSize = 30 + growth * 30;

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
      style={{ width: 92, marginLeft: horizontalOffset }}
    >
      {/* "This is the one that needs water": a water-blue arrow hopping just
          above the plant that is actually due. It is pointer-events-none and
          sits clear of the stem, so the one perpetual loop in the scene never
          moves or covers a tap target. Hidden while the plant is being
          watered — the droplets have taken over the message. */}
      {status === "overdue" && !watering && (
        <motion.span
          className="pointer-events-none absolute z-10 text-water"
          style={{
            top: (stemTopY / 120) * svgHeight - 44,
            left: "50%",
            translate: "-50% 0",
          }}
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ArrowDown className="h-5 w-5" strokeWidth={3} />
        </motion.span>
      )}

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
          {/* The third template is a flowering plant: six petals ringing a
              dark eye, in the plant's own status color so the bloom still
              carries "needs water / soon / healthy" the way leaves do. The
              other two templates keep the simple bud circle. */}
          {variant === 2 ? (
            // Positioning lives on this static outer <g>, never on the
            // animated one: framer-motion writes the sway to the CSS
            // `transform` property, which overrides an SVG `transform`
            // attribute on the same element outright — putting translate()
            // there sent the whole bloom to the svg's (0,0) corner, where it
            // floated beside the plant as a detached shape.
            <g transform={`translate(30 ${stemTopY})`}>
              <motion.g
                animate={swaying ? { rotate: [0, 7, -5, 6, 0] } : { rotate: 0 }}
                transition={{
                  duration: 1,
                  repeat: swaying ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <ellipse
                    key={i}
                    cx={0}
                    cy={-8}
                    rx={3.8}
                    ry={8}
                    fill={color}
                    transform={`rotate(${i * 60})`}
                  />
                ))}
                <circle r={3.6} fill="var(--accent-strong)" />
              </motion.g>
            </g>
          ) : (
            growth > 0.75 && (
              <circle
                cx={30}
                cy={stemTopY - 4}
                r={5}
                fill="var(--accent-strong)"
              />
            )
          )}
        </motion.svg>

        <svg
          viewBox="0 0 40 40"
          className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 opacity-45"
          style={{ width: rootSize, height: rootSize }}
          aria-hidden="true"
        >
          {ROOT_PATHS.map((root) => (
            <path
              key={root.d}
              d={root.d}
              stroke="var(--soil-deep)"
              strokeWidth={root.width}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </svg>

        {/* Watering travels down the roots: the same water-blue as the "Sula"
            button traces each root from the stem base outward, so the drink
            visibly reaches underground rather than stopping at the surface. */}
        {watering && (
          <svg
            viewBox="0 0 40 40"
            className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2"
            style={{ width: rootSize, height: rootSize }}
            aria-hidden="true"
          >
            {ROOT_PATHS.map((root, i) => (
              <motion.path
                key={root.d}
                d={root.d}
                stroke="var(--water)"
                strokeWidth={root.width + 0.8}
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.95, 0.95, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 0.35 + i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </svg>
        )}
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

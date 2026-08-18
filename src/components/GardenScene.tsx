"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PlantStem from "@/components/PlantStem";
import SeedMound from "@/components/SeedMound";
import PlantQuickActions from "@/components/PlantQuickActions";
import PlantModal from "@/components/PlantModal";
import GardenSign from "@/components/GardenSign";
import GardenSun, { TimeOfDay } from "@/components/GardenSun";
import { usePlants } from "@/lib/usePlants";
import { hashString, seededRandom } from "@/lib/layoutJitter";
import { Plant } from "@/interfaces/Plant";

type ModalState =
  | { mode: "add"; origin: { x: number; y: number } }
  | {
      mode: "edit";
      origin: { x: number; y: number };
      plantId: string;
      initialValues: Omit<Plant, "id">;
    }
  | null;

const SKY: Record<
  TimeOfDay,
  { gradient: string; heading: string; sub: string; soilOverlay: string }
> = {
  morning: {
    gradient:
      "linear-gradient(to bottom, #a9d6ea 0%, #cdeaf3 45%, #ffe9c7 100%)",
    heading: "text-accent-strong",
    sub: "text-[#3a5a55]",
    soilOverlay: "rgba(255, 200, 120, 0.08)",
  },
  noon: {
    gradient:
      "linear-gradient(to bottom, #7fc4ef 0%, #bfe3f7 45%, #eef7fb 100%)",
    heading: "text-accent-strong",
    sub: "text-[#3a5a55]",
    soilOverlay: "rgba(0, 0, 0, 0)",
  },
  evening: {
    gradient:
      "linear-gradient(to bottom, #5b4272 0%, #c96b5a 55%, #f3ae6e 100%)",
    heading: "text-[#fff3e6]",
    sub: "text-[#ffe0cf]",
    soilOverlay: "rgba(120, 40, 30, 0.18)",
  },
  night: {
    gradient:
      "linear-gradient(to bottom, #101a33 0%, #1e2a4d 50%, #34405e 100%)",
    heading: "text-[#e8eefc]",
    sub: "text-[#c3cde6]",
    soilOverlay: "rgba(10, 18, 40, 0.42)",
  },
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function hourTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 17) return "noon";
  if (hour < 21) return "evening";
  return "night";
}

// Fixed, deterministic star field — never re-randomized on render, and never
// animated, so nothing in the sky becomes a moving target. Each star is its
// own fixed-pixel sparkle positioned by percentage: drawing them into one
// stretched viewBox turned every star into a wide ellipse.
const STARS: { x: number; y: number; size: number; o: number }[] = [
  { x: 6, y: 18, size: 12, o: 0.9 },
  { x: 12, y: 52, size: 8, o: 0.6 },
  { x: 21, y: 12, size: 15, o: 0.85 },
  { x: 29, y: 38, size: 9, o: 0.7 },
  { x: 35, y: 66, size: 10, o: 0.5 },
  { x: 44, y: 20, size: 13, o: 0.85 },
  { x: 51, y: 47, size: 8, o: 0.6 },
  { x: 58, y: 14, size: 11, o: 0.75 },
  { x: 63, y: 58, size: 12, o: 0.6 },
  { x: 71, y: 28, size: 9, o: 0.8 },
  { x: 78, y: 62, size: 13, o: 0.65 },
  { x: 84, y: 22, size: 8, o: 0.9 },
  { x: 90, y: 44, size: 11, o: 0.6 },
  { x: 96, y: 16, size: 10, o: 0.8 },
];

const STAR_PATH =
  "M12,0 C13,7.6 16.4,11 24,12 C16.4,13 13,16.4 12,24 C11,16.4 7.6,13 0,12 C7.6,11 11,7.6 12,0 Z";

function serverTimeOfDay(): TimeOfDay {
  return "noon";
}

function noopSubscribe() {
  return () => {};
}

export default function GardenScene() {
  const { plants, isLoaded, addPlant, updatePlant, removePlant } =
    usePlants();
  const [selectedTag, setSelectedTag] = useState<{
    id: string;
    rect: DOMRect;
  } | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [seedBurst, setSeedBurst] = useState<{ x: number; y: number } | null>(
    null
  );
  const [wateringId, setWateringId] = useState<string | null>(null);
  // Local time is only knowable on the client; useSyncExternalStore lets the
  // real hour-of-day default apply immediately after hydration without a
  // mismatch (server and first client render both see "noon"). A manual
  // sun click overrides this default until the page reloads.
  const autoTimeOfDay = useSyncExternalStore(
    noopSubscribe,
    hourTimeOfDay,
    serverTimeOfDay
  );
  const [manualTimeOfDay, setManualTimeOfDay] = useState<TimeOfDay | null>(
    null
  );
  const timeOfDay = manualTimeOfDay ?? autoTimeOfDay;
  const [windGust, setWindGust] = useState(false);

  const sky = SKY[timeOfDay];

  // Rank 0 = longest in the bed = tallest plant. Plants saved before the
  // createdAt field existed sort as oldest, and same-day plantings keep their
  // insertion order so the row never reshuffles between renders.
  const ageRank = useMemo(() => {
    const ranked = plants
      .map((plant, index) => ({ id: plant.id, planted: plant.createdAt ?? "", index }))
      .sort((a, b) =>
        a.planted === b.planted
          ? a.index - b.index
          : a.planted < b.planted
            ? -1
            : 1
      );
    return new Map(ranked.map((entry, rank) => [entry.id, rank]));
  }, [plants]);

  useEffect(() => {
    let timeoutId: number;
    function scheduleGust() {
      const delay = 9000 + Math.random() * 8000;
      timeoutId = window.setTimeout(() => {
        setWindGust(true);
        window.setTimeout(() => setWindGust(false), 1200);
        scheduleGust();
      }, delay);
    }
    scheduleGust();
    return () => window.clearTimeout(timeoutId);
  }, []);

  function triggerSeedBurst(x: number, y: number) {
    setSeedBurst({ x, y });
    window.setTimeout(() => setSeedBurst(null), 500);
  }

  function handlePlant(rect: DOMRect) {
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    triggerSeedBurst(x, y);
    setSelectedTag(null);
    setModal({ mode: "add", origin: { x, y } });
  }

  function handleSelectPlant(id: string, rect: DOMRect) {
    setModal(null);
    setSelectedTag({ id, rect });
  }

  function handleWaterNow(id: string) {
    updatePlant(id, { lastWateredDate: todayIso() });
    setSelectedTag(null);
    setWateringId(id);
    window.setTimeout(() => setWateringId(null), 1700);
  }

  function handleEditFromTag() {
    if (!selectedTag) return;
    const plant = plants.find((p) => p.id === selectedTag.id);
    if (!plant) return;
    const rect = selectedTag.rect;
    setSelectedTag(null);
    setModal({
      mode: "edit",
      plantId: plant.id,
      origin: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      initialValues: {
        name: plant.name,
        species: plant.species,
        wateringIntervalDays: plant.wateringIntervalDays,
        lastWateredDate: plant.lastWateredDate,
        sunlight: plant.sunlight,
        notes: plant.notes,
      },
    });
  }

  function handleSubmit(values: Omit<Plant, "id">) {
    if (modal?.mode === "edit") {
      updatePlant(modal.plantId, values);
    } else {
      addPlant(values);
    }
    setModal(null);
  }

  function handleDelete() {
    if (modal?.mode === "edit") {
      removePlant(modal.plantId);
    }
    setModal(null);
  }

  const selectedPlant = selectedTag
    ? plants.find((p) => p.id === selectedTag.id)
    : undefined;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4">
        <div className="pointer-events-auto">
          <GardenSign
            emptyHint={
              isLoaded && plants.length === 0
                ? "Henüz bomboş bir toprak. Aşağıdaki filizden ilk bitkini ek."
                : undefined
            }
            plants={plants}
            wind={windGust}
          />
        </div>
      </div>

      <div
        className="relative flex flex-1 flex-col justify-end overflow-hidden pt-24 transition-colors duration-700 sm:pt-28"
        style={{ background: sky.gradient }}
      >
        {/* The sky band flexes instead of holding a fixed height: on a short
            or wide window a fixed 12–16rem spacer pushed the ground block
            past the container and overflow-hidden silently ate the grass
            strip along the top edge. min-h keeps the sun's quadrant intact. */}
        <div className="relative min-h-32 flex-1 sm:min-h-40">
          {timeOfDay === "night" &&
            STARS.map((star, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="pointer-events-none absolute"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: star.size,
                  height: star.size,
                  opacity: star.o,
                  translate: "-50% -50%",
                }}
                aria-hidden="true"
              >
                <path d={STAR_PATH} fill="#f4f7ff" />
              </svg>
            ))}
          <GardenSun mode={timeOfDay} onChange={setManualTimeOfDay} />
          <AnimatePresence>
            {windGust && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    // Distances are in vw, not %: a percentage in a transform
                    // resolves against the element's OWN width, so the old
                    // "115%" moved each streak barely 70px and the gust died
                    // near the left edge instead of crossing the sky.
                    initial={{ x: "-20vw", opacity: 0 }}
                    animate={{ x: "120vw", opacity: [0, 0.6, 0.6, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.6,
                      delay: i * 0.18,
                      ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute left-0 h-px w-24 rounded-full bg-white/60"
                    style={{ top: `${22 + i * 20}%` }}
                    aria-hidden="true"
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative shrink-0">
          {/* The lawn: a shallow band of turf whose top edge is made of real
              blades. Deliberately NO viewBox on the blade layer — the earlier
              pass stretched a viewBox across the full width with
              preserveAspectRatio="none", which squashed every blade to the
              same squat shape and read as a fake plastic comb. Without a
              viewBox, user units are CSS pixels, so blades keep their drawn
              proportions at any window width. */}
          <div className="relative h-9 sm:h-11">
            {/* The turf body's own top edge undulates instead of ruling a
                hard horizontal line across the page. A smooth silhouette
                curve is the one thing safe to stretch with
                preserveAspectRatio="none" — no repeating detail to distort. */}
            <svg
              viewBox="0 0 1440 44"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="turf-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--grass)" />
                  <stop offset="100%" stopColor="var(--grass-deep)" />
                </linearGradient>
              </defs>
              <path
                d="M0,44 L0,20 C 160,9 300,24 460,15 C 620,6 760,22 900,13 C 1040,4 1180,20 1310,11 C 1360,8 1400,15 1440,10 L1440,44 Z"
                fill="url(#turf-body)"
              />
            </svg>
            <svg
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full"
              aria-hidden="true"
            >
              <defs>
                {/* Uneven spacing and two deliberate gaps: evenly pitched
                    blades of similar length were what made the first lawn
                    read as a manufactured comb rather than turf. */}
                <pattern
                  id="grass-tuft"
                  width="186"
                  height="64"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M4,64 C2,46 7,36 3,22" stroke="var(--grass-deep)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <path d="M11,64 C14,50 8,42 15,33" stroke="var(--grass)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M17,64 C15,40 22,28 16,8" stroke="var(--grass-deep)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M27,64 C30,54 24,48 29,43" stroke="var(--grass)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <path d="M34,64 C32,44 39,32 33,18" stroke="var(--grass-deep)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M48,64 C51,52 45,44 50,36" stroke="var(--grass)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <path d="M54,64 C52,48 58,40 53,30" stroke="var(--grass-deep)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M61,64 C64,56 58,50 63,46" stroke="var(--grass)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M69,64 C67,38 74,26 68,4" stroke="var(--grass-deep)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <path d="M77,64 C80,50 74,42 79,31" stroke="var(--grass)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M83,64 C81,52 87,44 82,38" stroke="var(--grass-deep)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M97,64 C100,46 94,36 99,20" stroke="var(--grass)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <path d="M104,64 C102,54 108,48 103,44" stroke="var(--grass-deep)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M111,64 C114,42 108,30 113,14" stroke="var(--grass)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <path d="M118,64 C116,50 122,42 117,34" stroke="var(--grass-deep)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M126,64 C129,56 123,50 128,45" stroke="var(--grass)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M133,64 C131,40 138,28 132,10" stroke="var(--grass-deep)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <path d="M146,64 C149,52 143,44 148,35" stroke="var(--grass)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <path d="M152,64 C150,48 156,40 151,26" stroke="var(--grass-deep)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M159,64 C162,54 156,48 161,42" stroke="var(--grass)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <path d="M167,64 C165,42 172,30 166,16" stroke="var(--grass-deep)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  <path d="M175,64 C178,50 172,42 177,33" stroke="var(--grass)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  <path d="M182,64 C180,54 186,46 181,40" stroke="var(--grass-deep)" strokeWidth="2" strokeLinecap="round" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grass-tuft)" />
            </svg>
          </div>

          <div
            className="relative h-20 sm:h-24"
            style={{
              background:
                "linear-gradient(to bottom, var(--soil-crust) 0%, var(--soil-mid) 22%, var(--soil-mid) 55%, var(--soil-deep) 100%)",
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="soil-flecks"
                  width="64"
                  height="64"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="8" cy="12" r="2" fill="var(--soil-deep)" />
                  <circle cx="34" cy="30" r="1.6" fill="var(--soil-crust)" />
                  <circle cx="50" cy="8" r="1.2" fill="var(--soil-deep)" />
                  <circle cx="20" cy="48" r="1.8" fill="var(--soil-crust)" />
                  <circle cx="58" cy="50" r="1.3" fill="var(--soil-deep)" />
                  <circle cx="44" cy="58" r="1.4" fill="var(--soil-deep)" />
                  <circle cx="14" cy="34" r="1.1" fill="var(--soil-crust)" />
                  <circle cx="62" cy="22" r="1.7" fill="var(--soil-deep)" />
                </pattern>
                <pattern
                  id="soil-roots"
                  width="140"
                  height="120"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M14,0 C 10,22 22,30 16,52 C 11,70 24,80 18,100"
                    fill="none"
                    stroke="var(--soil-deep)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M78,0 C 84,18 72,26 80,46"
                    fill="none"
                    stroke="var(--soil-deep)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <path
                    d="M112,10 C 106,34 118,44 108,68 C 100,88 114,96 106,118"
                    fill="none"
                    stroke="var(--soil-crust)"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#soil-flecks)" />
              <rect
                width="100%"
                height="100%"
                fill="url(#soil-roots)"
                opacity="0.6"
              />
            </svg>

            <div
              className="pointer-events-none absolute inset-0 transition-colors duration-700"
              style={{ background: sky.soilOverlay }}
              aria-hidden="true"
            />

            {/* Empty: the plant row lives in the ground container below so it
                can straddle the grass line instead of being boxed inside the
                soil band. */}
          </div>

          {/* Pinned to the lawn line rather than pulled up by a negative
              margin: the row's own height varies with the tallest plant, so
              a fixed offset from the ground block's bottom is the only way
              every stem reliably stands ON the grass with its roots below. */}
          {/* overflow-x-auto silently makes overflow-y `auto` too, so the
              status badges and watering droplets that sit at negative offsets
              above each stem — and the root marks below it — pushed the row
              into vertical scroll. That let the row be scrolled off its own
              baseline, cutting leaves into floating fragments. The padding
              reserves room for those out-of-box marks and overflow-y-hidden
              guarantees the row can never scroll vertically again. */}
          <div className="soil-scroll absolute inset-x-0 bottom-14 z-10 flex items-end gap-6 overflow-x-auto overflow-y-hidden px-6 pb-2 pt-16 sm:bottom-18 sm:gap-8 sm:px-12">
            {plants.map((plant, index) => {
              // Height is a function of how long the plant has been in the
              // bed, so the earliest-planted one is always the tallest — it
              // is ranked by planting date, not by array position, so editing
              // a plant's "Ekilme" date actually re-sorts the heights.
              const growth =
                plants.length <= 1
                  ? 0.85
                  : 0.42 +
                    0.58 * (1 - (ageRank.get(plant.id) ?? 0) / (plants.length - 1));
              const seed = hashString(plant.id);
              // Jitter goes into the plant's own height, never into a
              // translateY: shifting the whole plant up or down made stems
              // float above the lawn or sink into the soil, and pushed the
              // name label out of the scroll row's box where it was clipped.
              const heightJitter = (seededRandom(seed) - 0.5) * 16;
              const horizontalOffset = (seededRandom(seed + 17) - 0.5) * 14;

              return (
                <PlantStem
                  key={plant.id}
                  plant={plant}
                  index={index}
                  growth={growth}
                  selected={selectedTag?.id === plant.id}
                  watering={wateringId === plant.id}
                  wind={windGust}
                  heightJitter={heightJitter}
                  horizontalOffset={horizontalOffset}
                  onSelect={handleSelectPlant}
                />
              );
            })}
            <SeedMound
              onPlant={handlePlant}
              emphasized={isLoaded && plants.length === 0}
              lightSky={timeOfDay === "morning" || timeOfDay === "noon"}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {seedBurst && (
          <motion.span
            initial={{ opacity: 0.9, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: seedBurst.x,
              top: seedBurst.y,
              translate: "-50% -50%",
            }}
            className="pointer-events-none z-40 h-4 w-4 rounded-full bg-accent"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTag && selectedPlant && (
          <PlantQuickActions
            plant={selectedPlant}
            anchorRect={selectedTag.rect}
            onClose={() => setSelectedTag(null)}
            onWaterNow={() => handleWaterNow(selectedTag.id)}
            onEdit={handleEditFromTag}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <PlantModal
            mode={modal.mode}
            origin={modal.origin}
            initialValues={
              modal.mode === "edit" ? modal.initialValues : undefined
            }
            onClose={() => setModal(null)}
            onSubmit={handleSubmit}
            onDelete={modal.mode === "edit" ? handleDelete : undefined}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

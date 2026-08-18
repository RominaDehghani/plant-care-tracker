"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function hourTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 11) return "morning";
  if (hour < 17) return "noon";
  return "evening";
}

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
        className="relative flex flex-1 flex-col justify-between overflow-hidden pt-28 transition-colors duration-700 sm:pt-32"
        style={{ background: sky.gradient }}
      >
        <div className="relative h-48 sm:h-64">
          <GardenSun mode={timeOfDay} onChange={setManualTimeOfDay} />
          <AnimatePresence>
            {windGust && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ x: "-15%", opacity: 0 }}
                    animate={{ x: "115%", opacity: [0, 0.55, 0.55, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.3,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute h-px w-16 rounded-full bg-white/60"
                    style={{ top: `${22 + i * 20}%` }}
                    aria-hidden="true"
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <svg
            viewBox="0 0 1440 60"
            preserveAspectRatio="none"
            className="block h-8 w-full shrink-0 text-soil-crust sm:h-10"
          >
            <path
              d="M0,60 C 240,14 480,42 720,24 C 960,6 1200,36 1440,16 L1440,60 L0,60 Z"
              fill="currentColor"
            />
          </svg>

          <div
            className="relative"
            style={{
              background:
                "linear-gradient(to bottom, var(--soil-crust) 0%, var(--soil-mid) 22%, var(--soil-mid) 55%, var(--soil-deep) 100%)",
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
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
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#soil-flecks)" />
            </svg>

            <div
              className="pointer-events-none absolute inset-0 transition-colors duration-700"
              style={{ background: sky.soilOverlay }}
              aria-hidden="true"
            />

            <div className="soil-scroll relative flex items-end gap-6 overflow-x-auto px-6 pb-10 pt-8 sm:gap-8 sm:px-12 sm:pb-12">
              {plants.map((plant, index) => {
                const growth =
                  plants.length <= 1
                    ? 0.8
                    : 0.5 + 0.5 * (1 - index / (plants.length - 1));
                const seed = hashString(plant.id);
                const zigzagBase = index % 2 === 0 ? -9 : 7;
                const verticalOffset =
                  zigzagBase + (seededRandom(seed) - 0.5) * 12;
                const horizontalOffset =
                  (seededRandom(seed + 17) - 0.5) * 14;

                return (
                  <PlantStem
                    key={plant.id}
                    plant={plant}
                    index={index}
                    growth={growth}
                    selected={selectedTag?.id === plant.id}
                    watering={wateringId === plant.id}
                    wind={windGust}
                    verticalOffset={verticalOffset}
                    horizontalOffset={horizontalOffset}
                    onSelect={handleSelectPlant}
                  />
                );
              })}
              <SeedMound
                onPlant={handlePlant}
                emphasized={isLoaded && plants.length === 0}
              />
            </div>
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

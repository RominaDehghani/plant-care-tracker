"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Sprout } from "lucide-react";
import { useGardenName } from "@/lib/useGardenName";
import { Plant } from "@/interfaces/Plant";

function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextWateringInfo(plant: Plant) {
  const iso = addDays(plant.lastWateredDate, plant.wateringIntervalDays);
  const date = parseIsoDate(iso);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const label =
    daysUntil < 0
      ? `${Math.abs(daysUntil)} gün geçti`
      : formatRelativeDate(iso) === "Bugün"
        ? "Bugün"
        : daysUntil === 1
          ? "Yarın"
          : `${daysUntil} gün sonra`;
  const colorClass =
    daysUntil < 0
      ? "text-status-overdue"
      : daysUntil <= 1
        ? "text-status-soon"
        : "text-status-ok";
  return { label, colorClass };
}

interface GardenSignProps {
  emptyHint?: string;
  plants: Plant[];
  wind: boolean;
}

// The sign is an opaque card, so its text stays a fixed readable dark tone
// regardless of sky color behind it — unlike the sky-mode text sitting
// directly on the gradient elsewhere in the scene.
const headingClass = "text-accent-strong";
const subClass = "text-foreground-soft";

const WEEKDAYS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Recent dates read as a weekday ("Salı"), the way a person would actually
// describe them; older ones fall back to a plain day count.
function formatRelativeDate(iso?: string) {
  if (!iso) return "—";
  const date = parseIsoDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays > 1 && diffDays < 7) return WEEKDAYS[date.getDay()];
  if (diffDays >= 7) return `${diffDays} gün önce`;
  return `${Math.abs(diffDays)} gün sonra`;
}

export default function GardenSign({
  emptyHint,
  plants,
  wind,
}: GardenSignProps) {
  const [name, setName] = useGardenName();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [showSummary, setShowSummary] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEditing() {
    setDraft(name);
    setEditing(true);
  }

  function commit() {
    setName(draft);
    setEditing(false);
  }

  // The sign only sways when the shared wind gust passes through (same
  // moment the plants sway) — it rests at 0 the rest of the time, so it
  // stays a reliably clickable target rather than a perpetually moving one.
  return (
    <motion.div
      animate={
        wind && !editing ? { rotate: [-1.5, 1.8, -1.2, 0] } : { rotate: 0 }
      }
      transition={
        wind && !editing
          ? { duration: 1.1, ease: "easeInOut" }
          : { duration: 0.15, ease: "easeOut" }
      }
      className="relative mx-auto w-fit origin-top text-center"
    >
      <div className="mx-auto mb-1 flex w-fit justify-between gap-16 px-2" aria-hidden="true">
        <span className="h-4 w-1 rounded-full bg-stem/60" />
        <span className="h-4 w-1 rounded-full bg-stem/60" />
      </div>
      <div
        role={editing ? undefined : "button"}
        tabIndex={editing ? undefined : 0}
        onClick={() => !editing && emptyHint === undefined && setShowSummary((s) => !s)}
        onKeyDown={(e) => {
          if (!editing && emptyHint === undefined && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setShowSummary((s) => !s);
          }
        }}
        className="group relative rounded-2xl border-2 border-stem/30 bg-card/95 px-6 py-3 shadow-[0_16px_32px_-16px_rgba(79,47,31,0.5)] backdrop-blur-sm"
      >
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(name);
                setEditing(false);
              }
            }}
            maxLength={40}
            aria-label="Bahçenin adı"
            className={`w-full min-w-40 bg-transparent text-center font-heading text-2xl font-semibold outline-none sm:text-3xl ${headingClass}`}
          />
        ) : (
          <div className="flex w-full items-center justify-center gap-2">
            <Sprout
              className="h-5 w-5 shrink-0 text-accent sm:h-6 sm:w-6"
              aria-hidden="true"
            />
            <span className={`font-heading text-2xl font-semibold ${headingClass} sm:text-3xl`}>
              {name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startEditing();
              }}
              aria-label={`Bahçenin adını düzenle (şu an: ${name})`}
              className="shrink-0 rounded-full p-1 text-foreground-soft opacity-0 transition-opacity hover:bg-soil-crust/10 group-hover:opacity-60"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {emptyHint !== undefined && (
          <p className={`mt-1 text-sm transition-colors sm:text-base ${subClass}`}>
            {emptyHint}
          </p>
        )}
      </div>

      {emptyHint === undefined && (
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              // Centered via left-1/2 + -translate-x-1/2 rather than
              // inset-x-0 + flex: inset-x-0 sizes this element to its
              // positioning ancestor (the sign's own narrow `w-fit` box),
              // which silently capped the panel's width to the sign's width
              // regardless of the w-[*] classes below — a real layout bug
              // caught while adding the fourth column.
              className="absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2"
            >
              {/* Its own opaque panel (chrome, not scene) so it stays
                  legible over the sky in every time-of-day. Positioned out
                  of flow — opening it never shifts the sign or the page. */}
              <div className="max-h-72 w-[22rem] overflow-x-auto overflow-y-auto rounded-2xl border border-card-border bg-card/95 p-3 text-left shadow-[0_20px_48px_-16px_rgba(79,47,31,0.4)] backdrop-blur-sm sm:w-[30rem]">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={subClass}>
                      <th className="pb-1.5 pr-2 text-left font-medium">
                        Bitki
                      </th>
                      <th className="pb-1.5 pr-2 text-left font-medium">
                        Son sulama
                      </th>
                      <th className="pb-1.5 pr-2 text-left font-medium">
                        Ekilme
                      </th>
                      <th className="pb-1.5 text-left font-medium">
                        Sıradaki sulama
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {plants.map((plant) => {
                      const next = nextWateringInfo(plant);
                      return (
                        <tr key={plant.id} className="border-t border-card-border/70">
                          <td className="py-1.5 pr-2 align-top">
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <Sprout
                                className="h-3 w-3 shrink-0 text-accent"
                                aria-hidden="true"
                              />
                              {plant.name}
                            </div>
                            <div className={subClass}>{plant.species}</div>
                          </td>
                          <td
                            className={`whitespace-nowrap py-1.5 pr-2 align-top ${subClass}`}
                          >
                            {formatRelativeDate(plant.lastWateredDate)}
                          </td>
                          <td
                            className={`whitespace-nowrap py-1.5 pr-2 align-top ${subClass}`}
                          >
                            {formatRelativeDate(plant.createdAt)}
                          </td>
                          <td
                            className={`whitespace-nowrap py-1.5 align-top font-medium ${next.colorClass}`}
                          >
                            {next.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

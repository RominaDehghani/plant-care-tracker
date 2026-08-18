"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Plant } from "@/interfaces/Plant";

const STORAGE_KEY = "bitki-bakim-takipcisi:plants";
// Set the first time the visitor changes anything in the bed. It — not the
// plant list being empty — is what retires the demo: an empty list alone
// cannot distinguish "never used this" from "deliberately cleared the bed",
// and keying off the list left an empty-array leftover permanently blocking
// the demo from ever appearing.
const TOUCHED_KEY = "bitki-bakim-takipcisi:touched";

let cachedPlants: Plant[] | null = null;
const listeners = new Set<() => void>();

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// First-run demo bed. A visitor (or a reviewer) should land in a garden that
// is already planted and already shows the full spread of watering states —
// two plants due today, one due tomorrow, one in a couple of days, one freshly
// planted and comfortable — because the watering-status derivation is the
// whole point of the product and an empty page demonstrates none of it.
//
// Dates are computed relative to today, never hardcoded, so the demo reads
// correctly whenever it is opened. Ids are fixed strings rather than fresh
// UUIDs so each demo plant keeps the same leaf template across reloads.
function demoPlants(): Plant[] {
  return [
    {
      id: "demo-pasa-kilici",
      name: "Paşa Kılıcı",
      species: "Sansevieria trifasciata",
      wateringIntervalDays: 14,
      lastWateredDate: isoDaysAgo(14),
      sunlight: "az",
      notes: "Fazla suya gelmiyor, toprağı tamamen kuruyunca sula.",
      createdAt: isoDaysAgo(150),
    },
    {
      id: "demo-sarmasik",
      name: "Sarmaşık",
      species: "Epipremnum aureum (Pothos)",
      wateringIntervalDays: 7,
      lastWateredDate: isoDaysAgo(7),
      sunlight: "orta",
      createdAt: isoDaysAgo(95),
    },
    {
      id: "demo-baris-cicegi",
      name: "Barış Çiçeği",
      species: "Spathiphyllum wallisii",
      wateringIntervalDays: 5,
      lastWateredDate: isoDaysAgo(4),
      sunlight: "orta",
      notes: "Yaprakları düşmeye başlarsa susamış demektir.",
      createdAt: isoDaysAgo(60),
    },
    {
      id: "demo-nane",
      name: "Mutfak Nane Saksısı",
      species: "Mentha spicata",
      wateringIntervalDays: 5,
      lastWateredDate: isoDaysAgo(3),
      sunlight: "çok",
      createdAt: isoDaysAgo(28),
    },
    {
      id: "demo-sukulent",
      name: "Sukulent",
      species: "Echeveria elegans",
      wateringIntervalDays: 21,
      lastWateredDate: isoDaysAgo(2),
      sunlight: "çok",
      notes: "Yeni geldi, pencere kenarında.",
      createdAt: isoDaysAgo(5),
    },
  ];
}

function readPlants(): Plant[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw === null ? [] : (JSON.parse(raw) as Plant[]);
    // The demo fills an empty bed only until the visitor has touched it once.
    // After that an empty bed stays empty — deleting every plant is a choice,
    // not a blank slate to repopulate.
    if (stored.length === 0 && window.localStorage.getItem(TOUCHED_KEY) === null) {
      return demoPlants();
    }
    return stored;
  } catch {
    return [];
  }
}

function getSnapshot(): Plant[] {
  if (cachedPlants === null) {
    cachedPlants = readPlants();
  }
  return cachedPlants;
}

const EMPTY_PLANTS: Plant[] = [];

function getServerSnapshot(): Plant[] {
  return EMPTY_PLANTS;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function commitPlants(next: Plant[]) {
  cachedPlants = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.localStorage.setItem(TOUCHED_KEY, "1");
  listeners.forEach((listener) => listener());
}

function noopSubscribe() {
  return () => {};
}

export function usePlants() {
  const plants = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLoaded = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const addPlant = useCallback((plant: Omit<Plant, "id">) => {
    commitPlants([
      ...getSnapshot(),
      {
        ...plant,
        id: crypto.randomUUID(),
        createdAt: plant.createdAt ?? new Date().toISOString().slice(0, 10),
      },
    ]);
  }, []);

  const updatePlant = useCallback(
    (id: string, updates: Partial<Omit<Plant, "id">>) => {
      commitPlants(
        getSnapshot().map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const removePlant = useCallback((id: string) => {
    commitPlants(getSnapshot().filter((p) => p.id !== id));
  }, []);

  const getPlant = useCallback(
    (id: string) => plants.find((p) => p.id === id),
    [plants]
  );

  return { plants, isLoaded, addPlant, updatePlant, removePlant, getPlant };
}

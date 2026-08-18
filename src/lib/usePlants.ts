"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Plant } from "@/interfaces/Plant";

const STORAGE_KEY = "bitki-bakim-takipcisi:plants";

let cachedPlants: Plant[] | null = null;
const listeners = new Set<() => void>();

function readPlants(): Plant[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Plant[]) : [];
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

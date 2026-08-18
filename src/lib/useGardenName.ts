"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "bitki-bakim-takipcisi:garden-name";
export const DEFAULT_GARDEN_NAME = "Bahçen";

let cached: string | null = null;
const listeners = new Set<() => void>();

function read(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_GARDEN_NAME;
  } catch {
    return DEFAULT_GARDEN_NAME;
  }
}

function getSnapshot(): string {
  if (cached === null) {
    cached = read();
  }
  return cached;
}

function getServerSnapshot(): string {
  return DEFAULT_GARDEN_NAME;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function useGardenName() {
  const name = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setName = useCallback((next: string) => {
    const trimmed = next.trim() || DEFAULT_GARDEN_NAME;
    cached = trimmed;
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    listeners.forEach((listener) => listener());
  }, []);

  return [name, setName] as const;
}

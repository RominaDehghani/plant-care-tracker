export type SunlightNeed = "az" | "orta" | "çok";

export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringIntervalDays: number;
  lastWateredDate: string;
  sunlight: SunlightNeed;
  notes?: string;
  /** ISO date the plant was added. Optional: plants saved before this field
   * existed won't have one. */
  createdAt?: string;
}

export type WateringStatus = "overdue" | "soon" | "ok";

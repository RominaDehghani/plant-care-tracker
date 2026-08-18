import { Plant, WateringStatus } from "@/interfaces/Plant";

export function getDaysSinceWatered(lastWateredDate: string): number {
  const last = new Date(lastWateredDate);
  const now = new Date();
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - last.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getWateringStatus(
  plant: Pick<Plant, "lastWateredDate" | "wateringIntervalDays">
): WateringStatus {
  const daysRemaining =
    plant.wateringIntervalDays - getDaysSinceWatered(plant.lastWateredDate);
  if (daysRemaining <= 0) return "overdue";
  if (daysRemaining <= 1) return "soon";
  return "ok";
}

import type { TaskPriority } from "./types";

/** Backend priority scale (actions + checklist items). */
const BACKEND = {
  none: 0,
  low: 1,
  normal: 2,
  high: 3,
  urgent: 4,
  critical: 5,
} as const;

export function priorityToBackend(value: TaskPriority | undefined): number {
  switch (value) {
    case "low":
      return BACKEND.low;
    case "high":
      return BACKEND.high;
    case "urgent":
      return BACKEND.urgent;
    case "normal":
    default:
      return BACKEND.normal;
  }
}

export function priorityFromBackend(value: unknown): TaskPriority {
  const n = typeof value === "number" ? value : Number(value);
  if (n >= BACKEND.urgent) return "urgent";
  if (n >= BACKEND.high) return "high";
  if (n >= BACKEND.normal) return "normal";
  if (n >= BACKEND.low) return "low";
  return "normal";
}

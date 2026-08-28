import type { PresenceStatus } from "@/lib/api/device-awareness-types";

export type DeviceStatusSnapshot = Record<string, PresenceStatus>;

export function buildStatusSnapshot(
  own: Array<{ id: string; status: PresenceStatus }>,
  family: Array<{ device: { id: string; status: PresenceStatus } }>,
): DeviceStatusSnapshot {
  const snap: DeviceStatusSnapshot = {};
  for (const d of own) snap[d.id] = d.status;
  for (const entry of family) snap[entry.device.id] = entry.device.status;
  return snap;
}

/** Returns device IDs whose presence status changed between snapshots. */
export function detectPresenceTransitions(
  previous: DeviceStatusSnapshot | null,
  next: DeviceStatusSnapshot,
): string[] {
  if (!previous) return [];
  const changed: string[] = [];
  for (const [id, status] of Object.entries(next)) {
    const prior = previous[id];
    if (prior != null && prior !== status) changed.push(id);
  }
  return changed;
}

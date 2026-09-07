import type { AwarenessPayload } from "@/lib/api/device-awareness-types";
import type { DeviceListItem } from "@/features/device-awareness/lib/presence-utils";
import { computePresenceSummary } from "@/features/device-awareness/lib/presence-utils";

export type DeviceDashboardMetrics = {
  total: number;
  online: number;
  offline: number;
  onCall: number;
};

function awarenessFromItem(item: DeviceListItem): AwarenessPayload | undefined {
  if (item.kind === "own") return item.device.awareness;
  return item.entry.awareness;
}

function isOnCall(awareness?: AwarenessPayload): boolean {
  const state = awareness?.communication?.state;
  return state === "active" || state === "ringing";
}

export function computeDeviceDashboardMetrics(items: DeviceListItem[]): DeviceDashboardMetrics {
  const summary = computePresenceSummary(items);
  let onCall = 0;
  for (const item of items) {
    if (isOnCall(awarenessFromItem(item))) onCall += 1;
  }
  return { ...summary, onCall };
}

import { format, isToday, isYesterday } from "date-fns";
import type {
  AwarenessPayload,
  DeviceSummary,
  FamilyDeviceEntry,
  FamilyOwnerGroup,
  PresenceStatus,
} from "@/lib/api/device-awareness-types";
import { DEVICE_AWARENESS_STALE_MS } from "./sync-config";

export type StatusFilter = "all" | "online" | "offline" | "my_devices";

export type DeviceListItem =
  | { kind: "own"; device: DeviceSummary }
  | { kind: "family"; entry: FamilyDeviceEntry };

export type PresenceSummary = {
  total: number;
  online: number;
  offline: number;
};

/** Human-friendly last-seen label in the user's local timezone. */
export function formatLastSeen(iso?: string | null, now = Date.now()): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = now - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;

  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return format(date, "MMM d, h:mm a");
}

/** Compact label for when list data was last reconciled with the backend. */
export function formatSyncAge(lastSyncedAtMs: number | null, now = Date.now()): string | null {
  if (lastSyncedAtMs == null) return null;
  const diffMs = now - lastSyncedAtMs;
  if (diffMs < 5_000) return "Updated just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Updated ${mins} min ago`;
  return `Updated ${format(new Date(lastSyncedAtMs), "h:mm a")}`;
}

export function formatDeviceRegistered(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "MMM d, yyyy");
}

export function isSyncStale(lastSyncedAtMs: number | null, now = Date.now()): boolean {
  if (lastSyncedAtMs == null) return false;
  return now - lastSyncedAtMs > DEVICE_AWARENESS_STALE_MS;
}

/** Status subtitle for cards — online shows freshness, offline shows last seen. */
export function statusSubtitle(
  status: PresenceStatus,
  lastSeenAt: string,
  lastSyncedAtMs: number | null,
  now = Date.now(),
): string | null {
  if (status === "online") {
    const synced = formatSyncAge(lastSyncedAtMs, now);
    return synced ?? "Online";
  }
  return formatLastSeen(lastSeenAt, now);
}

function presenceSort(a: PresenceStatus, b: PresenceStatus): number {
  if (a === b) return 0;
  return a === "online" ? -1 : 1;
}

export function sortOwnDevices(devices: DeviceSummary[]): DeviceSummary[] {
  return [...devices].sort((a, b) => {
    const byStatus = presenceSort(a.status, b.status);
    if (byStatus !== 0) return byStatus;
    return a.deviceName.localeCompare(b.deviceName);
  });
}

export function sortFamilyGroups(groups: FamilyOwnerGroup[]): FamilyOwnerGroup[] {
  return [...groups]
    .map((group) => ({
      ...group,
      devices: [...group.devices].sort((a, b) => {
        const byStatus = presenceSort(a.device.status, b.device.status);
        if (byStatus !== 0) return byStatus;
        return a.device.deviceName.localeCompare(b.device.deviceName);
      }),
    }))
    .sort((a, b) => a.owner.displayName.localeCompare(b.owner.displayName));
}

export function platformLabel(platform: string): string {
  const normalized = platform.trim().toLowerCase();
  switch (normalized) {
    case "ios":
      return "iOS";
    case "android":
      return "Android";
    case "web":
      return "Web";
    case "desktop":
      return "Desktop";
    default:
      return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Unknown";
  }
}

export function presenceTone(status: PresenceStatus): "success" | "muted" {
  return status === "online" ? "success" : "muted";
}

export function presenceLabel(status: PresenceStatus): string {
  return status === "online" ? "Online" : "Offline";
}

export function matchesStatusFilter(status: PresenceStatus, filter: StatusFilter): boolean {
  if (filter === "all" || filter === "my_devices") return true;
  return status === filter;
}

export function networkLabel(network?: AwarenessPayload["network"]): string | null {
  if (!network?.type) return null;
  const type = network.type.toLowerCase();
  if (network.connected === false) return "None";
  switch (type) {
    case "wifi":
      return "Wi-Fi";
    case "mobile":
      return "Mobile";
    case "none":
    case "offline":
      return "None";
    case "unknown":
      return null;
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export function batteryLabel(battery?: AwarenessPayload["battery"]): string | null {
  if (battery?.level == null) return null;
  const charging = battery.charging ? " · Charging" : "";
  return `${battery.level}%${charging}`;
}

export function communicationLabel(
  communication?: AwarenessPayload["communication"],
): string | null {
  if (!communication?.state) return null;
  if (communication.state === "none") return "No call";
  const type = communication.type ?? "other";
  const isCellular = type === "cellular";
  const isWhatsApp = type === "whatsapp";
  if (communication.state === "ringing") {
    if (isCellular) return "Incoming cellular call";
    if (isWhatsApp) return "Incoming WhatsApp call";
    return "Incoming call";
  }
  if (communication.state === "active") {
    if (isCellular) return "Cellular call active";
    if (isWhatsApp) return "WhatsApp call active";
    return "Call active";
  }
  return null;
}

export function appStateLabel(activity?: AwarenessPayload["activity"]): string | null {
  if (!activity?.appState) return null;
  return activity.appState === "foreground" ? "Foreground" : "Background";
}

export function screenStateLabel(activity?: AwarenessPayload["activity"]): string | null {
  if (!activity?.screenState || activity.screenState === "unknown") return null;
  const label = activity.screenState.charAt(0).toUpperCase() + activity.screenState.slice(1);
  return label;
}

export function computePresenceSummary(items: DeviceListItem[]): PresenceSummary {
  let online = 0;
  let offline = 0;
  for (const item of items) {
    const status = item.kind === "own" ? item.device.status : item.entry.device.status;
    if (status === "online") online += 1;
    else offline += 1;
  }
  return { total: items.length, online, offline };
}

export function filterOwnDevices(
  devices: DeviceSummary[],
  filter: StatusFilter,
): DeviceSummary[] {
  return devices.filter((d) => matchesStatusFilter(d.status, filter));
}

export function filterFamilyGroups(
  groups: FamilyOwnerGroup[],
  currentUserId: string | undefined,
  filter: StatusFilter,
): FamilyOwnerGroup[] {
  return groups
    .filter((g) => g.owner.id !== currentUserId)
    .map((g) => ({
      ...g,
      devices: g.devices.filter((entry) => matchesStatusFilter(entry.device.status, filter)),
    }))
    .filter((g) => g.devices.length > 0);
}

export function buildAllDeviceItems(
  ownDevices: DeviceSummary[],
  familyGroups: FamilyOwnerGroup[],
  currentUserId: string | undefined,
): DeviceListItem[] {
  const items: DeviceListItem[] = ownDevices.map((device) => ({ kind: "own", device }));
  for (const group of familyGroups) {
    if (group.owner.id === currentUserId) continue;
    for (const entry of group.devices) {
      items.push({ kind: "family", entry });
    }
  }
  return items;
}

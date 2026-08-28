import { format, isToday, isYesterday } from "date-fns";
import type {
  DeviceSummary,
  FamilyDeviceEntry,
  FamilyOwnerGroup,
  PresenceStatus,
} from "@/lib/api/device-awareness-types";

export type StatusFilter = "all" | "online" | "offline";

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
  if (filter === "all") return true;
  return status === filter;
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

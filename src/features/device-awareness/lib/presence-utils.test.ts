import { describe, expect, it } from "vitest";
import type {
  DeviceSummary,
  FamilyDeviceEntry,
  FamilyOwnerGroup,
} from "@/lib/api/device-awareness-types";
import {
  batteryLabel,
  buildAllDeviceItems,
  communicationLabel,
  computePresenceSummary,
  filterFamilyGroups,
  filterOwnDevices,
  formatLastSeen,
  formatSyncAge,
  isSyncStale,
  matchesStatusFilter,
  networkLabel,
  platformLabel,
  presenceLabel,
  sortOwnDevices,
} from "./presence-utils";

const awareness = (overrides = {}) => ({
  status: "online" as const,
  lastSeenAt: "2026-08-28T16:00:00.000Z",
  ...overrides,
});

const ownDevice = (overrides: Partial<DeviceSummary> = {}): DeviceSummary => ({
  id: "d1",
  userId: "user-a",
  deviceName: "iPhone",
  platform: "ios",
  status: "online",
  lastSeenAt: "2026-08-28T16:00:00.000Z",
  awareness: awareness(),
  ...overrides,
});

const familyEntry = (overrides: Partial<FamilyDeviceEntry> = {}): FamilyDeviceEntry => ({
  device: {
    id: "d2",
    deviceName: "Android Phone",
    platform: "android",
    status: "offline",
    lastSeenAt: "2026-08-28T15:00:00.000Z",
  },
  owner: { id: "user-b", displayName: "Maa" },
  awareness: {
    status: "offline",
    lastSeenAt: "2026-08-28T15:00:00.000Z",
  },
  scope: "basic",
  ...overrides,
});

describe("formatLastSeen", () => {
  it("returns Just now for recent timestamps", () => {
    const now = new Date("2026-08-28T16:00:30.000Z").getTime();
    expect(formatLastSeen("2026-08-28T16:00:00.000Z", now)).toBe("Just now");
  });

  it("returns minutes ago for sub-hour gaps", () => {
    const now = new Date("2026-08-28T16:05:00.000Z").getTime();
    expect(formatLastSeen("2026-08-28T16:00:00.000Z", now)).toBe("5 min ago");
  });
});

describe("presence helpers", () => {
  it("labels online and offline status", () => {
    expect(presenceLabel("online")).toBe("Online");
    expect(presenceLabel("offline")).toBe("Offline");
  });

  it("formats platform labels", () => {
    expect(platformLabel("ios")).toBe("iOS");
    expect(platformLabel("android")).toBe("Android");
  });

  it("filters by status", () => {
    expect(matchesStatusFilter("online", "online")).toBe(true);
    expect(matchesStatusFilter("online", "offline")).toBe(false);
    expect(matchesStatusFilter("offline", "all")).toBe(true);
    expect(matchesStatusFilter("online", "my_devices")).toBe(true);
  });

  it("labels network battery and communication from backend data", () => {
    expect(networkLabel({ type: "wifi", connected: true })).toBe("Wi-Fi");
    expect(networkLabel({ type: "mobile", connected: true })).toBe("Mobile");
    expect(networkLabel({ type: "wifi", connected: false })).toBe("None");
    expect(batteryLabel({ level: 84, charging: true })).toBe("84% · Charging");
    expect(communicationLabel({ state: "active", type: "cellular" })).toBe(
      "Cellular call active",
    );
    expect(communicationLabel({ state: "ringing", type: "cellular" })).toBe(
      "Incoming cellular call",
    );
    expect(communicationLabel({ state: "none" })).toBe("No call");
    expect(communicationLabel(undefined)).toBeNull();
  });
});

describe("device list helpers", () => {
  const own = [ownDevice(), ownDevice({ id: "d3", status: "offline", awareness: awareness({ status: "offline" }) })];
  const family: FamilyOwnerGroup[] = [
    {
      owner: { id: "user-b", displayName: "Maa" },
      devices: [familyEntry()],
    },
    {
      owner: { id: "user-a", displayName: "Self" },
      devices: [familyEntry({ device: { ...familyEntry().device, id: "d4", status: "online" } })],
    },
  ];

  it("computes summary from own and family devices", () => {
    const items = buildAllDeviceItems(own, family, "user-a");
    expect(items).toHaveLength(3);
    expect(computePresenceSummary(items)).toEqual({ total: 3, online: 1, offline: 2 });
  });

  it("filters own devices by online status", () => {
    expect(filterOwnDevices(own, "online")).toHaveLength(1);
    expect(filterOwnDevices(own, "offline")).toHaveLength(1);
  });

  it("filters family groups excluding current user", () => {
    const filtered = filterFamilyGroups(family, "user-a", "all");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.owner.id).toBe("user-b");
  });

  it("filters family devices by offline status", () => {
    const filtered = filterFamilyGroups(family, "user-a", "offline");
    expect(filtered[0]?.devices).toHaveLength(1);
    expect(filtered[0]?.devices[0]?.device.status).toBe("offline");
  });

  it("sorts own devices with online first", () => {
    const sorted = sortOwnDevices(own);
    expect(sorted[0]?.status).toBe("online");
    expect(sorted[1]?.status).toBe("offline");
  });

  it("marks sync data stale after threshold", () => {
    const now = Date.now();
    expect(isSyncStale(now - 130_000, now)).toBe(true);
    expect(isSyncStale(now - 30_000, now)).toBe(false);
  });

  it("formats sync age for recent updates", () => {
    const now = Date.now();
    expect(formatSyncAge(now - 2_000, now)).toBe("Updated just now");
  });
});

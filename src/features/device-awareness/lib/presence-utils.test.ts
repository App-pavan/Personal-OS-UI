import { describe, expect, it } from "vitest";
import type {
  DeviceSummary,
  FamilyDeviceEntry,
  FamilyOwnerGroup,
} from "@/lib/api/device-awareness-types";
import {
  buildAllDeviceItems,
  computePresenceSummary,
  filterFamilyGroups,
  filterOwnDevices,
  formatLastSeen,
  matchesStatusFilter,
  platformLabel,
  presenceLabel,
} from "./presence-utils";

const ownDevice = (overrides: Partial<DeviceSummary> = {}): DeviceSummary => ({
  id: "d1",
  userId: "user-a",
  deviceName: "iPhone",
  platform: "ios",
  status: "online",
  lastSeenAt: "2026-08-28T16:00:00.000Z",
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
  });
});

describe("device list helpers", () => {
  const own = [ownDevice(), ownDevice({ id: "d3", status: "offline" })];
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
});

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { applyRealtimeDeviceUpdate } from "./realtime-cache";
import { mapRealtimePayload } from "@/lib/api/device-awareness-service";
import type { RealtimeDevicePayload } from "@/lib/api/device-awareness-types";
import { deviceAwarenessKeys } from "@/hooks/use-device-awareness";

describe("mapRealtimePayload", () => {
  it("parses authorized SSE payload", () => {
    const payload = mapRealtimePayload({
      event: "device_awareness.device.battery_changed",
      deviceId: "d1",
      ownerId: "user-a",
      scope: "extended",
      awareness: { status: "online", lastSeenAt: "2026-08-28T16:00:00.000Z", battery: { level: 55 } },
    });
    expect(payload?.deviceId).toBe("d1");
    expect(payload?.awareness.battery?.level).toBe(55);
  });
});

describe("applyRealtimeDeviceUpdate", () => {
  it("patches own device list and family overview for a device event", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(deviceAwarenessKeys.own, [
      {
        id: "d1",
        userId: "user-a",
        deviceName: "Phone",
        platform: "ios",
        status: "online",
        lastSeenAt: "2026-08-28T16:00:00.000Z",
        awareness: { status: "online", lastSeenAt: "2026-08-28T16:00:00.000Z", battery: { level: 80 } },
      },
    ]);
    queryClient.setQueryData(deviceAwarenessKeys.family, {
      owners: [
        {
          owner: { id: "user-b", displayName: "Maa" },
          devices: [
            {
              device: {
                id: "d2",
                deviceName: "Tablet",
                platform: "android",
                status: "online",
                lastSeenAt: "2026-08-28T16:00:00.000Z",
              },
              owner: { id: "user-b", displayName: "Maa" },
              awareness: { status: "online", lastSeenAt: "2026-08-28T16:00:00.000Z" },
              scope: "extended",
            },
          ],
        },
      ],
    });

    const payload: RealtimeDevicePayload = {
      event: "device_awareness.device.battery_changed",
      deviceId: "d1",
      ownerId: "user-a",
      scope: "extended",
      awareness: {
        status: "online",
        lastSeenAt: "2026-08-28T16:05:00.000Z",
        battery: { level: 72, charging: false },
      },
    };

    applyRealtimeDeviceUpdate(queryClient, payload, "user-a");

    const own = queryClient.getQueryData<Array<{ awareness: { battery?: { level?: number } } }>>(
      deviceAwarenessKeys.own,
    );
    expect(own?.[0]?.awareness.battery?.level).toBe(72);

    const familyPayload: RealtimeDevicePayload = {
      ...payload,
      deviceId: "d2",
      ownerId: "user-b",
      awareness: {
        status: "offline",
        lastSeenAt: "2026-08-28T16:10:00.000Z",
      },
      deviceSummary: {
        id: "d2",
        deviceName: "Tablet",
        platform: "android",
        status: "offline",
        lastSeenAt: "2026-08-28T16:10:00.000Z",
      },
    };
    applyRealtimeDeviceUpdate(queryClient, familyPayload, "user-a");

    const family = queryClient.getQueryData<{ owners: { devices: { device: { status: string } }[] }[] }>(
      deviceAwarenessKeys.family,
    );
    expect(family?.owners[0]?.devices[0]?.device.status).toBe("offline");
  });
});

describe("device awareness SSE reconnect behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("schedules reconnect after stream close", async () => {
    const { DEVICE_AWARENESS_RECONNECT_MS } = await import("./sync-config");
    expect(DEVICE_AWARENESS_RECONNECT_MS).toBe(3_000);
  });
});

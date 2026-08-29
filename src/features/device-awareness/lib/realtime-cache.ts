import type { QueryClient } from "@tanstack/react-query";
import type {
  DeviceSummary,
  DeviceViewResponse,
  FamilyDevicesOverview,
  RealtimeDevicePayload,
} from "@/lib/api/device-awareness-types";
import { deviceAwarenessKeys } from "@/hooks/use-device-awareness";

function patchAwarenessSummary(
  summary: { status: string; lastSeenAt: string; appVersion?: string },
  payload: RealtimeDevicePayload,
) {
  summary.status = payload.awareness.status;
  summary.lastSeenAt = payload.awareness.lastSeenAt || summary.lastSeenAt;
  if (payload.deviceSummary?.appVersion) summary.appVersion = payload.deviceSummary.appVersion;
}

export function applyRealtimeDeviceUpdate(
  queryClient: QueryClient,
  payload: RealtimeDevicePayload,
  currentUserId?: string,
) {
  const { deviceId, ownerId } = payload;

  queryClient.setQueryData<DeviceSummary[]>(deviceAwarenessKeys.own, (prev) => {
    if (!prev?.length) return prev;
    const idx = prev.findIndex((d) => d.id === deviceId);
    if (idx < 0) return prev;
    const next = [...prev];
    const device = { ...next[idx]! };
    device.status = payload.awareness.status;
    device.lastSeenAt = payload.awareness.lastSeenAt || device.lastSeenAt;
    device.awareness = payload.awareness;
    if (payload.deviceSummary?.appVersion) device.appVersion = payload.deviceSummary.appVersion;
    next[idx] = device;
    return next;
  });

  queryClient.setQueryData<FamilyDevicesOverview>(deviceAwarenessKeys.family, (prev) => {
    if (!prev?.owners?.length) return prev;
    let changed = false;
    const owners = prev.owners.map((group) => {
      if (group.owner.id !== ownerId) return group;
      const devices = group.devices.map((entry) => {
        if (entry.device.id !== deviceId) return entry;
        changed = true;
        const device = { ...entry.device };
        patchAwarenessSummary(device, payload);
        return {
          ...entry,
          device,
          awareness: payload.awareness,
        };
      });
      return changed ? { ...group, devices } : group;
    });
    return changed ? { owners } : prev;
  });

  queryClient.setQueryData<DeviceViewResponse>(
    deviceAwarenessKeys.detail(deviceId),
    (prev) => {
      if (!prev) return prev;
      const view: DeviceViewResponse = {
        ...prev,
        awareness: payload.awareness,
        scope: payload.scope,
      };
      if (view.device) {
        patchAwarenessSummary(view.device, payload);
        view.device.awareness = payload.awareness;
      }
      if (view.deviceSummary) {
        patchAwarenessSummary(view.deviceSummary, payload);
      }
      if (currentUserId && ownerId === currentUserId && payload.deviceSummary) {
        // no-op: own detail uses device branch
      }
      return view;
    },
  );
}

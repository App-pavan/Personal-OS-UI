import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { PERM } from "@/lib/permissions";
import { deviceAwarenessApi } from "@/lib/api/device-awareness-service";

/** Presence refresh — no device SSE exists; poll at a moderate interval. */
export const DEVICE_AWARENESS_POLL_MS = 45_000;

export const deviceAwarenessKeys = {
  all: ["device-awareness"] as const,
  own: ["device-awareness", "own"] as const,
  family: ["device-awareness", "family"] as const,
  detail: (id: string) => ["device-awareness", "detail", id] as const,
};

export function useOwnDevices() {
  const { can, isReady } = useCapabilities();
  const enabled = isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  return useQuery({
    queryKey: deviceAwarenessKeys.own,
    queryFn: () => deviceAwarenessApi.listOwnDevices(),
    enabled,
    refetchInterval: DEVICE_AWARENESS_POLL_MS,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useFamilyDevices() {
  const { can, isReady } = useCapabilities();
  const enabled = isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  return useQuery({
    queryKey: deviceAwarenessKeys.family,
    queryFn: () => deviceAwarenessApi.listFamilyDevices(),
    enabled,
    refetchInterval: DEVICE_AWARENESS_POLL_MS,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useDeviceDetail(deviceId: string | null) {
  const { can, isReady } = useCapabilities();
  const enabled = isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW) && Boolean(deviceId);

  return useQuery({
    queryKey: deviceAwarenessKeys.detail(deviceId ?? ""),
    queryFn: () => deviceAwarenessApi.getDevice(deviceId!),
    enabled,
    staleTime: 10_000,
    retry: (count, error) => {
      if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        if (status === 403 || status === 404) return false;
      }
      return count < 1;
    },
  });
}

export function useDeviceAwarenessRefresh() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: deviceAwarenessKeys.own }),
      queryClient.invalidateQueries({ queryKey: deviceAwarenessKeys.family }),
    ]);
  };
}

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { ApiRequestError } from "@/lib/api/errors";
import { PERM } from "@/lib/permissions";
import { deviceAwarenessApi } from "@/lib/api/device-awareness-service";
import type {
  DeviceSummary,
  DeviceViewResponse,
  FamilyDevicesOverview,
} from "@/lib/api/device-awareness-types";

export const deviceAwarenessKeys = {
  all: ["device-awareness"] as const,
  own: ["device-awareness", "own"] as const,
  family: ["device-awareness", "family"] as const,
  detail: (id: string) => ["device-awareness", "detail", id] as const,
};

function useDocumentVisible() {
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}

function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return online;
}

function handleForbidden(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: deviceAwarenessKeys.all });
}

export function clearDeviceAwarenessCache(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: deviceAwarenessKeys.all });
}

function useDeviceAwarenessEnabled() {
  const { can, isReady } = useCapabilities();
  return isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);
}

export function useOwnDevices(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const enabled = useDeviceAwarenessEnabled() && (options.enabled ?? true);

  return useQuery({
    queryKey: deviceAwarenessKeys.own,
    queryFn: () => deviceAwarenessApi.listOwnDevices(),
    enabled,
    refetchOnWindowFocus: enabled,
    staleTime: 30_000,
    retry: (count, error) => {
      if (error instanceof ApiRequestError && error.status === 403) {
        handleForbidden(queryClient);
        return false;
      }
      return count < 1;
    },
    placeholderData: (previous: DeviceSummary[] | undefined) => previous,
  });
}

export function useFamilyDevices(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const enabled = useDeviceAwarenessEnabled() && (options.enabled ?? true);

  return useQuery({
    queryKey: deviceAwarenessKeys.family,
    queryFn: () => deviceAwarenessApi.listFamilyDevices(),
    enabled,
    refetchOnWindowFocus: enabled,
    staleTime: 30_000,
    retry: (count, error) => {
      if (error instanceof ApiRequestError && error.status === 403) {
        handleForbidden(queryClient);
        return false;
      }
      return count < 1;
    },
    placeholderData: (previous: FamilyDevicesOverview | undefined) => previous,
  });
}

export function useDeviceDetail(deviceId: string | null, detailOpen = false) {
  const queryClient = useQueryClient();
  const enabled = useDeviceAwarenessEnabled() && Boolean(deviceId);

  return useQuery({
    queryKey: deviceAwarenessKeys.detail(deviceId ?? ""),
    queryFn: () => deviceAwarenessApi.getDevice(deviceId!),
    enabled,
    refetchOnWindowFocus: enabled && detailOpen,
    staleTime: 30_000,
    retry: (count, error) => {
      if (error instanceof ApiRequestError) {
        if (error.status === 403) {
          handleForbidden(queryClient);
          return false;
        }
        if (error.status === 404) return false;
      }
      return count < 1;
    },
    placeholderData: (previous: DeviceViewResponse | undefined) => previous,
  });
}

export function useDeviceAwarenessRefresh() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: deviceAwarenessKeys.own }),
      queryClient.invalidateQueries({ queryKey: deviceAwarenessKeys.family }),
    ]);
  }, [queryClient]);
}

export function useDeviceAwarenessSyncMeta() {
  const visible = useDocumentVisible();
  const browserOnline = useOnlineStatus();
  return { visible, browserOnline };
}

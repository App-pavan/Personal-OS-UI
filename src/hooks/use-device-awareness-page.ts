import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { ApiRequestError, isNotFoundError } from "@/lib/api/errors";
import { PERM } from "@/lib/permissions";
import {
  buildStatusSnapshot,
  detectPresenceTransitions,
} from "@/features/device-awareness/lib/status-transitions";
import { PRESENCE_TRANSITION_MS } from "@/features/device-awareness/lib/sync-config";
import {
  buildAllDeviceItems,
  computePresenceSummary,
  filterFamilyGroups,
  filterOwnDevices,
  isSyncStale,
  sortFamilyGroups,
  sortOwnDevices,
  type StatusFilter,
} from "@/features/device-awareness/lib/presence-utils";
import {
  clearDeviceAwarenessCache,
  useDeviceAwarenessRefresh,
  useDeviceAwarenessSyncMeta,
  useDeviceDetail,
  useFamilyDevices,
  useOwnDevices,
} from "@/hooks/use-device-awareness";
import { useDeviceAwarenessRealtime } from "@/hooks/use-device-awareness-realtime";

export type SyncConnectionStatus =
  | "synced"
  | "syncing"
  | "stale"
  | "offline"
  | "error"
  | "live"
  | "reconnecting";

export function useDeviceAwarenessPage() {
  const queryClient = useQueryClient();
  const { caps, can, isReady } = useCapabilities();
  const currentUserId = caps?.user?.id;
  const hasPermission = isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  const { visible, browserOnline } = useDeviceAwarenessSyncMeta();
  const { realtimeStatus } = useDeviceAwarenessRealtime({ enabled: hasPermission && visible });
  const ownQuery = useOwnDevices({ enabled: hasPermission });
  const familyQuery = useFamilyDevices({ enabled: hasPermission });
  const refreshAll = useDeviceAwarenessRefresh();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [recentTransitions, setRecentTransitions] = useState<Set<string>>(() => new Set());
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const statusSnapshotRef = useRef<ReturnType<typeof buildStatusSnapshot> | null>(null);
  const transitionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const wasVisibleRef = useRef(visible);

  const detailQuery = useDeviceDetail(selectedDeviceId, detailOpen);

  useEffect(() => {
    if (isReady && !can(PERM.DEVICE_AWARENESS_DEVICES_VIEW)) {
      clearDeviceAwarenessCache(queryClient);
      setSelectedDeviceId(null);
      setDetailOpen(false);
    }
  }, [can, isReady, queryClient]);

  useEffect(() => {
    if (!hasPermission) return;
    if (visible && !wasVisibleRef.current) {
      void refreshAll();
      if (selectedDeviceId && detailOpen) void detailQuery.refetch();
    }
    wasVisibleRef.current = visible;
  }, [detailOpen, detailQuery, hasPermission, refreshAll, selectedDeviceId, visible]);

  const ownDevices = ownQuery.data ?? [];
  const familyGroups = familyQuery.data?.owners ?? [];

  const presenceFilter: StatusFilter =
    statusFilter === "my_devices" ? "all" : statusFilter;

  const filteredOwn = useMemo(
    () => sortOwnDevices(filterOwnDevices(ownDevices, presenceFilter)),
    [ownDevices, presenceFilter],
  );

  const filteredFamily = useMemo(
    () =>
      statusFilter === "my_devices"
        ? []
        : sortFamilyGroups(filterFamilyGroups(familyGroups, currentUserId, presenceFilter)),
    [familyGroups, currentUserId, presenceFilter, statusFilter],
  );

  const summary = useMemo(
    () =>
      computePresenceSummary(
        buildAllDeviceItems(ownDevices, familyGroups, currentUserId),
      ),
    [ownDevices, familyGroups, currentUserId],
  );

  const hasCachedData = Boolean(ownQuery.data ?? familyQuery.data);
  const isRefreshing = ownQuery.isFetching || familyQuery.isFetching;

  const initialLoading =
    hasPermission &&
    (ownQuery.isLoading || familyQuery.isLoading) &&
    !hasCachedData;

  const initialError =
    hasPermission &&
    !hasCachedData &&
    (ownQuery.isError || familyQuery.isError)
      ? (ownQuery.error ?? familyQuery.error)
      : null;

  const refreshError =
    hasCachedData && !isRefreshing && (ownQuery.isError || familyQuery.isError)
      ? (ownQuery.error ?? familyQuery.error)
      : null;

  const showEmpty =
    !initialLoading &&
    !initialError &&
    ownDevices.length === 0 &&
    familyGroups.filter((g) => g.owner.id !== currentUserId).every((g) => g.devices.length === 0);

  useEffect(() => {
    if (!hasPermission) return;
    if (ownQuery.isFetching || familyQuery.isFetching) return;
    if (ownQuery.isError && familyQuery.isError) return;
    if (!ownQuery.dataUpdatedAt && !familyQuery.dataUpdatedAt) return;

    const syncedAt = Math.max(ownQuery.dataUpdatedAt, familyQuery.dataUpdatedAt);
    setLastSyncedAt(syncedAt);

    const familyFlat = familyGroups.flatMap((g) => g.devices);
    const nextSnap = buildStatusSnapshot(ownDevices, familyFlat);
    const changed = detectPresenceTransitions(statusSnapshotRef.current, nextSnap);
    statusSnapshotRef.current = nextSnap;

    if (!changed.length) return;

    setRecentTransitions((prev) => {
      const next = new Set(prev);
      for (const id of changed) next.add(id);
      return next;
    });

    for (const id of changed) {
      const existing = transitionTimers.current.get(id);
      if (existing) clearTimeout(existing);
      transitionTimers.current.set(
        id,
        setTimeout(() => {
          setRecentTransitions((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          transitionTimers.current.delete(id);
        }, PRESENCE_TRANSITION_MS),
      );
    }
  }, [
    familyGroups,
    familyQuery.dataUpdatedAt,
    familyQuery.isError,
    familyQuery.isFetching,
    hasPermission,
    ownDevices,
    ownQuery.dataUpdatedAt,
    ownQuery.isError,
    ownQuery.isFetching,
  ]);

  useEffect(() => {
    const timers = transitionTimers.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const syncStatus: SyncConnectionStatus = useMemo(() => {
    if (!browserOnline) return "offline";
    if (realtimeStatus === "reconnecting") return "reconnecting";
    if (initialError || (refreshError && !ownQuery.data && !familyQuery.data)) return "error";
    if (isRefreshing) return "syncing";
    if (realtimeStatus === "live") return "live";
    if (isSyncStale(lastSyncedAt)) return "stale";
    return "synced";
  }, [
    browserOnline,
    familyQuery.data,
    initialError,
    isRefreshing,
    lastSyncedAt,
    ownQuery.data,
    realtimeStatus,
    refreshError,
  ]);

  const openDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback((open: boolean) => {
    setDetailOpen(open);
    if (!open) setSelectedDeviceId(null);
  }, []);

  const handleRefresh = useCallback(() => {
    void refreshAll();
    if (selectedDeviceId) void detailQuery.refetch();
  }, [detailQuery, refreshAll, selectedDeviceId]);

  return {
    currentUserId,
    hasPermission,
    statusFilter,
    setStatusFilter,
    selectedDeviceId,
    detailOpen,
    openDevice,
    closeDetail,
    filteredOwn,
    filteredFamily,
    summary,
    ownDevices,
    familyGroups,
    initialLoading,
    initialError,
    refreshError,
    isRefreshing,
    showEmpty,
    syncStatus,
    realtimeStatus,
    lastSyncedAt,
    recentTransitions,
    detailQuery,
    detailNotFound: isNotFoundError(detailQuery.error),
    detailForbidden:
      detailQuery.error instanceof ApiRequestError && detailQuery.error.status === 403,
    handleRefresh,
  };
}

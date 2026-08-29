import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { applyRealtimeDeviceUpdate } from "@/features/device-awareness/lib/realtime-cache";
import {
  DEVICE_AWARENESS_RECONNECT_MS,
  DEVICE_AWARENESS_RECONCILE_MS,
} from "@/features/device-awareness/lib/sync-config";
import { useDeviceAwarenessRefresh } from "@/hooks/use-device-awareness";
import {
  mapRealtimePayload,
  openDeviceAwarenessStream,
} from "@/lib/api/device-awareness-service";
import { PERM } from "@/lib/permissions";

export type RealtimeConnectionStatus = "connecting" | "live" | "reconnecting" | "disconnected";

const MAX_SSE_RETRIES = 3;

export function useDeviceAwarenessRealtime(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { caps, can, isReady } = useCapabilities();
  const refreshAll = useDeviceAwarenessRefresh();
  const enabled = (options.enabled ?? true) && isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  const [status, setStatus] = useState<RealtimeConnectionStatus>("disconnected");
  const [sseAvailable, setSseAvailable] = useState(true);
  const streamRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconcileTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hadConnectedRef = useRef(false);
  const sseDisabledRef = useRef(false);
  const retryCountRef = useRef(0);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const clearReconcileTimer = useCallback(() => {
    if (reconcileTimer.current) {
      clearInterval(reconcileTimer.current);
      reconcileTimer.current = null;
    }
  }, []);

  const disableSse = useCallback(() => {
    sseDisabledRef.current = true;
    setSseAvailable(false);
    setStatus("disconnected");
    streamRef.current?.close();
    clearReconnectTimer();
    clearReconcileTimer();
    reconcileTimer.current = setInterval(() => {
      void refreshAll();
    }, DEVICE_AWARENESS_RECONCILE_MS);
  }, [clearReconnectTimer, clearReconcileTimer, refreshAll]);

  const connect = useCallback(
    (isReconnect: boolean) => {
      if (!enabled || sseDisabledRef.current) return;
      streamRef.current?.close();
      clearReconnectTimer();
      setStatus(isReconnect ? "reconnecting" : "connecting");

      const stream = openDeviceAwarenessStream({
        onOpen: () => {
          hadConnectedRef.current = true;
          retryCountRef.current = 0;
          setSseAvailable(true);
          setStatus("live");
          clearReconcileTimer();
          if (isReconnect) void refreshAll();
        },
        onEvent: (ev) => {
          if (ev.event === "connected") return;
          try {
            const parsed = mapRealtimePayload(JSON.parse(ev.data));
            if (parsed) {
              applyRealtimeDeviceUpdate(queryClient, parsed, caps?.user?.id);
            }
          } catch {
            // ignore malformed payloads
          }
        },
        onError: () => {
          retryCountRef.current += 1;
          if (!hadConnectedRef.current || retryCountRef.current >= MAX_SSE_RETRIES) {
            disableSse();
            void refreshAll();
            return;
          }
          setStatus("reconnecting");
        },
        onClose: () => {
          if (sseDisabledRef.current || !enabled) return;
          if (!hadConnectedRef.current) {
            retryCountRef.current += 1;
            if (retryCountRef.current >= MAX_SSE_RETRIES) {
              disableSse();
              void refreshAll();
              return;
            }
          }
          setStatus(hadConnectedRef.current ? "reconnecting" : "disconnected");
          clearReconnectTimer();
          reconnectTimer.current = setTimeout(() => connect(true), DEVICE_AWARENESS_RECONNECT_MS);
        },
      });

      streamRef.current = stream;
    },
    [
      caps?.user?.id,
      clearReconnectTimer,
      clearReconcileTimer,
      disableSse,
      enabled,
      queryClient,
      refreshAll,
    ],
  );

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.close();
      streamRef.current = null;
      hadConnectedRef.current = false;
      sseDisabledRef.current = false;
      retryCountRef.current = 0;
      setSseAvailable(true);
      setStatus("disconnected");
      clearReconnectTimer();
      clearReconcileTimer();
      return;
    }
    sseDisabledRef.current = false;
    retryCountRef.current = 0;
    connect(false);
    return () => {
      clearReconnectTimer();
      clearReconcileTimer();
      streamRef.current?.close();
      streamRef.current = null;
    };
  }, [clearReconnectTimer, clearReconcileTimer, connect, enabled]);

  return { realtimeStatus: status, sseAvailable };
}

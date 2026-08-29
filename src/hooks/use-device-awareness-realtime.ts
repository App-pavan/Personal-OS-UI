import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { applyRealtimeDeviceUpdate } from "@/features/device-awareness/lib/realtime-cache";
import { DEVICE_AWARENESS_RECONNECT_MS } from "@/features/device-awareness/lib/sync-config";
import {
  deviceAwarenessKeys,
  useDeviceAwarenessRefresh,
} from "@/hooks/use-device-awareness";
import {
  mapRealtimePayload,
  openDeviceAwarenessStream,
} from "@/lib/api/device-awareness-service";
import { PERM } from "@/lib/permissions";

export type RealtimeConnectionStatus = "connecting" | "live" | "reconnecting" | "disconnected";

export function useDeviceAwarenessRealtime(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { caps, can, isReady } = useCapabilities();
  const refreshAll = useDeviceAwarenessRefresh();
  const enabled = (options.enabled ?? true) && isReady && can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  const [status, setStatus] = useState<RealtimeConnectionStatus>("disconnected");
  const streamRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hadConnectedRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const connect = useCallback(
    (isReconnect: boolean) => {
      if (!enabled) return;
      streamRef.current?.close();
      clearReconnectTimer();
      setStatus(isReconnect ? "reconnecting" : "connecting");

      const stream = openDeviceAwarenessStream({
        onOpen: () => {
          hadConnectedRef.current = true;
          setStatus("live");
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
          setStatus(hadConnectedRef.current ? "reconnecting" : "disconnected");
        },
        onClose: () => {
          setStatus(hadConnectedRef.current ? "reconnecting" : "disconnected");
          if (!enabled) return;
          clearReconnectTimer();
          reconnectTimer.current = setTimeout(() => connect(true), DEVICE_AWARENESS_RECONNECT_MS);
        },
      });

      streamRef.current = stream;
    },
    [caps?.user?.id, clearReconnectTimer, enabled, queryClient, refreshAll],
  );

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.close();
      streamRef.current = null;
      hadConnectedRef.current = false;
      setStatus("disconnected");
      return;
    }
    connect(false);
    return () => {
      clearReconnectTimer();
      streamRef.current?.close();
      streamRef.current = null;
    };
  }, [clearReconnectTimer, connect, enabled]);

  return { realtimeStatus: status };
}

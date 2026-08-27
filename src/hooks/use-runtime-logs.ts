import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openRuntimeLogStream, runtimeApi } from "@/lib/api/runtime-service";
import type { RuntimeLogEvent, RuntimeLogFilter, RuntimeOperation } from "@/lib/api/runtime-types";

export type RuntimeConnectionStatus =
  "idle" | "connecting" | "connected" | "reconnecting" | "error";

export type RuntimeLevelFilter = "all" | "INFO" | "WARN" | "ERROR";

function mergeLogs(existing: RuntimeLogEvent[], incoming: RuntimeLogEvent[]): RuntimeLogEvent[] {
  const map = new Map<string, RuntimeLogEvent>();
  for (const log of existing) map.set(log.id, log);
  for (const log of incoming) map.set(log.id, log);
  return [...map.values()].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

function matchesSearch(log: RuntimeLogEvent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [log.message, log.event, log.operation, log.provider, log.service]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

function matchesLevel(log: RuntimeLogEvent, level: RuntimeLevelFilter): boolean {
  if (level === "all") return true;
  if (level === "INFO") return log.level === "INFO" || log.level === "DEBUG";
  return log.level === level;
}

function filterKey(filter: RuntimeLogFilter): string {
  return JSON.stringify(filter);
}

export function useRuntimeLogs(options: {
  filter?: RuntimeLogFilter;
  enabled?: boolean;
  levelFilter?: RuntimeLevelFilter;
  search?: string;
}) {
  const { filter = {}, enabled = true, levelFilter = "all", search = "" } = options;
  const filterStable = useMemo(() => filter, [filterKey(filter)]);

  const [logs, setLogs] = useState<RuntimeLogEvent[]>([]);
  const [retentionMinutes, setRetentionMinutes] = useState(15);
  const [status, setStatus] = useState<RuntimeConnectionStatus>("idle");
  const [lastEventId, setLastEventId] = useState<string | undefined>();
  const streamRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | undefined>();

  const connect = useCallback(
    (reconnect = false) => {
      if (!enabled) return;

      streamRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

      setStatus(reconnect ? "reconnecting" : "connecting");

      const stream = openRuntimeLogStream(
        filterStable,
        {
          onOpen: () => setStatus("connected"),
          onEvent: (ev) => {
            if (ev.event !== "runtime-log") return;
            try {
              const parsed = JSON.parse(ev.data) as RuntimeLogEvent;
              if (!parsed.id) return;
              setLastEventId(parsed.id);
              lastEventIdRef.current = parsed.id;
              setLogs((prev) => mergeLogs(prev, [parsed]));
            } catch {
              /* ignore malformed events */
            }
          },
          onError: () => {
            setStatus("error");
            reconnectTimer.current = setTimeout(() => connect(true), 3000);
          },
          onClose: () => {
            if (enabled) {
              setStatus("reconnecting");
              reconnectTimer.current = setTimeout(() => connect(true), 2000);
            }
          },
        },
        { lastEventId: reconnect ? lastEventIdRef.current : undefined },
      );

      streamRef.current = stream;
    },
    [enabled, filterStable],
  );

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.close();
      setStatus("idle");
      return;
    }

    let cancelled = false;

    void runtimeApi.logs.list(filterStable).then((res) => {
      if (cancelled) return;
      setRetentionMinutes(res.retentionMinutes);
      setLogs(res.logs);
      if (res.logs.length) {
        const last = res.logs[res.logs.length - 1]!;
        setLastEventId(last.id);
        lastEventIdRef.current = last.id;
      }
      connect(false);
    });

    return () => {
      cancelled = true;
      streamRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect, enabled, filterStable]);

  const visibleLogs = useMemo(
    () => logs.filter((log) => matchesLevel(log, levelFilter) && matchesSearch(log, search)),
    [logs, levelFilter, search],
  );

  return {
    logs: visibleLogs,
    allLogs: logs,
    retentionMinutes,
    status,
    lastEventId,
    reconnect: () => connect(true),
  };
}

export function useRuntimeOperations(options: { enabled?: boolean; pollMs?: number } = {}) {
  const { enabled = true, pollMs = 3000 } = options;
  const [operations, setOperations] = useState<RuntimeOperation[]>([]);
  const [retentionMinutes, setRetentionMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await runtimeApi.operations.list();
      setOperations(res.operations);
      setRetentionMinutes(res.retentionMinutes);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const id = setInterval(() => void refresh(), pollMs);
    return () => clearInterval(id);
  }, [enabled, pollMs, refresh]);

  return { operations, retentionMinutes, loading, error, refresh };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openRuntimeLogStream, runtimeApi } from "@/lib/api/runtime-service";
import type { RuntimeLogEvent, RuntimeLogFilter, RuntimeOperation } from "@/lib/api/runtime-types";
import {
  buildBackendFilter,
  computeSummary,
  deriveOperations,
  deriveProviders,
  deriveServices,
  filterOperations,
  matchesClientFilters,
  sortLogsNewestFirst,
  type ActivitySearchParams,
} from "@/features/runtime/lib/activity-utils";

export type RuntimeConnectionStatus = "idle" | "connecting" | "connected" | "reconnecting" | "error";

function mergeLogs(existing: RuntimeLogEvent[], incoming: RuntimeLogEvent[]): RuntimeLogEvent[] {
  const map = new Map<string, RuntimeLogEvent>();
  for (const log of existing) map.set(log.id, log);
  for (const log of incoming) map.set(log.id, log);
  return [...map.values()];
}

function filterKey(filter: RuntimeLogFilter): string {
  return JSON.stringify(filter);
}

export function useRuntimeActivityPage(params: ActivitySearchParams, enabled = true) {
  const backendFilter = useMemo(() => buildBackendFilter(params), [
    params.service,
    params.provider,
    params.operation,
    params.correlationId,
    params.level,
    params.minutes,
  ]);
  const filterStable = useMemo(() => backendFilter, [filterKey(backendFilter)]);

  const [logs, setLogs] = useState<RuntimeLogEvent[]>([]);
  const [operations, setOperations] = useState<RuntimeOperation[]>([]);
  const [retentionMinutes, setRetentionMinutes] = useState(15);
  const [status, setStatus] = useState<RuntimeConnectionStatus>("idle");
  const [initialLoading, setInitialLoading] = useState(true);
  const streamRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | undefined>();
  const refreshOpsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshOperations = useCallback(async () => {
    try {
      const res = await runtimeApi.operations.list();
      setOperations(res.operations);
      setRetentionMinutes((prev) => res.retentionMinutes ?? prev);
    } catch {
      /* non-fatal */
    }
  }, []);

  const scheduleOperationsRefresh = useCallback(() => {
    if (refreshOpsTimer.current) clearTimeout(refreshOpsTimer.current);
    refreshOpsTimer.current = setTimeout(() => void refreshOperations(), 400);
  }, [refreshOperations]);

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
              lastEventIdRef.current = parsed.id;
              setLogs((prev) => mergeLogs(prev, [parsed]));
              scheduleOperationsRefresh();
            } catch {
              /* ignore */
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
    [enabled, filterStable, scheduleOperationsRefresh],
  );

  useEffect(() => {
    if (!enabled) {
      streamRef.current?.close();
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setInitialLoading(true);

    void Promise.all([
      runtimeApi.logs.list(filterStable),
      runtimeApi.operations.list(),
    ])
      .then(([logsRes, opsRes]) => {
        if (cancelled) return;
        setLogs(logsRes.logs);
        setOperations(opsRes.operations);
        setRetentionMinutes(logsRes.retentionMinutes);
        if (logsRes.logs.length) {
          lastEventIdRef.current = logsRes.logs[logsRes.logs.length - 1]!.id;
        }
        connect(false);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
      streamRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (refreshOpsTimer.current) clearTimeout(refreshOpsTimer.current);
    };
  }, [connect, enabled, filterStable]);

  const filteredLogs = useMemo(() => {
    let result = logs.filter((log) => matchesClientFilters(log, params));

    if (params.status && params.status !== "all") {
      const correlationIds = new Set(
        filterOperations(operations, params)
          .map((op) => op.correlationId)
          .filter(Boolean) as string[],
      );
      if (correlationIds.size > 0) {
        result = result.filter((log) => log.correlationId && correlationIds.has(log.correlationId));
      }
    }

    return sortLogsNewestFirst(result);
  }, [logs, operations, params]);

  const filteredOperations = useMemo(
    () => filterOperations(operations, params),
    [operations, params],
  );

  const activeOperations = useMemo(
    () => filteredOperations.filter((op) => op.status === "RUNNING"),
    [filteredOperations],
  );

  const summary = useMemo(() => computeSummary(logs, operations), [logs, operations]);

  const services = useMemo(() => deriveServices(logs, operations), [logs, operations]);
  const providers = useMemo(() => deriveProviders(logs, operations), [logs, operations]);
  const operationTypes = useMemo(() => deriveOperations(logs, operations), [logs, operations]);

  return {
    logs: filteredLogs,
    allLogs: logs,
    operations: filteredOperations,
    activeOperations,
    summary,
    services,
    providers,
    operationTypes,
    retentionMinutes,
    status,
    initialLoading,
    reconnect: () => connect(true),
    refreshOperations,
  };
}

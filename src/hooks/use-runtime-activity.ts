import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openRuntimeLogStream, runtimeApi } from "@/lib/api/runtime-service";
import { ApiRequestError, errorMessage } from "@/lib/api/errors";
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

const POLL_MS = 3000;

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const streamRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEventIdRef = useRef<string | undefined>();
  const sseDisabled = useRef(false);

  const refreshData = useCallback(async () => {
    try {
      const [logsRes, opsRes] = await Promise.all([
        runtimeApi.logs.list(filterStable),
        runtimeApi.operations.list(),
      ]);
      setLogs((prev) => mergeLogs(prev, logsRes.logs));
      setOperations(opsRes.operations);
      setRetentionMinutes(logsRes.retentionMinutes);
      setLoadError(null);
      if (logsRes.logs.length) {
        lastEventIdRef.current = logsRes.logs[logsRes.logs.length - 1]!.id;
      }
      setStatus((prev) => (prev === "error" ? "connected" : prev === "idle" ? "connected" : prev));
      return true;
    } catch (err) {
      setLoadError(errorMessage(err));
      setStatus("error");
      if (err instanceof ApiRequestError && err.status === 403) {
        setLoadError("Access denied. Sign out and sign back in to refresh your session permissions.");
      }
      return false;
    }
  }, [filterStable]);

  const connectSSE = useCallback(
    (reconnect = false) => {
      if (!enabled || sseDisabled.current) return;

      streamRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

      if (!reconnect) setStatus("connecting");

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
              setLoadError(null);
            } catch {
              /* ignore */
            }
          },
          onError: () => {
            // API Gateway/Lambda cannot keep SSE alive — fall back to polling.
            sseDisabled.current = true;
            streamRef.current?.close();
            setStatus("connected");
          },
          onClose: () => {
            if (enabled && !sseDisabled.current) {
              reconnectTimer.current = setTimeout(() => connectSSE(true), 2000);
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
    setInitialLoading(true);
    sseDisabled.current = false;

    void refreshData()
      .then((ok) => {
        if (cancelled || !ok) return;
        connectSSE(false);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    const pollId = setInterval(() => void refreshData(), POLL_MS);

    return () => {
      cancelled = true;
      streamRef.current?.close();
      clearInterval(pollId);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connectSSE, enabled, filterStable, refreshData]);

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
    loadError,
    reconnect: () => {
      sseDisabled.current = false;
      void refreshData().then((ok) => {
        if (ok) connectSSE(false);
      });
    },
  };
}

import { API_BASE_URL, api, buildQuery, type QueryParams } from "./client";
import { tokenStore } from "./token-store";
import type {
  RuntimeLogFilter,
  RuntimeLogEvent,
  RuntimeLogsResponse,
  RuntimeOperation,
  RuntimeOperationsResponse,
} from "./runtime-types";

export type RuntimeStreamEvent = {
  id?: string;
  event?: string;
  data: string;
};

export type RuntimeStreamHandlers = {
  onEvent: (event: RuntimeStreamEvent) => void;
  onOpen?: () => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
};

function parseSSEBlock(block: string): RuntimeStreamEvent | null {
  const trimmed = block.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;

  let id: string | undefined;
  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of trimmed.split("\n")) {
    if (line.startsWith("id:")) id = line.slice(3).trim();
    else if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }

  if (!dataLines.length) return null;
  return { id, event, data: dataLines.join("\n") };
}

/** Fetch-based SSE (supports Authorization header). */
export function openRuntimeLogStream(
  filter: RuntimeLogFilter = {},
  handlers: RuntimeStreamHandlers,
  options: { lastEventId?: string; signal?: AbortSignal } = {},
): { close: () => void } {
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;

  const params: QueryParams = { ...filter, limit: filter.limit ?? 200 };
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };
  const token = tokenStore.accessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.lastEventId) headers["Last-Event-ID"] = options.lastEventId;

  let closed = false;

  void (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/system/runtime/logs/stream${buildQuery(params)}`,
        { method: "GET", headers, signal },
      );

      if (!response.ok) {
        handlers.onError?.(new Error(`Stream failed (${response.status})`));
        return;
      }

      handlers.onOpen?.();

      const reader = response.body?.getReader();
      if (!reader) {
        handlers.onError?.(new Error("Stream body unavailable"));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const parsed = parseSSEBlock(block);
          if (parsed) handlers.onEvent(parsed);
        }
      }
    } catch (error) {
      if (!closed && !(error instanceof DOMException && error.name === "AbortError")) {
        handlers.onError?.(error);
      }
    } finally {
      if (!closed) handlers.onClose?.();
    }
  })();

  return {
    close: () => {
      closed = true;
      controller.abort();
    },
  };
}

function parseLogEvent(raw: unknown): RuntimeLogEvent {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    id: String(o.id ?? ""),
    timestamp: String(o.timestamp ?? ""),
    level: (String(o.level ?? "INFO").toUpperCase() as RuntimeLogEvent["level"]) || "INFO",
    service: String(o.service ?? ""),
    module: o.module ? String(o.module) : undefined,
    operation: o.operation ? String(o.operation) : undefined,
    event: String(o.event ?? ""),
    message: String(o.message ?? ""),
    correlationId: o.correlationId ? String(o.correlationId) : undefined,
    requestId: o.requestId ? String(o.requestId) : undefined,
    jobId: o.jobId ? String(o.jobId) : undefined,
    userId: o.userId ? String(o.userId) : undefined,
    provider: o.provider ? String(o.provider) : undefined,
    durationMs: typeof o.durationMs === "number" ? o.durationMs : undefined,
    metadata:
      o.metadata && typeof o.metadata === "object"
        ? (o.metadata as Record<string, unknown>)
        : undefined,
    error:
      o.error && typeof o.error === "object"
        ? {
            name: (o.error as Record<string, unknown>).name
              ? String((o.error as Record<string, unknown>).name)
              : undefined,
            message: (o.error as Record<string, unknown>).message
              ? String((o.error as Record<string, unknown>).message)
              : undefined,
            code: (o.error as Record<string, unknown>).code
              ? String((o.error as Record<string, unknown>).code)
              : undefined,
          }
        : undefined,
  };
}

function parseOperation(raw: unknown): RuntimeOperation {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    operationId: String(o.operationId ?? ""),
    type: String(o.type ?? ""),
    status: String(o.status ?? "RUNNING") as RuntimeOperation["status"],
    currentStep: o.currentStep ? String(o.currentStep) : undefined,
    progress: typeof o.progress === "number" ? o.progress : undefined,
    correlationId: o.correlationId ? String(o.correlationId) : undefined,
    jobId: o.jobId ? String(o.jobId) : undefined,
    userId: o.userId ? String(o.userId) : undefined,
    service: o.service ? String(o.service) : undefined,
    module: o.module ? String(o.module) : undefined,
    provider: o.provider ? String(o.provider) : undefined,
    startedAt: String(o.startedAt ?? ""),
    completedAt: o.completedAt ? String(o.completedAt) : undefined,
    durationMs: typeof o.durationMs === "number" ? o.durationMs : undefined,
    error:
      o.error && typeof o.error === "object"
        ? {
            name: (o.error as Record<string, unknown>).name
              ? String((o.error as Record<string, unknown>).name)
              : undefined,
            message: (o.error as Record<string, unknown>).message
              ? String((o.error as Record<string, unknown>).message)
              : undefined,
            code: (o.error as Record<string, unknown>).code
              ? String((o.error as Record<string, unknown>).code)
              : undefined,
          }
        : undefined,
  };
}

export const runtimeApi = {
  logs: {
    list: async (filter: RuntimeLogFilter = {}): Promise<RuntimeLogsResponse> => {
      const res = await api.get<RuntimeLogsResponse>("/system/runtime/logs", filter);
      const data = res.data;
      return {
        retentionMinutes: data.retentionMinutes ?? 15,
        count: data.count ?? 0,
        logs: Array.isArray(data.logs) ? data.logs.map(parseLogEvent) : [],
      };
    },
  },
  operations: {
    list: async (): Promise<RuntimeOperationsResponse> => {
      const res = await api.get<RuntimeOperationsResponse>("/system/runtime/operations");
      const data = res.data;
      return {
        retentionMinutes: data.retentionMinutes ?? 15,
        count: data.count ?? 0,
        operations: Array.isArray(data.operations) ? data.operations.map(parseOperation) : [],
      };
    },
    get: async (operationId: string): Promise<RuntimeOperation> => {
      const res = await api.get<unknown>(`/system/runtime/operations/${operationId}`);
      return parseOperation(res.data);
    },
  },
};

export function wealthSyncCorrelationId(jobId: string): string {
  return `wealth-sync-${jobId}`;
}

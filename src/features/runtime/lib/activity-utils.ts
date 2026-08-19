import type {
  RuntimeLogEvent,
  RuntimeLogFilter,
  RuntimeOperation,
} from "@/lib/api/runtime-types";

export type ActivityLevelFilter = "all" | "DEBUG" | "INFO" | "WARN" | "ERROR";
export type ActivityStatusFilter = "all" | "RUNNING" | "COMPLETED" | "FAILED";
export type ActivityTimeRange = 5 | 10 | 15;

export type ActivitySearchParams = {
  service?: string;
  provider?: string;
  operation?: string;
  correlationId?: string;
  level?: ActivityLevelFilter;
  status?: ActivityStatusFilter;
  minutes?: ActivityTimeRange;
  q?: string;
  eventId?: string;
};

export function isSuccessEvent(log: RuntimeLogEvent): boolean {
  return log.event.includes("COMPLETED") || log.event.includes("SUCCESS");
}

export function eventVisualLevel(log: RuntimeLogEvent): ActivityLevelFilter | "SUCCESS" {
  if (isSuccessEvent(log)) return "SUCCESS";
  return log.level;
}

export function formatEventTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function formatEventDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function humanizeToken(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function serviceLabel(service: string): string {
  return humanizeToken(service);
}

export function providerLabel(provider?: string): string {
  if (!provider) return "";
  const map: Record<string, string> = {
    zerodha: "Zerodha",
    groww: "Groww",
    zerodha_kite: "Zerodha",
    groww_holdings: "Groww",
  };
  return map[provider.toLowerCase()] ?? humanizeToken(provider);
}

export function buildBackendFilter(params: ActivitySearchParams): RuntimeLogFilter {
  const filter: RuntimeLogFilter = { limit: 500 };
  if (params.service && params.service !== "all") filter.service = params.service;
  if (params.provider && params.provider !== "all") filter.provider = params.provider;
  if (params.operation && params.operation !== "all") filter.operation = params.operation;
  if (params.correlationId) filter.correlationId = params.correlationId;
  if (params.level && params.level !== "all" && params.level !== "DEBUG") {
    filter.level = params.level;
  }
  if (params.minutes && params.minutes < 15) {
    filter.since = new Date(Date.now() - params.minutes * 60_000).toISOString();
  }
  return filter;
}

export function matchesClientFilters(
  log: RuntimeLogEvent,
  params: ActivitySearchParams,
): boolean {
  if (params.level && params.level !== "all") {
    if (params.level === "INFO") {
      if (log.level !== "INFO" && log.level !== "DEBUG" && !isSuccessEvent(log)) return false;
    } else if (params.level === "ERROR") {
      if (log.level !== "ERROR") return false;
    } else if (params.level === "WARN") {
      if (log.level !== "WARN") return false;
    } else if (params.level === "DEBUG") {
      if (log.level !== "DEBUG") return false;
    }
  }

  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    const haystack = [log.message, log.event, log.service, log.provider, log.operation, log.module]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  return true;
}

export function filterOperations(
  operations: RuntimeOperation[],
  params: ActivitySearchParams,
): RuntimeOperation[] {
  return operations.filter((op) => {
    if (params.service && params.service !== "all" && op.service !== params.service) return false;
    if (params.provider && params.provider !== "all" && op.provider !== params.provider)
      return false;
    if (params.correlationId && op.correlationId !== params.correlationId) return false;
    if (params.status && params.status !== "all" && op.status !== params.status) return false;
    return true;
  });
}

export function deriveServices(
  logs: RuntimeLogEvent[],
  operations: RuntimeOperation[],
): string[] {
  const set = new Set<string>();
  for (const log of logs) if (log.service) set.add(log.service);
  for (const op of operations) if (op.service) set.add(op.service);
  return [...set].sort();
}

export function deriveProviders(
  logs: RuntimeLogEvent[],
  operations: RuntimeOperation[],
): string[] {
  const set = new Set<string>();
  for (const log of logs) if (log.provider) set.add(log.provider);
  for (const op of operations) if (op.provider) set.add(op.provider);
  return [...set].sort();
}

export function deriveOperations(
  logs: RuntimeLogEvent[],
  ops: RuntimeOperation[],
): string[] {
  const set = new Set<string>();
  for (const log of logs) if (log.operation) set.add(log.operation);
  for (const op of ops) if (op.type) set.add(op.type);
  return [...set].sort();
}

export function computeSummary(
  logs: RuntimeLogEvent[],
  operations: RuntimeOperation[],
): { running: number; errors: number; warnings: number; events: number } {
  const running = operations.filter((op) => op.status === "RUNNING").length;
  const errors = logs.filter((l) => l.level === "ERROR").length;
  const warnings = logs.filter((l) => l.level === "WARN").length;
  return { running, errors, warnings, events: logs.length };
}

export function sortLogsNewestFirst(logs: RuntimeLogEvent[]): RuntimeLogEvent[] {
  return [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function truncateId(id: string, visible = 8): string {
  if (id.length <= visible + 3) return id;
  return `${id.slice(0, visible)}…`;
}

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

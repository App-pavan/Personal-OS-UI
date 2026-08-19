import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SemanticBadge } from "@/components/future";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { RuntimeLogEvent } from "@/lib/api/runtime-types";
import type { RuntimeConnectionStatus, RuntimeLevelFilter } from "@/hooks/use-runtime-logs";
import type { SemanticTone } from "@/lib/design/semantic";

function formatTime(iso: string): string {
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

function levelTone(level: RuntimeLogEvent["level"], event: string): SemanticTone {
  if (event.includes("COMPLETED") || event.includes("SUCCESS")) return "success";
  if (level === "ERROR") return "danger";
  if (level === "WARN") return "warning";
  if (level === "DEBUG") return "muted";
  return "info";
}

function levelLabel(level: RuntimeLogEvent["level"], event: string): string {
  if (event.includes("COMPLETED") || event.includes("SUCCESS")) return "SUCCESS";
  return level;
}

const LEVEL_OPTIONS: { value: RuntimeLevelFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "INFO", label: "Info" },
  { value: "WARN", label: "Warnings" },
  { value: "ERROR", label: "Errors" },
];

export function RuntimeLogViewer({
  logs,
  retentionMinutes,
  status,
  onReconnect,
  levelFilter,
  onLevelFilterChange,
  search,
  onSearchChange,
  showFilters = true,
  className,
}: {
  logs: RuntimeLogEvent[];
  retentionMinutes: number;
  status: RuntimeConnectionStatus;
  onReconnect?: () => void;
  levelFilter: RuntimeLevelFilter;
  onLevelFilterChange: (level: RuntimeLevelFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  showFilters?: boolean;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [pendingNew, setPendingNew] = useState(0);
  const prevCount = useRef(logs.length);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setStuck(!nearBottom);
      if (nearBottom) setPendingNew(0);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    if (logs.length > prevCount.current) {
      const delta = logs.length - prevCount.current;
      if (stuck) setPendingNew((n) => n + delta);
      else el.scrollTop = el.scrollHeight;
    }
    prevCount.current = logs.length;
  }, [logs.length, stuck]);

  const connectionLabel = useMemo(() => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting…";
      case "reconnecting":
        return "Reconnecting…";
      case "error":
        return "Unable to connect";
      default:
        return "Idle";
    }
  }, [status]);

  const live = status === "connected";

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Runtime activity</p>
          <p className="text-xs text-muted-foreground">Last {retentionMinutes} minutes</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full",
                live ? "bg-primary animate-pulse" : "bg-muted-foreground/40",
              )}
              aria-hidden
            />
            <span className={live ? "tone-info-text" : "text-muted-foreground"}>
              {live ? "LIVE" : connectionLabel}
            </span>
          </span>
          {status === "error" && onReconnect ? (
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline"
              onClick={onReconnect}
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>

      {showFilters ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-1">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onLevelFilterChange(opt.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] transition",
                  levelFilter === opt.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search runtime activity…"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full max-h-[min(60vh,520px)] rounded-lg border border-hairline/60 bg-muted/20">
          <div ref={viewportRef} className="max-h-[min(60vh,520px)] overflow-y-auto p-3">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent runtime activity
              </p>
            ) : (
              <ul className="space-y-2">
                {logs.map((log) => (
                  <RuntimeLogRow key={log.id} log={log} />
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>

        {pendingNew > 0 ? (
          <button
            type="button"
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-hairline bg-background px-3 py-1 text-xs shadow-sm"
            onClick={() => {
              const el = viewportRef.current;
              if (el) el.scrollTop = el.scrollHeight;
              setPendingNew(0);
              setStuck(false);
            }}
          >
            ↓ {pendingNew} new event{pendingNew === 1 ? "" : "s"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function RuntimeLogRow({ log }: { log: RuntimeLogEvent }) {
  const tone = levelTone(log.level, log.event);

  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded-md px-2 py-1.5 hover:bg-background/60">
      <time className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {formatTime(log.timestamp)}
      </time>
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <SemanticBadge tone={tone} className="text-[10px]">
            {levelLabel(log.level, log.event)}
          </SemanticBadge>
          {log.event ? (
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              {log.event.replace(/_/g, " ")}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-snug">{log.message}</p>
        {log.error?.message ? (
          <p className="text-xs tone-danger-text">{log.error.message}</p>
        ) : null}
      </div>
    </li>
  );
}

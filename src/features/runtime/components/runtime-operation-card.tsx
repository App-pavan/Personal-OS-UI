import { SemanticBadge } from "@/components/future";
import { cn } from "@/lib/utils";
import type { RuntimeOperation } from "@/lib/api/runtime-types";
import type { SemanticTone } from "@/lib/design/semantic";

function formatDuration(ms?: number): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)}s`;
  const min = Math.floor(sec / 60);
  const rem = Math.round(sec % 60);
  return `${min}m ${rem}s`;
}

function formatRelativeStart(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return `${sec} second${sec === 1 ? "" : "s"} ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  return `${hr} hour${hr === 1 ? "" : "s"} ago`;
}

function statusTone(status: RuntimeOperation["status"]): SemanticTone {
  switch (status) {
    case "RUNNING":
      return "info";
    case "COMPLETED":
      return "success";
    case "FAILED":
      return "danger";
    default:
      return "muted";
  }
}

function humanizeType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeStep(step?: string): string {
  if (!step) return "";
  return step.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toLowerCase()).replace(/^\w/, (c) => c.toUpperCase());
}

export function RuntimeOperationCard({
  operation,
  onViewActivity,
  compact = false,
  className,
}: {
  operation: RuntimeOperation;
  onViewActivity?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const running = operation.status === "RUNNING";
  const tone = statusTone(operation.status);

  return (
    <div
      className={cn(
        "rounded-lg border border-hairline/60 bg-muted/10 px-3 py-2.5",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <SemanticBadge tone={tone} dot={running}>
              {humanizeType(operation.type)}
            </SemanticBadge>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
              {operation.status}
            </span>
          </div>
          {operation.currentStep ? (
            <p className={cn("font-medium", running && "tone-info-text")}>
              {humanizeStep(operation.currentStep)}
            </p>
          ) : null}
          {operation.error?.message ? (
            <p className="tone-danger-text">{operation.error.message}</p>
          ) : null}
        </div>
        {onViewActivity ? (
          <button
            type="button"
            onClick={onViewActivity}
            className="shrink-0 text-[11px] text-primary underline-offset-2 hover:underline"
          >
            View activity
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>Started {formatRelativeStart(operation.startedAt)}</span>
        {operation.provider ? <span>Provider: {operation.provider}</span> : null}
        {operation.durationMs != null ? (
          <span>Duration: {formatDuration(operation.durationMs)}</span>
        ) : null}
      </div>
    </div>
  );
}

export function RuntimeOperationsList({
  operations,
  onViewActivity,
  filterCorrelationId,
  emptyLabel = "No active operations",
}: {
  operations: RuntimeOperation[];
  onViewActivity?: (operation: RuntimeOperation) => void;
  filterCorrelationId?: string;
  emptyLabel?: string;
}) {
  const filtered = filterCorrelationId
    ? operations.filter((op) => op.correlationId === filterCorrelationId)
    : operations;

  if (!filtered.length) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {filtered.map((op) => (
        <RuntimeOperationCard
          key={op.operationId}
          operation={op}
          compact
          onViewActivity={onViewActivity ? () => onViewActivity(op) : undefined}
        />
      ))}
    </div>
  );
}

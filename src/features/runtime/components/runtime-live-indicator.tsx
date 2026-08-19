import { cn } from "@/lib/utils";
import type { RuntimeConnectionStatus } from "@/hooks/use-runtime-activity";

export function RuntimeLiveIndicator({
  status,
  retentionMinutes,
  onRetry,
  className,
}: {
  status: RuntimeConnectionStatus;
  retentionMinutes: number;
  onRetry?: () => void;
  className?: string;
}) {
  const live = status === "connected";
  const label =
    status === "connected"
      ? "LIVE"
      : status === "connecting"
        ? "CONNECTING"
        : status === "reconnecting"
          ? "RECONNECTING"
          : status === "error"
            ? "DISCONNECTED"
            : "IDLE";

  return (
    <div className={cn("flex flex-col items-end gap-0.5 text-right", className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full",
            live ? "bg-primary animate-pulse" : "bg-muted-foreground/50",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "font-mono text-[11px] tracking-[0.18em]",
            live ? "tone-info-text" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {status === "error" && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] text-primary underline-offset-2 hover:underline"
          >
            Retry
          </button>
        ) : null}
      </div>
      <span className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        Last {retentionMinutes} minutes
      </span>
    </div>
  );
}

export function RuntimeConnectionBanner({
  status,
  onRetry,
}: {
  status: RuntimeConnectionStatus;
  onRetry?: () => void;
}) {
  if (status === "connected" || status === "idle" || status === "connecting") return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs",
        status === "error" ? "tone-danger-border tone-danger-bg/40" : "border-hairline bg-muted/20",
      )}
    >
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground/50" aria-hidden />
        {status === "reconnecting" ? "Live stream reconnecting…" : "Live stream disconnected"}
      </span>
      {status === "error" && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-primary underline-offset-2 hover:underline"
        >
          Retry connection
        </button>
      ) : null}
    </div>
  );
}

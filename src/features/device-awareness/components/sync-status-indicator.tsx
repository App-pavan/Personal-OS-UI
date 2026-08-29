import { SemanticBadge } from "@/components/future";
import { formatSyncAge, isSyncStale } from "@/features/device-awareness/lib/presence-utils";
import type { SyncConnectionStatus } from "@/hooks/use-device-awareness-page";
import { cn } from "@/lib/utils";

export function SyncStatusIndicator({
  status,
  lastSyncedAt,
  className,
}: {
  status: SyncConnectionStatus;
  lastSyncedAt: number | null;
  className?: string;
}) {
  const syncAge = formatSyncAge(lastSyncedAt);

  if (status === "offline") {
    return (
      <span
        className={cn("text-[11px] text-muted-foreground", className)}
        role="status"
        aria-live="polite"
      >
        Connection lost — showing last known state
      </span>
    );
  }

  if (status === "reconnecting") {
    return (
      <span className={cn("text-[11px] text-muted-foreground", className)} role="status">
        Live stream reconnecting…
      </span>
    );
  }

  if (status === "syncing") {
    return (
      <span className={cn("text-[11px] text-muted-foreground", className)} role="status">
        Syncing…
      </span>
    );
  }

  if (status === "stale" || isSyncStale(lastSyncedAt)) {
    return (
      <span
        className={cn("text-[11px] tone-warning-text", className)}
        role="status"
        aria-live="polite"
      >
        Data may be outdated
        {syncAge ? ` · ${syncAge.toLowerCase()}` : null}
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className={cn("text-[11px] text-muted-foreground", className)} role="status">
        Unable to update device information
      </span>
    );
  }

  if (status === "live") {
    return (
      <span className={cn("inline-flex items-center gap-2 text-[11px]", className)} role="status">
        <SemanticBadge tone="success" dot className="text-[10px]">
          Live
        </SemanticBadge>
        {syncAge ? <span className="text-muted-foreground">{syncAge}</span> : null}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2 text-[11px]", className)} role="status">
      <SemanticBadge tone="success" dot className="text-[10px]">
        Synced
      </SemanticBadge>
      {syncAge ? <span className="text-muted-foreground">{syncAge}</span> : null}
    </span>
  );
}

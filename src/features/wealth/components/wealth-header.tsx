import { RefreshCw } from "lucide-react";
import { FuturisticButton } from "@/components/future";
import { ModuleHeader } from "@/components/os/primitives";
import { Skeleton } from "@/components/os/state-views";
import { formatRelativeTime } from "../lib/format";
import type { WealthUiState } from "../lib/data-status";

export function WealthHeader({
  syncLabel,
  uiState,
  onSync,
  syncing,
}: {
  syncLabel?: string | null;
  uiState: WealthUiState;
  onSync: () => void;
  syncing: boolean;
}) {
  const syncDisabled = syncing || uiState === "LOADING" || uiState === "NO_CONNECTION";

  return (
    <ModuleHeader
      eyebrow="Wealth system"
      moduleCode="02"
      title="Wealth"
      description="Your financial overview and investment portfolio"
      actions={
        <div className="flex flex-col items-end gap-1">
          <FuturisticButton onClick={onSync} disabled={syncDisabled}>
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync now"}
          </FuturisticButton>
          {syncLabel ? (
            <span className="text-[11px] text-muted-foreground">{syncLabel}</span>
          ) : null}
        </div>
      }
    />
  );
}

export function WealthSummarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="surface-card p-4 md:p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SyncStatusBanner({
  uiState,
  lastSyncedLabel,
  errorMessage,
  onRetry,
}: {
  uiState: WealthUiState;
  lastSyncedLabel?: string | null;
  errorMessage?: string;
  onRetry?: () => void;
}) {
  if (uiState === "LOADING" || uiState === "CONNECTED" || uiState === "EMPTY") {
    if (lastSyncedLabel) {
      return <p className="text-xs text-muted-foreground">Last synced {lastSyncedLabel}</p>;
    }
    return null;
  }

  if (uiState === "SYNCING") {
    return <p className="text-xs tone-info-text">Syncing your accounts…</p>;
  }

  if (uiState === "PARTIAL") {
    return (
      <div className="rounded-md border tone-warning-border tone-warning-bg px-3 py-2 text-xs tone-warning-text">
        Some data could not be synchronized. Successful holdings are still shown.
      </div>
    );
  }

  if (uiState === "ERROR") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border tone-danger-border tone-danger-bg px-3 py-2 text-xs">
        <span className="tone-danger-text">{errorMessage ?? "Sync failed. Try again."}</span>
        {onRetry ? (
          <FuturisticButton variant="ghost" className="h-7 text-[11px]" onClick={onRetry}>
            Try again
          </FuturisticButton>
        ) : null}
      </div>
    );
  }

  return null;
}

export function buildSyncLabel(lastSyncedAt?: string | null, syncing?: boolean): string | null {
  if (syncing) return "Sync in progress";
  return lastSyncedAt ? `Last synced ${formatRelativeTime(lastSyncedAt)}` : null;
}

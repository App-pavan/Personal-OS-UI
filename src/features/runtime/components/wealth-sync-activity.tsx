import { useMemo, useState } from "react";
import { FuturisticButton } from "@/components/future";
import { RuntimeActivitySheet } from "./runtime-activity-sheet";
import { RuntimeOperationCard } from "./runtime-operation-card";
import { useRuntimeOperations } from "@/hooks/use-runtime-logs";
import { wealthSyncCorrelationId } from "@/lib/api/runtime-service";
import type { RuntimeLogFilter } from "@/lib/api/runtime-types";

export function WealthSyncActivity({
  syncing,
  syncJobId,
  providerLabel,
  errorMessage,
}: {
  syncing: boolean;
  syncJobId?: string | null;
  providerLabel?: string;
  errorMessage?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const correlationId = syncJobId ? wealthSyncCorrelationId(syncJobId) : undefined;

  const { operations } = useRuntimeOperations({
    enabled: Boolean(syncing || syncJobId),
    pollMs: syncing ? 2000 : 8000,
  });

  const operation = useMemo(() => {
    if (!correlationId) return operations.find((op) => op.status === "RUNNING" && op.service === "wealth");
    return operations.find((op) => op.correlationId === correlationId);
  }, [correlationId, operations]);

  const filter: RuntimeLogFilter = useMemo(
    () => ({
      service: "wealth",
      ...(correlationId ? { correlationId } : {}),
      limit: 200,
    }),
    [correlationId],
  );

  if (!syncing && !operation && !errorMessage) return null;

  if (errorMessage && !syncing && !operation) {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border tone-danger-border tone-danger-bg px-3 py-2 text-xs">
          <div>
            <p className="font-medium tone-danger-text">Sync failed</p>
            <p className="mt-0.5 tone-danger-text/90">{errorMessage}</p>
          </div>
          {syncJobId ? (
            <FuturisticButton
              variant="ghost"
              className="h-7 text-[11px]"
              onClick={() => setSheetOpen(true)}
            >
              View activity →
            </FuturisticButton>
          ) : null}
        </div>
        <RuntimeActivitySheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          filter={filter}
          title="Wealth sync activity"
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {operation ? (
          <RuntimeOperationCard
            operation={operation}
            compact
            onViewActivity={() => setSheetOpen(true)}
          />
        ) : syncing ? (
          <div className="rounded-md border border-hairline/60 bg-muted/10 px-3 py-2 text-xs">
            <p className="flex items-center gap-1.5 font-medium tone-info-text">
              <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
              Sync in progress
            </p>
            {providerLabel ? (
              <p className="mt-1 text-muted-foreground">Provider: {providerLabel}</p>
            ) : null}
            <button
              type="button"
              className="mt-2 text-[11px] text-primary underline-offset-2 hover:underline"
              onClick={() => setSheetOpen(true)}
            >
              View live activity →
            </button>
          </div>
        ) : null}
      </div>

      <RuntimeActivitySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filter={filter}
        title="Wealth sync activity"
        description="Live sync events from the last 15 minutes."
      />
    </>
  );
}

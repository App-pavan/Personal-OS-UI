import { RefreshCw, Smartphone } from "lucide-react";
import {
  HudPanel,
  MetricPanel,
  PeriodChip,
  SectionHeader,
  SemanticBadge,
} from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { DeviceDetailPanel } from "./device-detail-panel";
import { FamilyDeviceCard, OwnDeviceCard } from "./device-card";
import { SyncStatusIndicator } from "./sync-status-indicator";
import { useDeviceAwarenessPage } from "@/hooks/use-device-awareness-page";
import { cn } from "@/lib/utils";

export function DeviceFamilyDashboard() {
  const page = useDeviceAwarenessPage();

  const {
    currentUserId,
    statusFilter,
    setStatusFilter,
    filteredOwn,
    filteredFamily,
    summary,
    initialLoading,
    initialError,
    refreshError,
    isRefreshing,
    showEmpty,
    syncStatus,
    lastSyncedAt,
    recentTransitions,
    detailQuery,
    selectedDeviceId,
    detailOpen,
    openDevice,
    closeDetail,
    handleRefresh,
  } = page;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
      <SectionHeader
        system="Personal OS"
        module="Family awareness"
        title="Family Device Awareness"
        subtitle="See the current availability of your family devices."
        actions={
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline/60 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
              aria-label={isRefreshing ? "Refreshing device awareness" : "Refresh device awareness"}
            >
              <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
            <SyncStatusIndicator status={syncStatus} lastSyncedAt={lastSyncedAt} />
          </div>
        }
      />

      {refreshError && !initialError ? (
        <div className="rounded-lg border border-hairline/60 bg-surface/40 px-4 py-3 text-sm text-muted-foreground">
          <p>Unable to update device information.</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 text-xs text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Retry
          </button>
        </div>
      ) : null}

      <MetricPanel accent="aqua">
        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Family devices
        </p>
        {initialLoading ? (
          <RowsSkeleton rows={1} />
        ) : initialError ? (
          <p className="mt-2 text-sm text-muted-foreground">—</p>
        ) : (
          <>
            <p className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">
              {summary.total} device{summary.total === 1 ? "" : "s"}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <SemanticBadge tone="success" dot>
                {summary.online} online
              </SemanticBadge>
              <SemanticBadge tone="muted" dot>
                {summary.offline} offline
              </SemanticBadge>
            </div>
          </>
        )}
      </MetricPanel>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter devices by presence status"
      >
        {(["all", "online", "offline", "my_devices"] as const).map((filter) => (
          <PeriodChip
            key={filter}
            label={
              filter === "all"
                ? "All"
                : filter === "online"
                  ? "Online"
                  : filter === "offline"
                    ? "Offline"
                    : "My devices"
            }
            active={statusFilter === filter}
            onClick={() => setStatusFilter(filter)}
            tone="aqua"
          />
        ))}
      </div>

      {initialLoading ? (
        <HudPanel glow className="p-5">
          <RowsSkeleton rows={4} />
        </HudPanel>
      ) : initialError ? (
        <ErrorState
          error={initialError}
          title="Unable to load family devices"
          onRetry={handleRefresh}
        />
      ) : showEmpty ? (
        <EmptyState
          title="No devices available"
          line="No registered family devices are available yet."
          icon={<Smartphone className="size-5" />}
          tone="aqua"
        />
      ) : (
        <div className="space-y-8 animate-hud-in">
          {filteredOwn.length > 0 ? (
            <section aria-labelledby="your-devices-heading">
              <h2 id="your-devices-heading" className="label-eyebrow mb-4">
                Your devices
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOwn.map((device) => (
                  <div
                    key={device.id}
                    className={cn(
                      "animate-in fade-in duration-300",
                      recentTransitions.has(device.id) && "animate-in fade-in duration-500",
                    )}
                  >
                    <OwnDeviceCard
                      device={device}
                      statusTransition={recentTransitions.has(device.id)}
                      lastSyncedAtMs={lastSyncedAt}
                      onClick={() => openDevice(device.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {filteredFamily.length > 0 ? (
            <section aria-labelledby="family-devices-heading">
              <h2 id="family-devices-heading" className="label-eyebrow mb-4">
                Family
              </h2>
              <div className="space-y-6">
                {filteredFamily.map((group) => (
                  <div key={group.owner.id}>
                    <div className="mb-3 flex items-center gap-3">
                      <p className="text-sm font-medium">{group.owner.displayName}</p>
                      <hr className="tech-divider min-w-0 flex-1 border-0" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.devices.map((entry) => (
                        <div
                          key={entry.device.id}
                          className="animate-in fade-in duration-300"
                        >
                          <FamilyDeviceCard
                            entry={entry}
                            statusTransition={recentTransitions.has(entry.device.id)}
                            lastSyncedAtMs={lastSyncedAt}
                            onClick={() => openDevice(entry.device.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {!showEmpty && !filteredOwn.length && !filteredFamily.length ? (
            <div className="hud-panel angular-clip p-5">
              <p className="text-sm text-muted-foreground">
                No {statusFilter === "all" ? "" : `${statusFilter} `}devices match this filter.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {!initialLoading && !initialError && summary.total > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Device data loads once when you open this page. Use Refresh to fetch the latest state.
        </p>
      ) : null}

      <DeviceDetailPanel
        deviceId={selectedDeviceId}
        open={detailOpen}
        onOpenChange={closeDetail}
        view={detailQuery.data}
        currentUserId={currentUserId}
        loading={detailQuery.isLoading}
        error={detailQuery.error}
        lastSyncedAtMs={lastSyncedAt}
        onRetry={() => void detailQuery.refetch()}
      />
    </div>
  );
}

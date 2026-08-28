import { useMemo, useState } from "react";
import { RefreshCw, Smartphone } from "lucide-react";
import {
  HudPanel,
  MetricPanel,
  PeriodChip,
  SectionHeader,
  SemanticBadge,
} from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import {
  useDeviceAwarenessRefresh,
  useDeviceDetail,
  useFamilyDevices,
  useOwnDevices,
} from "@/hooks/use-device-awareness";
import { cn } from "@/lib/utils";
import {
  buildAllDeviceItems,
  computePresenceSummary,
  filterFamilyGroups,
  filterOwnDevices,
  type StatusFilter,
} from "../lib/presence-utils";
import { DeviceDetailPanel } from "./device-detail-panel";
import { FamilyDeviceCard, OwnDeviceCard } from "./device-card";

export function DeviceFamilyDashboard() {
  const { caps } = useCapabilities();
  const currentUserId = caps?.user?.id;

  const ownQuery = useOwnDevices();
  const familyQuery = useFamilyDevices();
  const refreshAll = useDeviceAwarenessRefresh();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const detailQuery = useDeviceDetail(selectedDeviceId);

  const ownDevices = ownQuery.data ?? [];
  const familyGroups = familyQuery.data?.owners ?? [];

  const filteredOwn = useMemo(
    () => filterOwnDevices(ownDevices, statusFilter),
    [ownDevices, statusFilter],
  );

  const filteredFamily = useMemo(
    () => filterFamilyGroups(familyGroups, currentUserId, statusFilter),
    [familyGroups, currentUserId, statusFilter],
  );

  const summary = useMemo(
    () =>
      computePresenceSummary(
        buildAllDeviceItems(ownDevices, familyGroups, currentUserId),
      ),
    [ownDevices, familyGroups, currentUserId],
  );

  const initialLoading =
    (ownQuery.isLoading || familyQuery.isLoading) && !ownQuery.data && !familyQuery.data;
  const loadError = ownQuery.error ?? familyQuery.error;
  const isRefreshing = ownQuery.isFetching || familyQuery.isFetching;

  const hasAnyDevices = ownDevices.length > 0 || filteredFamily.length > 0 || filteredOwn.length > 0;
  const showEmpty =
    !initialLoading &&
    !loadError &&
    ownDevices.length === 0 &&
    familyGroups.filter((g) => g.owner.id !== currentUserId).every((g) => g.devices.length === 0);

  const openDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setDetailOpen(true);
  };

  const handleRefresh = () => {
    void refreshAll();
    if (selectedDeviceId) void detailQuery.refetch();
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
      <SectionHeader
        system="Personal OS"
        module="Family awareness"
        title="Family Device Awareness"
        subtitle="See the current availability of your family devices."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-md border border-hairline/60 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
            aria-label="Refresh device awareness"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <MetricPanel accent="aqua">
        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          Family devices
        </p>
        {initialLoading ? (
          <RowsSkeleton rows={1} />
        ) : loadError ? (
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

      <div className="flex flex-wrap gap-2">
        {(["all", "online", "offline"] as const).map((filter) => (
          <PeriodChip
            key={filter}
            label={filter === "all" ? "All" : filter === "online" ? "Online" : "Offline"}
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
      ) : loadError ? (
        <ErrorState
          error={loadError}
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
                  <OwnDeviceCard
                    key={device.id}
                    device={device}
                    onClick={() => openDevice(device.id)}
                  />
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
                        <FamilyDeviceCard
                          key={entry.device.id}
                          entry={entry}
                          onClick={() => openDevice(entry.device.id)}
                        />
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

      {!initialLoading && !loadError && hasAnyDevices ? (
        <p className="text-[11px] text-muted-foreground">
          Presence refreshes automatically every 45 seconds.
        </p>
      ) : null}

      <DeviceDetailPanel
        deviceId={selectedDeviceId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedDeviceId(null);
        }}
        view={detailQuery.data}
        currentUserId={currentUserId}
        loading={detailQuery.isLoading}
        error={detailQuery.error}
        onRetry={() => void detailQuery.refetch()}
      />
    </div>
  );
}

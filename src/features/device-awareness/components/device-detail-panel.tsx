import { ApiRequestError } from "@/lib/api/errors";
import type { DeviceViewResponse } from "@/lib/api/device-awareness-types";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SemanticBadge } from "@/components/future";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import {
  appStateLabel,
  communicationLabel,
  formatDeviceRegistered,
  formatSyncAge,
  networkLabel,
  platformLabel,
  presenceLabel,
  presenceTone,
  screenStateLabel,
  statusSubtitle,
} from "../lib/presence-utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function DetailBody({
  view,
  currentUserId,
  loading,
  error,
  lastSyncedAtMs,
  onRetry,
}: {
  view: DeviceViewResponse | undefined;
  currentUserId: string | undefined;
  loading: boolean;
  error: unknown;
  lastSyncedAtMs?: number | null;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6" aria-busy="true" aria-live="polite">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-muted/40" />
        ))}
      </div>
    );
  }

  if (error instanceof ApiRequestError && error.status === 403) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState error={error} title="Access restricted" {...(onRetry ? { onRetry } : {})} />
      </div>
    );
  }

  if (error instanceof ApiRequestError && error.status === 404) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Device not available"
          line="This device may have been removed or you no longer have access."
          tone="aqua"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          error={error}
          title="Unable to load device details"
          {...(onRetry ? { onRetry } : {})}
        />
      </div>
    );
  }

  if (!view) return null;

  const isOwn = view.owner.id === currentUserId;
  const summary = view.device ?? view.deviceSummary;
  if (!summary) return null;

  const awareness = view.awareness;
  const status = awareness.status ?? summary.status;
  const lastSeenAt = awareness.lastSeenAt || summary.lastSeenAt;
  const timing = statusSubtitle(status, lastSeenAt, lastSyncedAtMs ?? null);
  const osVersion = awareness.osVersion ?? view.device?.osVersion;
  const registered = formatDeviceRegistered(view.device?.createdAt);
  const syncAge = formatSyncAge(lastSyncedAtMs ?? null);
  const network = networkLabel(awareness.network);
  const communication = communicationLabel(awareness.communication);
  const appState = appStateLabel(awareness.activity);
  const screenState = screenStateLabel(awareness.activity);

  return (
    <div className="space-y-6 overflow-y-auto p-4 md:p-6">
      <div className="space-y-1">
        <p className="text-lg font-medium leading-snug">{summary.deviceName}</p>
        {isOwn ? (
          <span className="semantic-badge tone-primary-bg tone-primary-border tone-primary-text text-[10px] tracking-wide uppercase">
            Your device
          </span>
        ) : (
          <p className="text-sm text-muted-foreground">{view.owner.displayName}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SemanticBadge tone={presenceTone(status)} dot className="transition-opacity duration-300">
          {presenceLabel(status)}
        </SemanticBadge>
        {syncAge ? <span className="text-xs text-muted-foreground">{syncAge}</span> : null}
      </div>

      <section className="space-y-3 rounded-lg border border-hairline/50 p-3">
        <p className="label-eyebrow">Device</p>
        <DetailRow label="Owner" value={view.owner.displayName} />
        {!isOwn ? (
          <DetailRow label="Relationship" value="Family member" />
        ) : null}
        <DetailRow label="Status" value={presenceLabel(status)} />
        {timing ? (
          <DetailRow
            label={status === "online" ? "Last updated" : "Last seen"}
            value={timing}
          />
        ) : null}
        <DetailRow label="Platform" value={platformLabel(summary.platform)} />
        {summary.appVersion ? <DetailRow label="App version" value={summary.appVersion} /> : null}
        {osVersion ? <DetailRow label="OS version" value={osVersion} /> : null}
        {awareness.timezone ? <DetailRow label="Timezone" value={awareness.timezone} /> : null}
        {awareness.locale ? <DetailRow label="Locale" value={awareness.locale} /> : null}
        {registered ? <DetailRow label="Device registered" value={registered} /> : null}
      </section>

      {network ||
      awareness.battery?.level != null ||
      appState ||
      screenState ||
      communication ? (
        <section className="space-y-3 rounded-lg border border-hairline/50 p-3">
          <p className="label-eyebrow">Awareness</p>
          {network ? <DetailRow label="Network" value={network} /> : null}
          {awareness.battery?.level != null ? (
            <DetailRow
              label="Battery"
              value={`${awareness.battery.level}%`}
            />
          ) : null}
          {awareness.battery?.charging != null ? (
            <DetailRow
              label="Charging"
              value={awareness.battery.charging ? "Yes" : "No"}
            />
          ) : null}
          {appState ? <DetailRow label="Application state" value={appState} /> : null}
          {screenState ? <DetailRow label="Screen state" value={screenState} /> : null}
          {communication ? <DetailRow label="Communication" value={communication} /> : null}
        </section>
      ) : null}
    </div>
  );
}

export function DeviceDetailPanel({
  deviceId,
  open,
  onOpenChange,
  view,
  currentUserId,
  loading,
  error,
  lastSyncedAtMs,
  onRetry,
}: {
  deviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: DeviceViewResponse | undefined;
  currentUserId: string | undefined;
  loading: boolean;
  error: unknown;
  lastSyncedAtMs?: number | null;
  onRetry?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const title = view?.device?.deviceName ?? view?.deviceSummary?.deviceName ?? "Device details";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <DetailBody
            view={view}
            currentUserId={currentUserId}
            loading={loading && Boolean(deviceId)}
            error={error}
            {...(lastSyncedAtMs != null ? { lastSyncedAtMs } : {})}
            {...(onRetry ? { onRetry } : {})}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100vw,400px)] p-0">
        <SheetHeader className="border-b border-hairline/50 p-4">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <DetailBody
          view={view}
          currentUserId={currentUserId}
          loading={loading && Boolean(deviceId)}
          error={error}
          {...(lastSyncedAtMs != null ? { lastSyncedAtMs } : {})}
          {...(onRetry ? { onRetry } : {})}
        />
      </SheetContent>
    </Sheet>
  );
}

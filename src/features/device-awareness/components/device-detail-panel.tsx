import { ApiRequestError } from "@/lib/api/errors";
import type { DeviceViewResponse } from "@/lib/api/device-awareness-types";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SemanticBadge } from "@/components/future";
import { ErrorState } from "@/components/os/state-views";
import {
  formatLastSeen,
  platformLabel,
  presenceLabel,
  presenceTone,
} from "../lib/presence-utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function DetailBody({
  view,
  currentUserId,
  loading,
  error,
  onRetry,
}: {
  view: DeviceViewResponse | undefined;
  currentUserId: string | undefined;
  loading: boolean;
  error: unknown;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
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

  const status = view.awareness.status ?? summary.status;
  const lastSeen = formatLastSeen(view.awareness.lastSeenAt || summary.lastSeenAt);
  const osVersion = view.awareness.osVersion ?? view.device?.osVersion;

  return (
    <div className="space-y-6 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {isOwn ? (
          <span className="semantic-badge tone-primary-bg tone-primary-border tone-primary-text text-[10px] tracking-wide uppercase">
            Your device
          </span>
        ) : null}
        <SemanticBadge tone={presenceTone(status)} dot>
          {presenceLabel(status)}
        </SemanticBadge>
      </div>

      <section className="space-y-3 rounded-lg border border-hairline/50 p-3">
        <p className="label-eyebrow">Device awareness</p>
        <DetailRow label="Owner" value={view.owner.displayName} />
        <DetailRow label="Device" value={summary.deviceName} />
        <DetailRow label="Status" value={presenceLabel(status)} />
        {lastSeen ? <DetailRow label="Last seen" value={lastSeen} /> : null}
        <DetailRow label="Platform" value={platformLabel(summary.platform)} />
        {summary.appVersion ? <DetailRow label="App version" value={summary.appVersion} /> : null}
        {osVersion ? <DetailRow label="OS version" value={osVersion} /> : null}
        {view.awareness.battery?.level != null ? (
          <DetailRow
            label="Battery"
            value={`${view.awareness.battery.level}%${view.awareness.battery.charging ? " (charging)" : ""}`}
          />
        ) : null}
        {view.awareness.network?.type ? (
          <DetailRow
            label="Network"
            value={
              view.awareness.network.connected === false
                ? `${view.awareness.network.type} (disconnected)`
                : view.awareness.network.type
            }
          />
        ) : null}
      </section>
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
  onRetry,
}: {
  deviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: DeviceViewResponse | undefined;
  currentUserId: string | undefined;
  loading: boolean;
  error: unknown;
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
          {...(onRetry ? { onRetry } : {})}
        />
      </SheetContent>
    </Sheet>
  );
}

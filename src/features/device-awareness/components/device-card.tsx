import { Smartphone } from "lucide-react";
import { SemanticBadge } from "@/components/future";
import type { DeviceSummary, FamilyDeviceEntry } from "@/lib/api/device-awareness-types";
import { cn } from "@/lib/utils";
import {
  platformLabel,
  presenceLabel,
  presenceTone,
  statusSubtitle,
} from "../lib/presence-utils";

type DeviceCardProps = {
  deviceId: string;
  deviceName: string;
  platform: string;
  status: "online" | "offline";
  lastSeenAt: string;
  ownerName?: string;
  isOwn?: boolean;
  statusTransition?: boolean;
  lastSyncedAtMs?: number | null;
  onClick?: () => void;
  className?: string;
};

export function DeviceCard({
  deviceId,
  deviceName,
  platform,
  status,
  lastSeenAt,
  ownerName,
  isOwn,
  statusTransition,
  lastSyncedAtMs,
  onClick,
  className,
}: DeviceCardProps) {
  const subtitle = statusSubtitle(status, lastSeenAt, lastSyncedAtMs ?? null);
  const tone = presenceTone(status);

  return (
    <button
      type="button"
      onClick={onClick}
      data-device-id={deviceId}
      className={cn(
        "group hud-panel angular-clip w-full p-4 text-left transition-all duration-300",
        "border border-hairline/60 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        statusTransition && "ring-1 ring-primary/25",
        className,
      )}
      aria-label={`${ownerName ? `${ownerName}, ` : ""}${deviceName}, ${presenceLabel(status)}${subtitle ? `, ${subtitle}` : ""}`}
    >
      <div className="relative z-[1] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {ownerName ? (
              <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {ownerName}
              </p>
            ) : null}
            <p className="truncate text-sm font-medium">{deviceName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{platformLabel(platform)}</p>
          </div>
          <Smartphone className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwn ? (
            <span className="semantic-badge tone-primary-bg tone-primary-border tone-primary-text text-[10px] tracking-wide uppercase">
              Your device
            </span>
          ) : null}
          <SemanticBadge
            tone={tone}
            dot
            className={cn(statusTransition && "transition-opacity duration-500")}
          >
            {presenceLabel(status)}
          </SemanticBadge>
        </div>

        {subtitle ? (
          <p className="text-xs text-muted-foreground">
            {status === "online" ? (
              <>
                <span className="sr-only">Status updated: </span>
                {subtitle}
              </>
            ) : (
              <>
                Last seen <span className="text-foreground/80">{subtitle}</span>
              </>
            )}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function OwnDeviceCard({
  device,
  statusTransition,
  lastSyncedAtMs,
  onClick,
}: {
  device: DeviceSummary;
  statusTransition?: boolean;
  lastSyncedAtMs?: number | null;
  onClick: () => void;
}) {
  return (
    <DeviceCard
      deviceId={device.id}
      deviceName={device.deviceName}
      platform={device.platform}
      status={device.status}
      lastSeenAt={device.lastSeenAt}
      isOwn
      {...(statusTransition ? { statusTransition } : {})}
      {...(lastSyncedAtMs != null ? { lastSyncedAtMs } : {})}
      onClick={onClick}
    />
  );
}

export function FamilyDeviceCard({
  entry,
  statusTransition,
  lastSyncedAtMs,
  onClick,
}: {
  entry: FamilyDeviceEntry;
  statusTransition?: boolean;
  lastSyncedAtMs?: number | null;
  onClick: () => void;
}) {
  return (
    <DeviceCard
      deviceId={entry.device.id}
      deviceName={entry.device.deviceName}
      platform={entry.device.platform}
      status={entry.device.status}
      lastSeenAt={entry.awareness.lastSeenAt || entry.device.lastSeenAt}
      {...(statusTransition ? { statusTransition } : {})}
      {...(lastSyncedAtMs != null ? { lastSyncedAtMs } : {})}
      onClick={onClick}
    />
  );
}

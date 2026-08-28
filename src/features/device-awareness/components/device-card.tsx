import { Smartphone } from "lucide-react";
import { SemanticBadge } from "@/components/future";
import type { DeviceSummary, FamilyDeviceEntry } from "@/lib/api/device-awareness-types";
import { cn } from "@/lib/utils";
import {
  formatLastSeen,
  platformLabel,
  presenceLabel,
  presenceTone,
} from "../lib/presence-utils";

type DeviceCardProps = {
  deviceName: string;
  platform: string;
  status: "online" | "offline";
  lastSeenAt: string;
  ownerName?: string;
  isOwn?: boolean;
  onClick?: () => void;
  className?: string;
};

export function DeviceCard({
  deviceName,
  platform,
  status,
  lastSeenAt,
  ownerName,
  isOwn,
  onClick,
  className,
}: DeviceCardProps) {
  const lastSeen = formatLastSeen(lastSeenAt);
  const tone = presenceTone(status);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group hud-panel angular-clip w-full p-4 text-left transition",
        "border border-hairline/60 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
      aria-label={`${ownerName ? `${ownerName}, ` : ""}${deviceName}, ${presenceLabel(status)}${lastSeen ? `, last seen ${lastSeen}` : ""}`}
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
          <SemanticBadge tone={tone} dot>
            {presenceLabel(status)}
          </SemanticBadge>
        </div>

        {lastSeen ? (
          <p className="text-xs text-muted-foreground">
            Last seen <span className="text-foreground/80">{lastSeen}</span>
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function OwnDeviceCard({
  device,
  onClick,
}: {
  device: DeviceSummary;
  onClick: () => void;
}) {
  return (
    <DeviceCard
      deviceName={device.deviceName}
      platform={device.platform}
      status={device.status}
      lastSeenAt={device.lastSeenAt}
      isOwn
      onClick={onClick}
    />
  );
}

export function FamilyDeviceCard({
  entry,
  onClick,
}: {
  entry: FamilyDeviceEntry;
  onClick: () => void;
}) {
  return (
    <DeviceCard
      deviceName={entry.device.deviceName}
      platform={entry.device.platform}
      status={entry.device.status}
      lastSeenAt={entry.awareness.lastSeenAt || entry.device.lastSeenAt}
      onClick={onClick}
    />
  );
}

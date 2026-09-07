import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, Smartphone, Wifi } from "lucide-react";
import { DataPanel, SemanticBadge } from "@/components/future";
import { EmptyState } from "@/components/os/state-views";
import type { DeviceListItem } from "@/features/device-awareness/lib/presence-utils";
import {
  batteryLabel,
  communicationLabel,
  networkLabel,
  presenceLabel,
  presenceTone,
  statusSubtitle,
} from "@/features/device-awareness/lib/presence-utils";
import type { AwarenessPayload } from "@/lib/api/device-awareness-types";
import { cn } from "@/lib/utils";
import { DashboardWidget } from "./dashboard-widget";

function itemMeta(item: DeviceListItem): {
  id: string;
  name: string;
  status: "online" | "offline";
  lastSeenAt: string;
  awareness?: AwarenessPayload;
  ownerName?: string;
} {
  if (item.kind === "own") {
    return {
      id: item.device.id,
      name: item.device.deviceName,
      status: item.device.status,
      lastSeenAt: item.device.lastSeenAt,
      awareness: item.device.awareness,
    };
  }
  return {
    id: item.entry.device.id,
    name: item.entry.device.deviceName,
    status: item.entry.device.status,
    lastSeenAt: item.entry.awareness.lastSeenAt || item.entry.device.lastSeenAt,
    awareness: item.entry.awareness,
    ownerName: item.entry.owner.displayName,
  };
}

function CompactDeviceRow({
  item,
  onClick,
}: {
  item: ReturnType<typeof itemMeta>;
  onClick: () => void;
}) {
  const tone = presenceTone(item.status);
  const subtitle = statusSubtitle(item.status, item.lastSeenAt, null);
  const network = networkLabel(item.awareness?.network);
  const battery = batteryLabel(item.awareness?.battery);
  const call = communicationLabel(item.awareness?.communication);
  const onCall = call && !call.startsWith("No call");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-hairline/40 py-3 text-left transition last:border-0 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <SemanticBadge tone={tone} dot className="shrink-0">
        {presenceLabel(item.status)}
      </SemanticBadge>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.ownerName ? `${item.ownerName} · ` : ""}
          {item.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {subtitle ?? "—"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {onCall ? <Phone className="size-3.5" aria-label="On a call" /> : null}
        {network ? <Wifi className="size-3.5" aria-label={network} /> : null}
        {battery ? (
          <span className="font-mono text-[11px] tabular-nums">{battery.replace(" · Charging", "")}</span>
        ) : null}
      </div>
    </button>
  );
}

export function YourDevicesCard({
  items,
  loading,
  error,
  onRetry,
  onSelectDevice,
}: {
  items: DeviceListItem[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onSelectDevice: (id: string) => void;
}) {
  if (loading) {
    return <DashboardWidget loading skeletonRows={3} />;
  }

  if (error) {
    return (
      <DashboardWidget
        error={error}
        onRetry={onRetry}
        errorTitle="Devices unavailable"
      />
    );
  }

  const rows = items.slice(0, 5).map(itemMeta);

  return (
    <DataPanel
      title="Your devices"
      accent="info"
      className="h-full"
      action={
        <Link
          to="/devices"
          className="flex items-center gap-1 text-xs tone-info-text hover:opacity-80"
        >
          View all devices <ArrowRight className="size-3" />
        </Link>
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No connected devices"
          line="Devices you can see will appear here."
          tone="info"
          icon={<Smartphone className="size-5" />}
        />
      ) : (
        <div className={cn("px-2 md:px-3")}>
          {rows.map((row) => (
            <CompactDeviceRow
              key={row.id}
              item={row}
              onClick={() => onSelectDevice(row.id)}
            />
          ))}
        </div>
      )}
    </DataPanel>
  );
}

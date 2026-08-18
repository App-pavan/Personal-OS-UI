import { useMemo } from "react";
import { FuturisticButton, SemanticBadge } from "@/components/future";
import type { WealthConnection, WealthProviderDefinition } from "@/lib/api/wealth-types";
import { formatRelativeTime } from "../lib/format";
import { WealthPanel } from "./wealth-summary";

function connectionTone(status: WealthConnection["status"]) {
  switch (status) {
    case "connected":
      return "success" as const;
    case "syncing":
      return "info" as const;
    case "connected_with_errors":
      return "warning" as const;
    case "auth_expired":
    case "error":
      return "danger" as const;
    default:
      return "muted" as const;
  }
}

function statusLabel(status: WealthConnection["status"]): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "syncing":
      return "Syncing";
    case "connected_with_errors":
      return "Connected with errors";
    case "auth_expired":
      return "Auth expired";
    case "pending":
      return "Pending";
    case "error":
      return "Error";
    case "disconnected":
      return "Disconnected";
    default:
      return status;
  }
}

export function ConnectedProvidersCard({
  connections,
  providers,
  onConnect,
  onSyncConnection,
  syncingId,
}: {
  connections: WealthConnection[];
  providers: WealthProviderDefinition[];
  onConnect: (providerKey: WealthConnection["provider"]) => void;
  onSyncConnection?: (connectionId: string) => void;
  syncingId?: string | null;
}) {
  const connectable = useMemo(
    () => providers.filter((p) => p.available && p.key !== "manual"),
    [providers],
  );

  const connectedByProvider = useMemo(() => {
    const map = new Map<string, WealthConnection>();
    for (const c of connections) {
      if (c.status !== "disconnected") map.set(c.provider, c);
    }
    return map;
  }, [connections]);

  return (
    <WealthPanel title="Connected accounts" accent="secondary">
      <ul className="space-y-3">
        {connectable.map((p) => {
          const conn = connectedByProvider.get(p.key);
          return (
            <li
              key={p.key}
              className="flex flex-col gap-2 rounded-lg border border-hairline/50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{p.displayName}</p>
                  {conn ? (
                    <SemanticBadge tone={connectionTone(conn.status)}>
                      {statusLabel(conn.status)}
                    </SemanticBadge>
                  ) : (
                    <SemanticBadge tone="muted">Not connected</SemanticBadge>
                  )}
                </div>
                {conn?.lastSuccessfulSyncAt || conn?.lastSyncAt ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last synced{" "}
                    {formatRelativeTime(conn.lastSuccessfulSyncAt ?? conn.lastSyncAt) ?? "—"}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {conn && onSyncConnection ? (
                  <FuturisticButton
                    variant="ghost"
                    className="text-xs"
                    disabled={syncingId === conn.id || conn.status === "syncing"}
                    onClick={() => onSyncConnection(conn.id)}
                  >
                    Sync
                  </FuturisticButton>
                ) : null}
                {!conn || conn.status === "auth_expired" || conn.status === "error" ? (
                  <FuturisticButton className="text-xs" onClick={() => onConnect(p.key)}>
                    Connect
                  </FuturisticButton>
                ) : null}
              </div>
            </li>
          );
        })}
        {connections.some((c) => c.provider === "manual") ? (
          <li className="rounded-lg border border-hairline/50 p-3">
            <p className="text-sm font-medium">Manual portfolio</p>
            <p className="mt-1 text-xs text-muted-foreground">Manually entered investments</p>
            <SemanticBadge tone="info" className="mt-2">
              Active
            </SemanticBadge>
          </li>
        ) : null}
      </ul>
    </WealthPanel>
  );
}

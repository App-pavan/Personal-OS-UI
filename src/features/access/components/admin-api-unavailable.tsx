import { ServerOff } from "lucide-react";
import { FutureState } from "@/components/os/state-views";

/** Shown when Access Control UI is reachable but /admin/* APIs are not deployed yet. */
export function AdminApiUnavailable() {
  return (
    <FutureState
      title="Access Control backend not deployed"
      line="Your account has permission to manage access, but the admin APIs (/admin/users, /admin/roles, /admin/permissions) are not available on this backend yet. Deploy Personal-OS-backend Phase 2 (RBAC admin module) to production, then reload this page."
    />
  );
}

export function AdminApiUnavailablePanel() {
  return (
    <div className="hud-panel angular-clip p-6 card-accent-top">
      <div className="relative z-[1] flex flex-col items-start gap-4">
        <span className="grid size-10 place-items-center angular-clip-sm border border-hairline bg-muted/30 text-muted-foreground">
          <ServerOff className="size-4" />
        </span>
        <div>
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Not available yet</p>
          <p className="mt-1 text-sm font-medium">Access Control requires a backend update</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Deploy Personal-OS-backend Phase 2 to enable user, role, and permission management.
          </p>
        </div>
      </div>
    </div>
  );
}

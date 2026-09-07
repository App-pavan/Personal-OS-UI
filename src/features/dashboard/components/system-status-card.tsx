import { Link } from "@tanstack/react-router";
import { HudPanel, SemanticBadge } from "@/components/future";
import { useCan } from "@/features/capabilities/can";
import { PERM } from "@/lib/permissions";
import { useRuntimeOperations } from "@/hooks/use-runtime-logs";
import { DashboardWidget } from "./dashboard-widget";
import { cn } from "@/lib/utils";
import { semanticTextClasses } from "@/lib/design/semantic";

export function SystemStatusCard() {
  const { can } = useCan();
  const hasRuntime = can(PERM.SYSTEM_RUNTIME_VIEW);
  const runtime = useRuntimeOperations({ enabled: hasRuntime, pollMs: 30_000 });

  if (!hasRuntime) {
    return (
      <HudPanel accent="secondary" className="h-full">
        <p className="label-eyebrow">System status</p>
        <p className="mt-3 text-sm text-muted-foreground">Status unavailable</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No health endpoint is exposed for your account.
        </p>
      </HudPanel>
    );
  }

  if (runtime.loading) {
    return <DashboardWidget loading skeletonRows={2} />;
  }

  if (runtime.error) {
    return (
      <DashboardWidget
        error={runtime.error}
        onRetry={() => void runtime.refresh()}
        errorTitle="Runtime status unavailable"
      />
    );
  }

  const running = runtime.operations.filter((op) => op.status === "RUNNING").length;
  const failed = runtime.operations.filter((op) => op.status === "FAILED").length;
  const healthy = failed === 0;

  return (
    <HudPanel accent={healthy ? "success" : "warning"} className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-eyebrow">System status</p>
          <p className={cn("mt-2 text-sm font-medium", semanticTextClasses(healthy ? "success" : "warning"))}>
            {healthy ? "Runtime API responding" : "Recent operation failures detected"}
          </p>
        </div>
        <SemanticBadge tone={healthy ? "success" : "warning"} dot>
          {healthy ? "Active" : "Attention"}
        </SemanticBadge>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <StatusRow label="Runtime API" value="Responding" tone="success" />
        <StatusRow
          label="Active operations"
          value={String(running)}
          tone={running > 0 ? "info" : "muted"}
        />
        <StatusRow
          label="Failed operations"
          value={String(failed)}
          tone={failed > 0 ? "danger" : "muted"}
        />
        <StatusRow label="Database" value="Not monitored" tone="muted" />
        <StatusRow label="Sync service" value="Not monitored" tone="muted" />
      </dl>

      <Link
        to="/system/activity"
        className="mt-4 inline-block text-xs text-primary hover:text-accent"
      >
        Open runtime →
      </Link>
    </HudPanel>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "info" | "danger" | "warning" | "muted";
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-hairline/30 pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", semanticTextClasses(tone))}>{value}</dd>
    </div>
  );
}

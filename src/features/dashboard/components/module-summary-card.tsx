import { Link } from "@tanstack/react-router";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Can } from "@/features/capabilities/can";
import { semanticSurfaceClasses, semanticTextClasses, type SemanticTone } from "@/lib/design/semantic";
import { cn } from "@/lib/utils";
import type { PermissionKey } from "@/lib/permissions";

export function ModuleSummaryCard({
  title,
  to,
  search,
  accent,
  metrics,
  footer,
  action,
  onActionClick,
  actionLabel = "Add",
  actionPermission,
}: {
  title: string;
  to: string;
  search?: Record<string, unknown>;
  accent: SemanticTone;
  metrics: { label: string; value: string; tone?: SemanticTone }[];
  footer?: ReactNode;
  action?: "add";
  onActionClick?: () => void;
  actionLabel?: string;
  actionPermission?: PermissionKey;
}) {
  return (
    <div className="group relative h-full">
      <Link
        to={to}
        {...(search ? { search } : {})}
        className={cn(
          "metric-panel flex h-full flex-col p-4 card-accent-top transition hover:border-primary/30 md:p-5",
        )}
        style={{ ["--card-accent" as string]: `var(--tone-${accent}-text, var(--primary))` }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="label-eyebrow">{title}</p>
          {action === "add" && onActionClick && actionPermission ? (
            <Can permission={actionPermission}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onActionClick();
                }}
                aria-label={actionLabel}
                title={actionLabel}
                className="grid size-7 shrink-0 place-items-center rounded-md border border-hairline/60 bg-background/60 text-muted-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Plus className="size-3.5" />
              </button>
            </Can>
          ) : null}
        </div>

        <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className={semanticSurfaceClasses(m.tone ?? accent)}>
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{m.label}</p>
              <p
                className={cn(
                  "mt-1 font-mono text-lg font-semibold tabular-nums",
                  semanticTextClasses(m.tone ?? accent),
                )}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {footer ? <div className="mt-3 border-t border-hairline/40 pt-3">{footer}</div> : null}
      </Link>
    </div>
  );
}

export function ComparisonHint({
  changePercent,
  inverted,
}: {
  changePercent: number | null | undefined;
  /** When true, negative change is good (e.g. spending down). */
  inverted?: boolean;
}) {
  if (changePercent == null) return null;
  const up = changePercent >= 0;
  const good = inverted ? !up : up;
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs",
        good ? semanticTextClasses("success") : semanticTextClasses("danger"),
      )}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {Math.abs(changePercent).toFixed(0)}% vs last month
    </p>
  );
}

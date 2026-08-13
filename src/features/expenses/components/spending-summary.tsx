import { TrendingDown, TrendingUp } from "lucide-react";
import { MetricPanel, ProgressIndicator } from "@/components/future";
import {
  metricAccent,
  semanticSurfaceClasses,
  semanticTextClasses,
  budgetProgressTone,
  type SemanticTone,
} from "@/lib/design/semantic";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export function SpendingSummary({
  totalMinor,
  currency,
  transactionCount,
  personalCount,
  sharedCount,
  pendingCount,
  delta,
  partial,
  loading,
  budgetTotalMinor,
  budgetRemainingMinor,
  budgetUsagePercent,
  budgetStatus,
}: {
  totalMinor: number;
  currency: string;
  transactionCount: number;
  personalCount: number;
  sharedCount: number;
  pendingCount: number;
  delta: number | null;
  partial?: boolean;
  loading?: boolean;
  budgetTotalMinor?: number;
  budgetRemainingMinor?: number;
  budgetUsagePercent?: number;
  budgetStatus?: string;
}) {
  if (loading) {
    return <MetricPanel className="scan-skeleton min-h-[220px]" />;
  }

  const budgetTone =
    budgetUsagePercent != null ? budgetProgressTone(budgetUsagePercent) : "secondary";

  return (
    <MetricPanel className="relative overflow-hidden" accent="primary">
      <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Total spending
          </p>
          <p className="mt-2 font-mono text-5xl font-semibold tabular-nums tracking-tight metric-glow md:text-6xl">
            {formatMoney(totalMinor, currency)}
          </p>
          {delta != null ? (
            <p
              className={cn(
                "mt-3 flex items-center gap-1.5 text-sm",
                delta >= 0 ? semanticTextClasses("danger") : semanticTextClasses("success"),
              )}
            >
              {delta >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {Math.abs(delta).toFixed(1)}% vs previous period
            </p>
          ) : null}
          {partial ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Based on loaded transactions in this period
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <StatChip
            label="Transactions"
            value={String(transactionCount)}
            tone={metricAccent.transactions}
          />
          <StatChip label="Personal" value={String(personalCount)} tone={metricAccent.personal} />
          <StatChip label="Shared" value={String(sharedCount)} tone={metricAccent.shared} />
          <StatChip
            label="Pending"
            value={String(pendingCount)}
            tone={metricAccent.pending}
            highlight={pendingCount > 0}
          />
        </div>
      </div>
      {budgetTotalMinor != null && budgetTotalMinor > 0 ? (
        <div className="relative mt-6 border-t border-hairline/50 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Budget utilization
            </p>
            <p className={cn("font-mono text-sm tabular-nums", semanticTextClasses(budgetTone))}>
              {budgetUsagePercent?.toFixed(1) ?? 0}%
            </p>
          </div>
          <ProgressIndicator
            percent={budgetUsagePercent ?? 0}
            tone={budgetTone}
            className="mt-3 h-2"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {formatMoney(budgetRemainingMinor ?? 0, currency)} remaining of{" "}
            {formatMoney(budgetTotalMinor, currency)}
            {budgetStatus === "EXCEEDED" ? " · Over budget" : ""}
          </p>
        </div>
      ) : null}
    </MetricPanel>
  );
}

function StatChip({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  tone: SemanticTone;
  highlight?: boolean;
}) {
  return (
    <div className={semanticSurfaceClasses(tone, highlight)}>
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-semibold tabular-nums",
          semanticTextClasses(tone),
        )}
      >
        {value}
      </p>
    </div>
  );
}

export { deltaPercent } from "@/lib/money";

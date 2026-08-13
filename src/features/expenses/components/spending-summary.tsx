import { TrendingUp } from "lucide-react";
import { MetricPanel, ProgressIndicator } from "@/components/future";
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

  return (
    <MetricPanel className="relative overflow-hidden">
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
                delta >= 0 ? "text-primary" : "text-accent",
              )}
            >
              <TrendingUp className={cn("size-4", delta < 0 && "rotate-180")} />
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
          <StatChip label="Transactions" value={String(transactionCount)} />
          <StatChip label="Personal" value={String(personalCount)} />
          <StatChip label="Shared" value={String(sharedCount)} />
          <StatChip label="Pending" value={String(pendingCount)} highlight={pendingCount > 0} />
        </div>
      </div>
      {budgetTotalMinor != null && budgetTotalMinor > 0 ? (
        <div className="relative mt-6 border-t border-hairline/50 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Budget utilization
            </p>
            <p className="font-mono text-sm tabular-nums text-primary">
              {budgetUsagePercent?.toFixed(1) ?? 0}%
            </p>
          </div>
          <ProgressIndicator percent={budgetUsagePercent ?? 0} className="mt-3 h-2" />
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
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="angular-clip-sm border border-hairline/60 bg-background/20 px-3 py-2.5">
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-semibold tabular-nums",
          highlight && "text-accent",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export { deltaPercent } from "@/lib/money";

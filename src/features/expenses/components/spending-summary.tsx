import { TrendingUp } from "lucide-react";
import { deltaPercent, formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass";

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
}) {
  if (loading) {
    return (
      <GlassCard glow className="animate-pulse">
        <div className="h-32 rounded-lg bg-muted/50" />
      </GlassCard>
    );
  }

  return (
    <GlassCard glow className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative">
        <p className="label-eyebrow">Total spending</p>
        <p className="display-xl mt-2 font-mono tabular-nums tracking-tight">
          {formatMoney(totalMinor, currency)}
        </p>
        {delta != null && (
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-sm",
              delta >= 0 ? "text-warning" : "text-success",
            )}
          >
            <TrendingUp className={cn("size-4", delta < 0 && "rotate-180")} />
            {Math.abs(delta).toFixed(1)}% vs previous period
          </p>
        )}
        {partial ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Based on loaded transactions in this period
          </p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Transactions" value={String(transactionCount)} />
          <Metric label="Personal" value={String(personalCount)} />
          <Metric label="Shared" value={String(sharedCount)} />
          <Metric label="Pending" value={String(pendingCount)} accent />
        </div>
      </div>
    </GlassCard>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-hairline/50 bg-background/30 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-lg font-semibold tabular-nums", accent && "text-accent")}>
        {value}
      </p>
    </div>
  );
}

export { deltaPercent };

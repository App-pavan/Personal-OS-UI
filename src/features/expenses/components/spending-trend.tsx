import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { deriveTrend } from "../lib/analytics";
import { GlassCard } from "./glass";

const chartConfig = {
  spend: { label: "Spending", color: "hsl(var(--chart-1))" },
};

export function SpendingTrend({
  transactions,
  currency,
  loading,
}: {
  transactions: ExpenseTransaction[];
  currency: string;
  loading?: boolean;
}) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const data = useMemo(() => deriveTrend(transactions, days), [transactions, days]);
  const hasData = data.some((d) => d.amountMinor > 0);

  if (loading) {
    return (
      <GlassCard>
        <div className="h-48 animate-pulse rounded-lg bg-muted/50" />
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="label-eyebrow">Spending trend</p>
        <div className="flex gap-1 rounded-lg border border-hairline/60 p-0.5">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={
                days === d
                  ? "rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary"
                  : "rounded-md px-2 py-1 text-xs text-muted-foreground"
              }
            >
              {d === 7 ? "7d" : d === 30 ? "30d" : "3mo"}
            </button>
          ))}
        </div>
      </div>
      {!hasData ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Not enough data for this period yet.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => formatMoney(v, currency, { compact: true })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatMoney(Number(value), currency)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="amountMinor"
              stroke="hsl(var(--chart-1))"
              fill="url(#spendFill)"
              strokeWidth={2}
              isAnimationActive
            />
          </AreaChart>
        </ChartContainer>
      )}
    </GlassCard>
  );
}

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import type { DailySpendingRow, ExpenseTransaction } from "@/lib/api/expense-types";
import { chartColors } from "@/lib/design/semantic";
import { formatMoney } from "@/lib/money";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { deriveTrend } from "../lib/analytics";
import { GlassCard } from "./glass";

const chartConfig = {
  spend: { label: "Spending", color: chartColors.primary },
  comparison: { label: "Previous", color: chartColors.comparison },
};

export function SpendingTrend({
  transactions,
  daily,
  currency,
  loading,
}: {
  transactions?: ExpenseTransaction[];
  daily?: DailySpendingRow[];
  currency: string;
  loading?: boolean;
}) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const data = useMemo(() => {
    if (daily && daily.length > 0) {
      return daily.map((d, i) => ({
        label: d.date.slice(8),
        amountMinor: d.amountMinor,
        prevMinor: daily[Math.max(0, i - 1)]?.amountMinor ?? 0,
      }));
    }
    const trend = deriveTrend(transactions ?? [], days);
    return trend.map((d, i) => ({
      ...d,
      prevMinor: trend[Math.max(0, i - 1)]?.amountMinor ?? 0,
    }));
  }, [daily, transactions, days]);
  const hasData = data.some((d) => d.amountMinor > 0);

  if (loading) {
    return (
      <GlassCard accent="info">
        <div className="h-48 animate-pulse rounded-lg bg-muted/50" />
      </GlassCard>
    );
  }

  return (
    <GlassCard accent="info">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="label-eyebrow">Spending trend</p>
        {!daily?.length ? (
          <div className="flex gap-1 rounded-lg border border-hairline/60 p-0.5">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={
                  days === d
                    ? "rounded-md tone-primary-bg tone-primary-text px-2 py-1 text-xs font-medium"
                    : "rounded-md px-2 py-1 text-xs text-muted-foreground"
                }
              >
                {d === 7 ? "7d" : d === 30 ? "30d" : "3mo"}
              </button>
            ))}
          </div>
        ) : null}
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
                <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.12} />
                <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="prevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.comparison} stopOpacity={0.08} />
                <stop offset="100%" stopColor={chartColors.comparison} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(65 174 169 / 8%)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => formatMoney(v, currency, { compact: true })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => formatMoney(Number(value), currency)} />
              }
            />
            <Area
              type="monotone"
              dataKey="prevMinor"
              stroke={chartColors.comparison}
              fill="url(#prevFill)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="amountMinor"
              stroke={chartColors.primary}
              fill="url(#spendFill)"
              strokeWidth={2.5}
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="amountMinor"
              stroke={chartColors.primary}
              strokeWidth={0}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </GlassCard>
  );
}

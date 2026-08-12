import { Cell, Pie, PieChart } from "recharts";
import { formatMoney, percentOf } from "@/lib/money";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { GlassCard } from "./glass";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
];

export function CategoryBreakdown({
  items,
  total,
  currency,
  loading,
}: {
  items: { id: string; name: string; amountMinor: number }[];
  total: number;
  currency: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <GlassCard>
        <div className="h-48 animate-pulse rounded-lg bg-muted/50" />
      </GlassCard>
    );
  }

  if (!items.length) {
    return (
      <GlassCard>
        <p className="label-eyebrow">By category</p>
        <p className="mt-8 text-center text-sm text-muted-foreground">No categorised spending yet.</p>
      </GlassCard>
    );
  }

  const chartConfig = Object.fromEntries(
    items.map((item, i) => [
      item.id,
      { label: item.name, color: COLORS[i % COLORS.length] ?? COLORS[0] },
    ]),
  ) as ChartConfig;

  return (
    <GlassCard>
      <p className="label-eyebrow mb-4">By category</p>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="relative mx-auto w-full max-w-[200px]">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={items}
                dataKey="amountMinor"
                nameKey="name"
                innerRadius={58}
                outerRadius={78}
                strokeWidth={2}
                isAnimationActive
              >
                {items.map((entry, index) => (
                  <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-sm tabular-nums">{formatMoney(total, currency, { compact: true })}</p>
            <p className="text-[10px] text-muted-foreground">total</p>
          </div>
        </div>
        <ul className="space-y-2">
          {items.slice(0, 8).map((item, i) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {item.name}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {formatMoney(item.amountMinor, currency)}{" "}
                <span className="text-xs">({percentOf(item.amountMinor, total).toFixed(0)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

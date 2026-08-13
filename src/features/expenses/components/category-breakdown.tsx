import { Cell, Pie, PieChart } from "recharts";
import { formatMoney, percentOf } from "@/lib/money";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getCategoryColor, getCategoryMeta } from "../lib/category-meta";
import { GlassCard } from "./glass";

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
      <GlassCard accent="secondary">
        <div className="h-48 animate-pulse rounded-lg bg-muted/50" />
      </GlassCard>
    );
  }

  if (!items.length) {
    return (
      <GlassCard accent="secondary">
        <p className="label-eyebrow">By category</p>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No categorised spending yet.
        </p>
      </GlassCard>
    );
  }

  const chartConfig = Object.fromEntries(
    items.map((item) => {
      const color = getCategoryColor(item.name, item.id);
      return [item.id, { label: item.name, color }];
    }),
  ) as ChartConfig;

  return (
    <GlassCard accent="secondary">
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
                stroke="rgb(0 9 44 / 40%)"
                isAnimationActive
              >
                {items.map((entry) => {
                  const color = getCategoryColor(entry.name, entry.id);
                  return (
                    <Cell
                      key={entry.id}
                      fill={color}
                      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-sm tabular-nums">
              {formatMoney(total, currency, { compact: true })}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">total</p>
          </div>
        </div>
        <ul className="space-y-2">
          {items.slice(0, 8).map((item) => {
            const meta = getCategoryMeta(item.name, item.id);
            const color = meta.color;
            const Icon = meta.icon;
            return (
              <li
                key={item.id}
                className="group flex items-center justify-between gap-3 rounded-md px-1 py-1 text-sm transition hover:bg-primary/5"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="grid size-6 place-items-center angular-clip-sm border"
                    style={{
                      color,
                      background: `color-mix(in srgb, ${color} 12%, transparent)`,
                      borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
                    }}
                  >
                    <Icon className="size-3" />
                  </span>
                  {item.name}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {formatMoney(item.amountMinor, currency)}{" "}
                  <span className="text-xs">
                    ({percentOf(item.amountMinor, total).toFixed(0)}%)
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </GlassCard>
  );
}

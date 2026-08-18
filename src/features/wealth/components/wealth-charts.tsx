import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors } from "@/lib/design/semantic";
import { formatMoney } from "@/lib/money";
import type { AllocationSlice } from "../lib/allocation";
import { formatPnlPercent } from "../lib/format";
import { WealthPanel } from "./wealth-summary";

const SLICE_COLORS = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.comparison,
  "var(--accent-purple)",
];

function AllocationTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { payload?: AllocationSlice }[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-md border border-hairline/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{row.label}</p>
      <p className="mt-1 font-mono tabular-nums">{formatMoney(row.valueMinor, currency)}</p>
      <p className="text-muted-foreground">{row.percent}%</p>
    </div>
  );
}

export function AssetAllocationCard({
  slices,
  currency,
}: {
  slices: AllocationSlice[];
  currency: string;
}) {
  if (!slices.length) {
    return (
      <WealthPanel title="Asset allocation" accent="purple">
        <p className="py-10 text-center text-sm text-muted-foreground">
          No allocation data available
        </p>
      </WealthPanel>
    );
  }

  const chartData = slices.map((s) => ({ name: s.label, value: s.valueMinor, percent: s.percent }));

  return (
    <WealthPanel title="Asset allocation" accent="purple">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
        <div className="mx-auto h-[180px] w-full max-w-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                stroke="transparent"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<AllocationTooltip currency={currency} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2">
          {slices.map((s, i) => (
            <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                />
                {s.label}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">{s.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </WealthPanel>
  );
}

export function PortfolioPerformanceCard({
  currency,
  currentValueMinor,
  pnlPercent,
}: {
  currency: string;
  currentValueMinor: number;
  pnlPercent: number;
}) {
  const periods = ["1D", "1W", "1M", "3M", "6M", "1Y", "All"];

  return (
    <WealthPanel
      title="Portfolio performance"
      accent="info"
      action={
        <div className="flex flex-wrap gap-1">
          {periods.map((p) => (
            <span
              key={p}
              className="cursor-not-allowed text-[10px] tracking-wide text-muted-foreground/60 uppercase"
              title="Available when snapshot data exists"
            >
              {p}
            </span>
          ))}
        </div>
      }
    >
      <div className="mb-4">
        <p className="font-mono text-2xl tabular-nums">
          {formatMoney(currentValueMinor, currency)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Current return {formatPnlPercent(pnlPercent)}
        </p>
      </div>
      <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-hairline/50 bg-muted/20 px-4 py-8 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Historical performance will appear here once portfolio snapshots are available.
        </p>
      </div>
    </WealthPanel>
  );
}

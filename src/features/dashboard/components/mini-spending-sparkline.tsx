import { Area, AreaChart } from "recharts";
import type { DailySpendingRow } from "@/lib/api/expense-types";
import { chartColors } from "@/lib/design/semantic";

export function MiniSpendingSparkline({
  daily,
  className,
}: {
  daily: DailySpendingRow[];
  className?: string;
}) {
  const data = daily.slice(-7);
  if (!data.some((d) => d.amountMinor > 0)) return null;

  return (
    <div className={className} aria-hidden>
      <AreaChart width={120} height={36} data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <Area
          type="monotone"
          dataKey="amountMinor"
          stroke={chartColors.primary}
          fill={chartColors.primary}
          fillOpacity={0.15}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
}

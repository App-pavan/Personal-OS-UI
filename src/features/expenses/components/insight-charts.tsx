import { Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  CategoryAnalyticsRow,
  MerchantAnalyticsRow,
  MemberAnalyticsRow,
} from "@/lib/api/expense-types";
import { insightChartColors } from "@/lib/design/semantic";
import { getCategoryColor } from "../lib/category-meta";
import { truncateLabel } from "../lib/insights-utils";
import { formatMoney } from "@/lib/money";
import { GlassCard } from "./glass";

function ChartEmpty({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>;
}

function ChartTooltip({
  active,
  payload,
  currency,
  labelKey = "name",
}: {
  active?: boolean;
  payload?: { payload?: Record<string, unknown>; value?: number }[];
  currency: string;
  labelKey?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};
  const label = String(row[labelKey] ?? row.name ?? "");
  const amount = Number(payload[0]?.value ?? row.amount ?? 0);
  return (
    <div className="rounded-md border border-hairline/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      <p className="mt-1 font-mono tabular-nums">{formatMoney(amount, currency)}</p>
    </div>
  );
}

export function CategoryBarChart({
  items,
  currency,
  onCategoryClick,
}: {
  items: CategoryAnalyticsRow[];
  currency: string;
  onCategoryClick?: (categoryId: string) => void;
}) {
  if (!items.length) return <ChartEmpty message="Not enough category data yet." />;

  const data = items.slice(0, 10).map((c) => ({
    id: c.categoryId,
    name: c.categoryName,
    amount: c.amountMinor,
    color: getCategoryColor(c.categoryName, c.categoryId),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid stroke="rgb(65 174 169 / 8%)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={112}
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickFormatter={(value) => truncateLabel(String(value), 16)}
        />
        <Tooltip content={<ChartTooltip currency={currency} labelKey="name" />} />
        <Bar dataKey="amount" radius={4} onClick={(d) => onCategoryClick?.(d.id)}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={entry.color} className="cursor-pointer" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MerchantBarChart({
  items,
  currency,
  onMerchantClick,
}: {
  items: MerchantAnalyticsRow[];
  currency: string;
  onMerchantClick?: (merchant: string) => void;
}) {
  if (!items.length) return <ChartEmpty message="No merchant data for this period." />;

  const data = items.slice(0, 10).map((m) => ({
    name: m.merchant.trim() || "Unknown",
    amount: m.amountMinor,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid stroke="rgb(65 174 169 / 8%)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={148}
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickFormatter={(value) => truncateLabel(String(value), 22)}
        />
        <Tooltip content={<ChartTooltip currency={currency} labelKey="name" />} />
        <Bar
          dataKey="amount"
          fill={insightChartColors.merchant}
          radius={4}
          onClick={(d) => onMerchantClick?.(String(d.name))}
          className="cursor-pointer"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MemberBarChart({
  items,
  currency,
}: {
  items: MemberAnalyticsRow[];
  currency: string;
}) {
  if (!items.length) {
    return (
      <ChartEmpty message="Shared spending insights will appear when you record split expenses." />
    );
  }

  const data = items.map((m) => ({
    name: m.memberName.trim() || "Unknown member",
    amount: m.amountMinor,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 28 }}>
        <CartesianGrid stroke="rgb(65 174 169 / 8%)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "currentColor" }}
          interval={0}
          angle={-22}
          textAnchor="end"
          height={56}
          tickFormatter={(value) => truncateLabel(String(value), 14)}
        />
        <YAxis
          tickFormatter={(v) => formatMoney(v, currency, { compact: true })}
          width={56}
          tick={{ fontSize: 11, fill: "currentColor" }}
        />
        <Tooltip content={<ChartTooltip currency={currency} labelKey="name" />} />
        <Bar dataKey="amount" fill={insightChartColors.member} radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PersonalSharedDonut({
  personalMinor,
  sharedMinor,
  currency,
}: {
  personalMinor: number;
  sharedMinor: number;
  currency: string;
}) {
  const total = personalMinor + sharedMinor;
  if (!total) return <ChartEmpty message="No personal or shared spending yet." />;

  const data = [
    { name: "Personal", value: personalMinor, color: insightChartColors.personal },
    { name: "Shared", value: sharedMinor, color: insightChartColors.shared },
  ];

  return (
    <div className="relative h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip formatter={(v) => formatMoney(Number(v), currency)} />
          <Pie data={data} dataKey="value" innerRadius={52} outerRadius={72} strokeWidth={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-sm tabular-nums">
          {formatMoney(total, currency, { compact: true })}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase">total</p>
      </div>
    </div>
  );
}

export function WeeklyPatternChart({
  daily,
  currency,
}: {
  daily: { date: string; amountMinor: number }[];
  currency: string;
}) {
  if (!daily.length) return <ChartEmpty message="Not enough daily data for weekly patterns." />;

  const byWeekday = Array.from({ length: 7 }, (_, i) => ({
    day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
    amount: 0,
  }));

  for (const row of daily) {
    const d = new Date(row.date);
    const idx = d.getDay();
    byWeekday[idx]!.amount += row.amountMinor;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={byWeekday} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid stroke="rgb(65 174 169 / 8%)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "currentColor" }} />
        <YAxis
          tickFormatter={(v) => formatMoney(v, currency, { compact: true })}
          width={56}
          tick={{ fontSize: 11, fill: "currentColor" }}
        />
        <Tooltip content={<ChartTooltip currency={currency} labelKey="day" />} />
        <Bar dataKey="amount" fill={insightChartColors.weekly} radius={4} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryChangeList({
  items,
  currency,
  onCategoryClick,
}: {
  items: CategoryAnalyticsRow[];
  currency: string;
  onCategoryClick?: (categoryId: string) => void;
}) {
  if (!items.length) return null;

  return (
    <ul className="space-y-2">
      {items.slice(0, 8).map((c) => {
        const pct = c.percentage ?? 0;
        const tone =
          pct > 0 ? "tone-danger-text" : pct < 0 ? "tone-success-text" : "text-muted-foreground";
        return (
          <li key={c.categoryId} className="flex items-center justify-between gap-3 text-sm">
            <Link
              to="/expenses/transactions"
              search={{ category: c.categoryId }}
              className="truncate hover:text-primary"
              onClick={() => onCategoryClick?.(c.categoryId)}
            >
              {c.categoryName}
            </Link>
            <span className={tone}>
              {pct >= 0 ? "+" : ""}
              {pct.toFixed(0)}%
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatMoney(c.amountMinor, currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function InsightSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="label-eyebrow mb-3">{title}</h2>
      {children}
    </section>
  );
}

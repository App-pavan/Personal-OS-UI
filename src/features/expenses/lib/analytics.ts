import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { deltaPercent, sumMinor } from "@/lib/money";

export type PeriodKey = "this_month" | "last_month" | "custom";

export function monthRange(key: PeriodKey, customFrom?: Date, customTo?: Date) {
  const now = new Date();
  if (key === "custom" && customFrom && customTo) {
    return { from: customFrom, to: customTo };
  }
  if (key === "last_month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from, to };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export function periodLabel(key: PeriodKey) {
  const now = new Date();
  if (key === "last_month") {
    return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString([], {
      month: "long",
      year: "numeric",
    });
  }
  return now.toLocaleString([], { month: "long", year: "numeric" });
}

export function inRange(iso: string, from: Date, to: Date) {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

/** Derive stats from loaded transactions only — not a global total. */
export function deriveSummary(transactions: ExpenseTransaction[], from: Date, to: Date) {
  const active = transactions.filter(
    (tx) =>
      tx.status !== "archived" &&
      tx.status !== "ignored" &&
      inRange(tx.occurredAt, from, to),
  );
  const currency = active[0]?.currency ?? "INR";
  const totalMinor = sumMinor(active.map((tx) => tx.amountMinor));
  const personal = active.filter((tx) => tx.ownership === "personal").length;
  const shared = active.filter((tx) => tx.ownership === "split").length;
  const pending = transactions.filter((tx) => tx.status === "pending").length;
  return { totalMinor, currency, count: active.length, personal, shared, pending, partial: true };
}

export function deriveTrend(
  transactions: ExpenseTransaction[],
  days: number,
): { label: string; amountMinor: number }[] {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      label: d.toLocaleDateString([], { day: "numeric", month: "short" }),
      key: d.toDateString(),
      amountMinor: 0,
    };
  });

  for (const tx of transactions) {
    if (tx.status === "archived" || tx.status === "ignored") continue;
    const d = new Date(tx.occurredAt);
    if (d < start || d > end) continue;
    const bucket = buckets.find((b) => b.key === d.toDateString());
    if (bucket) bucket.amountMinor += tx.amountMinor;
  }

  return buckets.map(({ label, amountMinor }) => ({ label, amountMinor }));
}

export function deriveCategoryBreakdown(
  transactions: ExpenseTransaction[],
  from: Date,
  to: Date,
  categoryNames: Map<string, string>,
) {
  const map = new Map<string, { id: string; name: string; amountMinor: number }>();
  for (const tx of transactions) {
    if (tx.status === "archived" || tx.status === "ignored") continue;
    if (!inRange(tx.occurredAt, from, to)) continue;
    const id = tx.categoryId ?? "uncategorised";
    const name = tx.categoryName ?? categoryNames.get(id) ?? "Uncategorised";
    const prev = map.get(id) ?? { id, name, amountMinor: 0 };
    prev.amountMinor += tx.amountMinor;
    map.set(id, prev);
  }
  const items = [...map.values()].sort((a, b) => b.amountMinor - a.amountMinor);
  const total = sumMinor(items.map((i) => i.amountMinor));
  return { items, total };
}

export function comparePeriods(
  current: ExpenseTransaction[],
  previous: ExpenseTransaction[],
  from: Date,
  to: Date,
) {
  const prevFrom = new Date(from);
  const prevTo = new Date(to);
  const span = to.getTime() - from.getTime();
  prevFrom.setTime(prevFrom.getTime() - span - 1);
  prevTo.setTime(from.getTime() - 1);

  const curTotal = sumMinor(
    current
      .filter((tx) => tx.status !== "archived" && tx.status !== "ignored" && inRange(tx.occurredAt, from, to))
      .map((tx) => tx.amountMinor),
  );
  const prevTotal = sumMinor(
    previous
      .filter((tx) => tx.status !== "archived" && tx.status !== "ignored" && inRange(tx.occurredAt, prevFrom, prevTo))
      .map((tx) => tx.amountMinor),
  );
  return deltaPercent(curTotal, prevTotal);
}

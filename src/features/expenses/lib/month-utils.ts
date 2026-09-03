import { currentMonthKey } from "@/features/expenses/lib/budget-utils";

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonthKey(value: string): boolean {
  return MONTH_KEY_RE.test(value);
}

export function parseMonthKey(value: unknown, fallback = currentMonthKey()): string {
  if (typeof value === "string" && isValidMonthKey(value)) return value;
  return fallback;
}

/** UTC half-open range [from, to) for a calendar month (YYYY-MM). */
export function monthIsoRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { from: start.toISOString(), to: end.toISOString() };
}

export function monthQueryKey(month: string): string {
  return month;
}

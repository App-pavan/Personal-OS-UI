import type { BudgetStatus } from "@/lib/api/expense-types";

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return currentMonthKey(d);
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** Past calendar months are locked; current and future months are editable. */
export function isMonthEditable(month: string, now = new Date()): boolean {
  return month >= currentMonthKey(now);
}

export type BudgetHealthLabel = "Healthy" | "Approaching" | "Near limit" | "Over budget";

export function budgetHealthLabel(status: BudgetStatus): BudgetHealthLabel {
  switch (status) {
    case "EXCEEDED":
      return "Over budget";
    case "NEAR_LIMIT":
      return "Near limit";
    case "WARNING":
      return "Approaching";
    default:
      return "Healthy";
  }
}

export function budgetStatusTone(status: BudgetStatus): string {
  switch (status) {
    case "EXCEEDED":
      return "text-destructive";
    case "NEAR_LIMIT":
    case "WARNING":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

export function progressBarTone(status: BudgetStatus): string {
  switch (status) {
    case "EXCEEDED":
      return "bg-destructive";
    case "NEAR_LIMIT":
    case "WARNING":
      return "bg-primary";
    default:
      return "bg-[rgb(238_238_238/0.35)]";
  }
}

export function budgetBadgeTone(status: BudgetStatus): "danger" | "primary" | "muted" {
  switch (status) {
    case "EXCEEDED":
      return "danger";
    case "NEAR_LIMIT":
    case "WARNING":
      return "primary";
    default:
      return "muted";
  }
}

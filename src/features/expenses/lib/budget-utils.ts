import type { BudgetStatus } from "@/lib/api/expense-types";
import type { SemanticTone } from "@/lib/design/semantic";
import { budgetProgressTone } from "@/lib/design/semantic";

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
      return "tone-danger-text";
    case "NEAR_LIMIT":
      return "tone-orange-text";
    case "WARNING":
      return "tone-warning-text";
    default:
      return "tone-success-text";
  }
}

export function progressBarTone(status: BudgetStatus, percent?: number): string {
  if (percent != null) {
    return semanticProgressFromTone(budgetProgressTone(percent));
  }
  switch (status) {
    case "EXCEEDED":
      return semanticProgressFromTone("danger");
    case "NEAR_LIMIT":
      return semanticProgressFromTone("orange");
    case "WARNING":
      return semanticProgressFromTone("warning");
    default:
      return semanticProgressFromTone("success");
  }
}

function semanticProgressFromTone(tone: SemanticTone): string {
  const map: Record<SemanticTone, string> = {
    success: "bg-[var(--semantic-success)] shadow-[var(--glow-green)]",
    warning: "bg-[var(--semantic-warning)] shadow-[var(--glow-warning)]",
    danger: "bg-[var(--semantic-danger)] shadow-[var(--glow-danger)]",
    info: "bg-[var(--semantic-info)] shadow-[var(--glow-blue)]",
    primary: "bg-[var(--semantic-primary)] shadow-[var(--glow-primary)]",
    secondary: "bg-[var(--semantic-secondary)] shadow-[var(--glow-violet)]",
    accent: "bg-[var(--semantic-accent)] shadow-[var(--glow-pink)]",
    purple: "bg-[var(--accent-purple)] shadow-[var(--glow-purple)]",
    aqua: "bg-[var(--accent-aqua)] shadow-[var(--glow-aqua)]",
    orange: "bg-[var(--accent-orange)] shadow-[var(--glow-orange)]",
    muted: "bg-[var(--semantic-ignored)]",
    neutral: "bg-[var(--semantic-ignored)]",
  };
  return map[tone];
}

export function budgetBadgeTone(status: BudgetStatus): SemanticTone {
  switch (status) {
    case "EXCEEDED":
      return "danger";
    case "NEAR_LIMIT":
      return "orange";
    case "WARNING":
      return "warning";
    default:
      return "success";
  }
}

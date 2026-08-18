/**
 * Centralized semantic color system.
 * Components consume tone keys — never hardcode hex values.
 */

import type { CSSProperties } from "react";

export type SemanticTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary"
  | "secondary"
  | "accent"
  | "purple"
  | "aqua"
  | "orange"
  | "muted"
  | "neutral";

export type InsightKind =
  "positive" | "warning" | "budget-alert" | "over-budget" | "trend" | "ai" | "neutral";

export type MetricKind =
  | "spending"
  | "transactions"
  | "personal"
  | "shared"
  | "pending"
  | "budget"
  | "average"
  | "comparison";

const tonePrefix: Record<SemanticTone, string> = {
  success: "tone-success",
  warning: "tone-warning",
  danger: "tone-danger",
  info: "tone-info",
  primary: "tone-primary",
  secondary: "tone-secondary",
  accent: "tone-accent",
  purple: "tone-purple",
  aqua: "tone-aqua",
  orange: "tone-orange",
  muted: "tone-muted",
  neutral: "tone-muted",
};

/** Bordered stat chip surface */
export function semanticSurfaceClasses(tone: SemanticTone, glow?: boolean) {
  const p = tonePrefix[tone];
  return [
    "angular-clip-sm border px-3 py-2.5 transition",
    `${p}-border`,
    `${p}-bg`,
    glow ? `${p}-glow` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Badge: tinted bg + border + text + optional dot glow */
export function semanticBadgeClasses(tone: SemanticTone, withDot = false) {
  const p = tonePrefix[tone];
  return [
    "semantic-badge",
    `${p}-bg`,
    `${p}-border`,
    `${p}-text`,
    withDot && tone !== "muted" && tone !== "neutral" ? `${p}-glow` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Icon container: tinted bg + border + text */
export function semanticIconClasses(tone: SemanticTone, size: "sm" | "md" = "md") {
  const p = tonePrefix[tone];
  const dim = size === "sm" ? "size-8 text-sm" : "size-10 text-base";
  return ["semantic-icon-badge angular-clip-sm", dim, `${p}-bg`, `${p}-border`, `${p}-text`].join(
    " ",
  );
}

/** Status / source dot indicator */
export function semanticDotClasses(tone: SemanticTone) {
  const p = tonePrefix[tone];
  return ["semantic-dot", `${p}-text`, `${p}-glow`].join(" ");
}

/** Text color only */
export function semanticTextClasses(tone: SemanticTone) {
  return tonePrefix[tone] + "-text";
}

/** Progress / meter fill */
export function semanticProgressClasses(tone: SemanticTone) {
  const map: Record<SemanticTone, string> = {
    success: "bg-[var(--semantic-success)]",
    warning: "bg-[var(--semantic-warning)]",
    danger: "bg-[var(--semantic-danger)]",
    info: "bg-[var(--semantic-info)]",
    primary: "bg-[var(--semantic-primary)]",
    secondary: "bg-[var(--semantic-secondary)]",
    accent: "bg-[var(--semantic-accent)]",
    purple: "bg-[var(--accent-purple)]",
    aqua: "bg-[var(--accent-aqua)]",
    orange: "bg-[var(--accent-orange)]",
    muted: "bg-[var(--semantic-ignored)]",
    neutral: "bg-[var(--semantic-ignored)]",
  };
  return map[tone];
}

/** Budget progress bar color by usage percent */
export function budgetProgressTone(percent: number): SemanticTone {
  if (percent > 100) return "danger";
  if (percent >= 90) return "orange";
  if (percent >= 75) return "warning";
  if (percent >= 50) return "aqua";
  return "success";
}

/** Module navigation accents */
export const moduleAccent: Record<
  "/" | "/tasks" | "/checklists" | "/expenses" | "/wealth" | "/settings",
  SemanticTone
> = {
  "/": "primary",
  "/tasks": "secondary",
  "/checklists": "info",
  "/expenses": "aqua",
  "/wealth": "purple",
  "/settings": "muted",
};

/** Expense sub-nav tab accents */
export const expenseTabAccent: Record<string, SemanticTone> = {
  "/expenses": "primary",
  "/expenses/transactions": "aqua",
  "/expenses/budgets": "secondary",
  "/expenses/insights": "purple",
  "/expenses/categories": "orange",
  "/expenses/members": "info",
};

/** Metric tile accents for dashboard scanning */
export const metricAccent: Record<MetricKind, SemanticTone> = {
  spending: "primary",
  transactions: "primary",
  personal: "aqua",
  shared: "info",
  pending: "warning",
  budget: "secondary",
  average: "purple",
  comparison: "info",
};

/** Insight panel kind → tone */
export const insightTone: Record<InsightKind, SemanticTone> = {
  positive: "success",
  warning: "warning",
  "budget-alert": "orange",
  "over-budget": "danger",
  trend: "info",
  ai: "purple",
  neutral: "primary",
};

/** Chart fill colors — hex values because Recharts SVG fills don't always resolve CSS vars. */
export const insightChartColors = {
  member: "#9b7cff",
  merchant: "#4d8dff",
  weekly: "#5ce1e6",
  personal: "#41aea9",
  shared: "#4d8dff",
} as const;

/** Chart color tokens (CSS var references) */
export const chartColors = {
  primary: "var(--chart-line-primary)",
  secondary: "var(--chart-line-secondary)",
  comparison: "var(--chart-line-comparison)",
  positive: "var(--chart-trend-positive)",
  negative: "var(--chart-trend-negative)",
} as const;

/** CSS custom property for nav / card accent injection */
export function navAccentStyle(tone: SemanticTone): CSSProperties {
  const colorMap: Record<SemanticTone, string> = {
    success: "var(--semantic-success)",
    warning: "var(--semantic-warning)",
    danger: "var(--semantic-danger)",
    info: "var(--semantic-info)",
    primary: "var(--semantic-primary)",
    secondary: "var(--semantic-secondary)",
    accent: "var(--semantic-accent)",
    purple: "var(--accent-purple)",
    aqua: "var(--accent-aqua)",
    orange: "var(--accent-orange)",
    muted: "var(--semantic-ignored)",
    neutral: "var(--semantic-ignored)",
  };
  const glowMap: Record<SemanticTone, string> = {
    success: "var(--glow-green)",
    warning: "var(--glow-warning)",
    danger: "var(--glow-danger)",
    info: "var(--glow-blue)",
    primary: "var(--glow-primary)",
    secondary: "var(--glow-violet)",
    accent: "var(--glow-pink)",
    purple: "var(--glow-purple)",
    aqua: "var(--glow-aqua)",
    orange: "var(--glow-orange)",
    muted: "none",
    neutral: "none",
  };
  return {
    ["--nav-accent" as string]: colorMap[tone],
    ["--nav-glow" as string]: glowMap[tone],
    ["--card-accent" as string]: colorMap[tone],
  };
}

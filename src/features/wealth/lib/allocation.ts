import type { WealthHolding } from "@/lib/api/wealth-types";
import type { WealthPortfolioBreakdown } from "@/lib/api/wealth-types";

export type AllocationSlice = {
  key: keyof WealthPortfolioBreakdown;
  label: string;
  valueMinor: number;
  percent: number;
};

const LABELS: Record<keyof WealthPortfolioBreakdown, string> = {
  equityMinor: "Equity",
  mutualFundMinor: "Mutual Funds",
  etfMinor: "ETFs",
  otherMinor: "Other",
};

/** Derive asset allocation from holdings when portfolio breakdown is unavailable. */
export function allocationFromHoldings(holdings: WealthHolding[]): AllocationSlice[] {
  const totals: WealthPortfolioBreakdown = {
    equityMinor: 0,
    mutualFundMinor: 0,
    etfMinor: 0,
    otherMinor: 0,
  };

  for (const h of holdings) {
    const value = h.currentValueMinor ?? h.investedMinor ?? 0;
    const type = h.instrument?.instrumentType ?? "other";
    switch (type) {
      case "equity":
        totals.equityMinor += value;
        break;
      case "mutual_fund":
        totals.mutualFundMinor += value;
        break;
      case "etf":
        totals.etfMinor += value;
        break;
      default:
        totals.otherMinor += value;
    }
  }

  return allocationFromBreakdown(totals);
}

export function allocationFromBreakdown(breakdown: WealthPortfolioBreakdown): AllocationSlice[] {
  const total =
    breakdown.equityMinor + breakdown.mutualFundMinor + breakdown.etfMinor + breakdown.otherMinor;

  return (Object.keys(LABELS) as (keyof WealthPortfolioBreakdown)[])
    .map((key) => ({
      key,
      label: LABELS[key],
      valueMinor: breakdown[key],
      percent: total > 0 ? Math.round((breakdown[key] / total) * 1000) / 10 : 0,
    }))
    .filter((s) => s.valueMinor > 0)
    .sort((a, b) => b.valueMinor - a.valueMinor);
}

export function holdingDisplayValue(h: WealthHolding): number {
  return h.currentValueMinor ?? h.investedMinor ?? 0;
}

export function holdingDisplayPnl(h: WealthHolding): number {
  if (h.unrealizedPnlMinor != null) return h.unrealizedPnlMinor;
  const current = h.currentValueMinor ?? h.investedMinor ?? 0;
  return current - (h.investedMinor ?? 0);
}

export function holdingPnlPercent(h: WealthHolding): number {
  const invested = h.investedMinor ?? 0;
  if (invested <= 0) return 0;
  return Math.round((holdingDisplayPnl(h) / invested) * 1000) / 10;
}

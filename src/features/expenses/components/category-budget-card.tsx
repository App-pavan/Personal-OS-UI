import type { BudgetStatus } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { BudgetProgressBar } from "./budget-progress-bar";
import { GlassBadge, GlassCard, GlassInput } from "./glass";
import { budgetHealthLabel, budgetStatusTone } from "../lib/budget-utils";

export function CategoryBudgetCard({
  categoryName,
  limitMinor,
  spentMinor,
  remainingMinor,
  usagePercent,
  status,
  currency,
  editable,
  limitInput,
  onLimitChange,
}: {
  categoryName: string;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  usagePercent: number;
  status: BudgetStatus;
  currency: string;
  editable: boolean;
  limitInput?: string;
  onLimitChange?: (value: string) => void;
}) {
  const over = remainingMinor < 0;

  return (
    <GlassCard className="transition-shadow duration-200 hover:shadow-[0_0_24px_-8px_hsl(var(--primary)/0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{categoryName}</p>
          <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
            {formatMoney(spentMinor, currency)} spent
            {limitMinor > 0 ? ` · ${formatMoney(limitMinor, currency)} budget` : ""}
          </p>
        </div>
        <GlassBadge tone={status === "EXCEEDED" ? "warning" : status === "NEAR_LIMIT" ? "warning" : "muted"}>
          {budgetHealthLabel(status)}
        </GlassBadge>
      </div>

      {limitMinor > 0 ? (
        <>
          <BudgetProgressBar percent={usagePercent} status={status} className="mt-4" />
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>
              {over
                ? `${formatMoney(Math.abs(remainingMinor), currency)} over`
                : `${formatMoney(remainingMinor, currency)} remaining`}
            </span>
            <span>{usagePercent.toFixed(1)}%</span>
          </div>
        </>
      ) : null}

      {editable && onLimitChange ? (
        <label className="mt-4 block">
          <span className="label-eyebrow">Budget limit</span>
          <GlassInput
            className="mt-1.5 font-mono"
            placeholder="Add limit"
            value={limitInput ?? ""}
            onChange={(e) => onLimitChange(e.target.value)}
          />
        </label>
      ) : limitMinor > 0 ? (
        <p className={cn("mt-3 text-xs", budgetStatusTone(status))}>
          {budgetHealthLabel(status)}
        </p>
      ) : null}
    </GlassCard>
  );
}

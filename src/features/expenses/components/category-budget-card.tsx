import type { BudgetStatus } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { BudgetProgressBar } from "./budget-progress-bar";
import { GlassBadge, GlassCard } from "./glass";
import { budgetBadgeTone, budgetHealthLabel, budgetStatusTone } from "../lib/budget-utils";

export function CategoryBudgetCard({
  categoryName,
  categoryIcon,
  limitMinor,
  spentMinor,
  remainingMinor,
  usagePercent,
  status,
  currency,
}: {
  categoryName: string;
  categoryIcon?: string;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  usagePercent: number;
  status: BudgetStatus;
  currency: string;
}) {
  const over = remainingMinor < 0;

  return (
    <GlassCard className="transition-all duration-200 hover:border-primary/20 hover:shadow-[0_0_24px_-8px_rgb(255_95_0/18%)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[rgb(238_238_238/0.06)] text-base">
            {categoryIcon ?? "📁"}
          </span>
          <div>
            <p className="font-medium">{categoryName}</p>
            {limitMinor > 0 ? (
              <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
                {formatMoney(spentMinor, currency)} / {formatMoney(limitMinor, currency)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No limit set</p>
            )}
          </div>
        </div>
        {limitMinor > 0 ? (
          <GlassBadge tone={budgetBadgeTone(status)}>{budgetHealthLabel(status)}</GlassBadge>
        ) : null}
      </div>

      {limitMinor > 0 ? (
        <>
          <BudgetProgressBar percent={usagePercent} status={status} className="mt-4" />
          <div className="mt-3 flex justify-between text-xs">
            <span className={cn(over ? "text-destructive" : "text-muted-foreground")}>
              {over
                ? `${formatMoney(Math.abs(remainingMinor), currency)} over budget`
                : `${formatMoney(remainingMinor, currency)} remaining`}
            </span>
            <span className={budgetStatusTone(status)}>{usagePercent.toFixed(0)}%</span>
          </div>
        </>
      ) : null}
    </GlassCard>
  );
}

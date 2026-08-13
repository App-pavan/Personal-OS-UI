import type { BudgetStatus } from "@/lib/api/expense-types";
import { cn } from "@/lib/utils";
import { progressBarTone } from "../lib/budget-utils";

export function BudgetProgressBar({
  percent,
  status = "SAFE",
  className,
}: {
  percent: number;
  status?: BudgetStatus;
  className?: string;
}) {
  const width = Math.min(Math.max(percent, 0), 100);
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted/40", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          progressBarTone(status, percent),
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

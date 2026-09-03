import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { GlassButton } from "./glass";
import {
  formatMonthLabel,
  isMonthEditable,
  shiftMonth,
  currentMonthKey,
} from "../lib/budget-utils";
import { cn } from "@/lib/utils";

export function ExpenseMonthSelector({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  const editable = isMonthEditable(month);
  const isCurrent = month === currentMonthKey();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <GlassButton
        type="button"
        variant="ghost"
        className="px-2"
        onClick={() => onChange(shiftMonth(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </GlassButton>
      <div
        className={cn(
          "glass-panel flex min-w-[180px] items-center justify-center gap-2 rounded-xl border px-4 py-2",
          editable ? "border-primary/30" : "border-hairline/60",
        )}
      >
        {!editable ? <Lock className="size-3.5 text-muted-foreground" /> : null}
        <span className="text-sm font-medium">{formatMonthLabel(month)}</span>
        {editable && isCurrent ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
            Current
          </span>
        ) : null}
      </div>
      <GlassButton
        type="button"
        variant="ghost"
        className="px-2"
        onClick={() => onChange(shiftMonth(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </GlassButton>
    </div>
  );
}

/** @deprecated Use ExpenseMonthSelector */
export const BudgetMonthSelector = ExpenseMonthSelector;

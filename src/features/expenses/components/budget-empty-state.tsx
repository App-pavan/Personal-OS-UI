import { Plus, PiggyBank } from "lucide-react";
import { FuturisticButton } from "@/components/future";
import { currentMonthKey, formatMonthLabel } from "../lib/budget-utils";

export function BudgetEmptyState({
  month,
  onCreate,
  locked,
}: {
  month: string;
  onCreate: () => void;
  locked?: boolean;
}) {
  const isCurrent = month === currentMonthKey();
  const monthLabel = formatMonthLabel(month);
  const shortMonth = monthLabel.split(" ")[0];

  if (locked) {
    return (
      <div className="animate-hud-in flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid size-14 place-items-center angular-clip-sm border border-hairline bg-muted/30 text-muted-foreground">
          <PiggyBank className="size-7" strokeWidth={1.5} />
        </span>
        <p className="mt-6 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {monthLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Budget finalized</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Historical budgets cannot be modified.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-hud-in flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center angular-clip-sm border border-primary/30 bg-primary/10 text-primary shadow-[0_0_40px_-12px_rgb(65_174_169/35%)]">
        <PiggyBank className="size-7" strokeWidth={1.5} />
      </span>
      <p className="mt-6 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {monthLabel}
        {isCurrent ? <span className="text-primary"> · Current</span> : null}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">No budget yet</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Start with a monthly spending limit and optionally divide it across your categories.
      </p>
      <FuturisticButton type="button" onClick={onCreate} className="mt-8 h-11 px-6">
        <Plus className="size-4" />
        Create {shortMonth} budget
      </FuturisticButton>
    </div>
  );
}

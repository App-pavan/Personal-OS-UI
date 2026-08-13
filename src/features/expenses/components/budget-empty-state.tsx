import { Plus, PiggyBank } from "lucide-react";
import { GlassButton } from "./glass";
import { currentMonthKey, formatMonthLabel } from "../lib/budget-utils";
import { cn } from "@/lib/utils";

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
      <div className="expense-empty-state flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-hairline bg-[rgb(238_238_238/0.04)] text-muted-foreground">
          <PiggyBank className="size-7" strokeWidth={1.5} />
        </span>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {monthLabel}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Budget finalized</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Historical budgets cannot be modified. This month&apos;s spending was tracked against
          whatever budget was active at the time.
        </p>
      </div>
    );
  }

  return (
    <div className="expense-empty-state flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-[0_0_40px_-12px_rgb(255_95_0/35%)]">
        <PiggyBank className="size-7" strokeWidth={1.5} />
      </span>
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {monthLabel}
        {isCurrent ? (
          <>
            {" "}
            <span className="text-primary">· Current</span>
          </>
        ) : null}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">No budget yet</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Start with a monthly spending limit and optionally divide it across your categories.
      </p>
      <GlassButton
        type="button"
        onClick={onCreate}
        className={cn(
          "mt-8 h-11 px-6 text-sm font-semibold shadow-[0_0_32px_-8px_rgb(255_95_0/50%)]",
          "bg-primary text-primary-foreground hover:bg-[#ff7722]",
        )}
      >
        <Plus className="size-4" />
        Create {shortMonth} budget
      </GlassButton>
    </div>
  );
}

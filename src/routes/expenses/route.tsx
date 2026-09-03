import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { ExpenseMonthSelector } from "@/features/expenses/components/budget-month-selector";
import { ExpenseNav } from "@/features/expenses/components/expense-nav";
import { ExpenseMonthProvider, useExpenseMonth } from "@/features/expenses/expense-month-context";
import { currentMonthKey } from "@/features/expenses/lib/budget-utils";
import { parseMonthKey } from "@/features/expenses/lib/month-utils";
import { PERM } from "@/lib/permissions";

type ExpensesSearch = {
  month: string;
};

export const Route = createFileRoute("/expenses")({
  beforeLoad: requirePermissions(PERM.EXPENSES_TRANSACTIONS_VIEW),
  validateSearch: (search: Record<string, unknown>): ExpensesSearch => ({
    month: parseMonthKey(search.month, currentMonthKey()),
  }),
  component: ExpensesLayout,
});

function ExpensesLayout() {
  return (
    <ExpenseMonthProvider>
      <ExpensesLayoutInner />
    </ExpenseMonthProvider>
  );
}

function ExpensesLayoutInner() {
  const { month, setMonth } = useExpenseMonth();

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
      <ExpenseNav />
      <div className="flex justify-end">
        <ExpenseMonthSelector month={month} onChange={setMonth} />
      </div>
      <Outlet />
    </div>
  );
}

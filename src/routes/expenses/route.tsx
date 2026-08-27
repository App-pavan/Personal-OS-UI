import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { ExpenseNav } from "@/features/expenses/components/expense-nav";
import { PERM } from "@/lib/permissions";

export const Route = createFileRoute("/expenses")({
  beforeLoad: requirePermissions(PERM.EXPENSES_TRANSACTIONS_VIEW),
  component: ExpensesLayout,
});

function ExpensesLayout() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
      <ExpenseNav />
      <Outlet />
    </div>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ExpenseNav } from "@/features/expenses/components/expense-nav";

export const Route = createFileRoute("/expenses")({
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

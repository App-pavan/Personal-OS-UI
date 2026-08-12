import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { RecentTransactions } from "@/features/expenses/components/recent-transactions";
import { SpendingSummary } from "@/features/expenses/components/spending-summary";
import { SpendingTrend } from "@/features/expenses/components/spending-trend";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import { monthRange, periodLabel, type PeriodKey } from "@/features/expenses/lib/analytics";
import { GlassButton, GlassCard } from "@/features/expenses/components/glass";
import {
  useCategories,
  useExpenseDashboard,
  useMembers,
  useTransaction,
  useTransactionMutations,
} from "@/hooks/use-expenses";

export const Route = createFileRoute("/expenses/")({
  head: () => ({ meta: [{ title: "Expenses — Personal OS" }] }),
  component: ExpenseOverviewPage,
});

function ExpenseOverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>("this_month");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { from } = monthRange(period);
  const monthKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`;

  const dashboard = useExpenseDashboard(monthKey);
  const categories = useCategories();
  const members = useMembers();
  const detail = useTransaction(selectedId);
  const m = useTransactionMutations();

  const dash = dashboard.data;
  const recent = dash?.recentTransactions ?? [];
  const breakdownItems = useMemo(
    () =>
      (dash?.topCategories ?? []).map((c) => ({
        id: c.categoryId,
        name: c.categoryName,
        amountMinor: c.amountMinor,
        percentage: c.percentage,
        budgetLimitMinor: c.budgetLimitMinor,
        budgetUsagePercent: c.budgetUsagePercent,
        budgetStatus: c.budgetStatus,
      })),
    [dash?.topCategories],
  );

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Expense overview"
        description={periodLabel(period)}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-hairline/60 p-0.5">
              {(
                [
                  ["this_month", "This month"],
                  ["last_month", "Last month"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={
                    period === key
                      ? "rounded-md bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary"
                      : "rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <Link to="/expenses/budgets">
              <GlassButton>Budget</GlassButton>
            </Link>
          </div>
        }
      />

      {dashboard.isError ? (
        <ErrorState
          error={dashboard.error}
          onRetry={() => dashboard.refetch()}
          title="Couldn't load expenses"
        />
      ) : dashboard.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SpendingSummary loading totalMinor={0} currency="INR" transactionCount={0} personalCount={0} sharedCount={0} pendingCount={0} delta={null} />
          <SpendingTrend loading daily={[]} currency="INR" />
        </div>
      ) : !dash || dash.transactionCount === 0 ? (
        <EmptyState
          title="No expenses yet"
          line="Your transactions will appear here as you start spending."
          action={
            <Link to="/expenses/transactions">
              <GlassButton>Add expense</GlassButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4 animate-rise">
          {dash.budgetAlerts.length > 0 ? (
            <div className="space-y-2">
              {dash.budgetAlerts.map((alert, i) => (
                <GlassCard key={i} className="border-warning/30 text-sm">
                  {alert.message}
                </GlassCard>
              ))}
            </div>
          ) : null}
          <SpendingSummary
            totalMinor={dash.totalSpentMinor}
            currency={dash.currency}
            transactionCount={dash.transactionCount}
            personalCount={0}
            sharedCount={0}
            pendingCount={0}
            delta={null}
            budgetTotalMinor={dash.budgetTotalMinor}
            budgetRemainingMinor={dash.budgetRemainingMinor}
            budgetUsagePercent={dash.budgetUsagePercent}
            budgetStatus={dash.budgetStatus}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SpendingTrend daily={dash.weeklyTrend} currency={dash.currency} />
            <CategoryBreakdown
              items={breakdownItems}
              total={dash.totalSpentMinor}
              currency={dash.currency}
            />
          </div>
          <RecentTransactions transactions={recent} onSelect={setSelectedId} />
        </div>
      )}

      <TransactionDetail
        transaction={detail.data ?? null}
        categories={categories.data ?? []}
        members={members.data ?? []}
        open={Boolean(selectedId)}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onUpdate={(input) =>
          selectedId &&
          m.update.mutate(
            { id: selectedId, input },
            { onSuccess: () => setSelectedId(null) },
          )
        }
        onIgnore={(id) => m.ignore.mutate(id)}
        onUnignore={(id) => m.unignore.mutate(id)}
        onArchive={(id) => {
          m.remove.mutate(id);
          setSelectedId(null);
        }}
        updating={m.update.isPending}
      />
    </>
  );
}

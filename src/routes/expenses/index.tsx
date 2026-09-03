import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InsightPanel, SectionHeader } from "@/components/future";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { RecentTransactions } from "@/features/expenses/components/recent-transactions";
import { SpendingSummary } from "@/features/expenses/components/spending-summary";
import { SpendingTrend } from "@/features/expenses/components/spending-trend";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import { GlassButton } from "@/features/expenses/components/glass";
import { useExpenseMonth } from "@/features/expenses/expense-month-context";
import { formatMonthLabel } from "@/features/expenses/lib/budget-utils";
import {
  collapseSmsDuplicates,
  resolveCanonicalTransactionId,
} from "@/features/expenses/lib/sms-duplicate-matcher";
import {
  useCategories,
  useExpenseDashboard,
  useMembers,
  useTransaction,
  useTransactionMutations,
} from "@/hooks/use-expenses";
import {
  useSmsDuplicateCleanup,
  useSmsDuplicateCleanupPool,
} from "@/hooks/use-sms-duplicate-cleanup";

export const Route = createFileRoute("/expenses/")({
  head: () => ({ meta: [{ title: "Expenses — Personal OS" }] }),
  component: ExpenseOverviewPage,
});

function ExpenseOverviewPage() {
  const { month } = useExpenseMonth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dashboard = useExpenseDashboard(month);
  const cleanupQuery = useSmsDuplicateCleanupPool(month);
  const categories = useCategories();
  const members = useMembers();
  const detail = useTransaction(selectedId);
  const m = useTransactionMutations();

  const cleanupPool = cleanupQuery.data?.items ?? [];
  useSmsDuplicateCleanup(cleanupPool);

  const dash = dashboard.data;
  const recent = useMemo(
    () => collapseSmsDuplicates(dash?.recentTransactions ?? []),
    [dash?.recentTransactions],
  );
  const pendingCount = useMemo(
    () => collapseSmsDuplicates(cleanupPool).filter((tx) => tx.status === "pending").length,
    [cleanupPool],
  );
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

  const loading = dashboard.isLoading || dashboard.isFetching;

  return (
    <>
      <SectionHeader
        system="Expense system"
        module="Module 01 / Overview"
        title="Financial command center"
        subtitle={formatMonthLabel(month)}
        actions={
          <Link to="/expenses/budgets" search={{ month }}>
            <GlassButton variant="ghost">Budget control</GlassButton>
          </Link>
        }
      />

      {dashboard.isError ? (
        <ErrorState
          error={dashboard.error}
          onRetry={() => dashboard.refetch()}
          title="Couldn't load expense intelligence"
        />
      ) : loading && !dash ? (
        <div className="mt-6 space-y-4">
          <SpendingSummary
            loading
            totalMinor={0}
            currency="INR"
            transactionCount={0}
            personalCount={0}
            sharedCount={0}
            pendingCount={pendingCount}
            delta={null}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <SpendingTrend loading daily={[]} currency="INR" />
            <CategoryBreakdown items={[]} total={0} currency="INR" loading />
          </div>
        </div>
      ) : !dash || dash.transactionCount === 0 ? (
        <EmptyState
          title={`No activity for ${formatMonthLabel(month)}`}
          line="Once transactions are recorded for this month, your spending intelligence will appear here."
          action={
            <Link to="/expenses/transactions" search={{ month }}>
              <GlassButton>Add transaction</GlassButton>
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-5 animate-hud-in">
          {dash.budgetAlerts.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {dash.budgetAlerts.map((alert, i) => (
                <InsightPanel key={i} signal="Budget signal" kind="budget-alert">
                  {alert.message}
                </InsightPanel>
              ))}
            </div>
          ) : null}

          <SpendingSummary
            totalMinor={dash.totalSpentMinor}
            currency={dash.currency}
            transactionCount={dash.transactionCount}
            personalCount={0}
            sharedCount={0}
            pendingCount={pendingCount}
            delta={null}
            budgetTotalMinor={dash.budgetTotalMinor}
            budgetRemainingMinor={dash.budgetRemainingMinor}
            budgetUsagePercent={dash.budgetUsagePercent}
            budgetStatus={dash.budgetStatus}
          />

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <SpendingTrend daily={dash.weeklyTrend} currency={dash.currency} />
            </div>
            <div className="xl:col-span-5">
              <CategoryBreakdown
                items={breakdownItems}
                total={dash.totalSpentMinor}
                currency={dash.currency}
              />
            </div>
          </div>

          <RecentTransactions
            transactions={recent}
            categories={categories.data ?? []}
            onSelect={(id) =>
              setSelectedId(resolveCanonicalTransactionId(id, cleanupPool))
            }
          />
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
          m.update.mutate({ id: selectedId, input }, { onSuccess: () => setSelectedId(null) })
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

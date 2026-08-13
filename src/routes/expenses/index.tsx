import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InsightPanel, PeriodChip, SectionHeader } from "@/components/future";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { RecentTransactions } from "@/features/expenses/components/recent-transactions";
import { SpendingSummary } from "@/features/expenses/components/spending-summary";
import { SpendingTrend } from "@/features/expenses/components/spending-trend";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import { monthRange, periodLabel, type PeriodKey } from "@/features/expenses/lib/analytics";
import { GlassButton } from "@/features/expenses/components/glass";
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
      <SectionHeader
        system="Expense system"
        module="Module 01 / Overview"
        title="Financial command center"
        subtitle={periodLabel(period)}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 border border-hairline/60 p-0.5 angular-clip-sm">
              {(
                [
                  ["this_month", "This month"],
                  ["last_month", "Last month"],
                ] as const
              ).map(([key, label]) => (
                <PeriodChip
                  key={key}
                  label={label}
                  active={period === key}
                  onClick={() => setPeriod(key)}
                />
              ))}
            </div>
            <Link to="/expenses/budgets">
              <GlassButton variant="ghost">Budget control</GlassButton>
            </Link>
          </div>
        }
      />

      {dashboard.isError ? (
        <ErrorState
          error={dashboard.error}
          onRetry={() => dashboard.refetch()}
          title="Couldn't load expense intelligence"
        />
      ) : dashboard.isLoading ? (
        <div className="mt-6 space-y-4">
          <SpendingSummary
            loading
            totalMinor={0}
            currency="INR"
            transactionCount={0}
            personalCount={0}
            sharedCount={0}
            pendingCount={0}
            delta={null}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <SpendingTrend loading daily={[]} currency="INR" />
            <CategoryBreakdown items={[]} total={0} currency="INR" loading />
          </div>
        </div>
      ) : !dash || dash.transactionCount === 0 ? (
        <EmptyState
          title="No financial signals yet"
          line="Once transactions are recorded, your spending intelligence will appear here."
          action={
            <Link to="/expenses/transactions">
              <GlassButton>Add transaction</GlassButton>
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-5 animate-hud-in">
          {dash.budgetAlerts.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {dash.budgetAlerts.map((alert, i) => (
                <InsightPanel key={i} signal="Budget signal">
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
            pendingCount={0}
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

import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { RecentTransactions } from "@/features/expenses/components/recent-transactions";
import { SpendingSummary } from "@/features/expenses/components/spending-summary";
import { SpendingTrend } from "@/features/expenses/components/spending-trend";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import {
  comparePeriods,
  deriveCategoryBreakdown,
  deriveSummary,
  monthRange,
  periodLabel,
  type PeriodKey,
} from "@/features/expenses/lib/analytics";
import {
  useCategories,
  useMembers,
  useTransaction,
  useTransactionMutations,
  useTransactions,
} from "@/hooks/use-expenses";
import { GlassButton } from "@/features/expenses/components/glass";

export const Route = createFileRoute("/expenses/")({
  head: () => ({ meta: [{ title: "Expenses — Personal OS" }] }),
  component: ExpenseOverviewPage,
});

function ExpenseOverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>("this_month");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { from, to } = monthRange(period);

  const list = useTransactions({
    from: from.toISOString(),
    to: to.toISOString(),
    limit: 200,
    sort: "occurredAt",
    order: "desc",
  });
  const prevList = useTransactions({
    from: new Date(from.getTime() - (to.getTime() - from.getTime())).toISOString(),
    to: from.toISOString(),
    limit: 200,
  });
  const categories = useCategories();
  const members = useMembers();
  const detail = useTransaction(selectedId);
  const m = useTransactionMutations();

  const items = list.data?.items ?? [];
  const catMap = useMemo(
    () => new Map((categories.data ?? []).map((c) => [c.id, c.name])),
    [categories.data],
  );
  const summary = deriveSummary(items, from, to);
  const breakdown = deriveCategoryBreakdown(items, from, to, catMap);
  const delta = comparePeriods(items, prevList.data?.items ?? [], from, to);

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Expense overview"
        description={periodLabel(period)}
        actions={
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
        }
      />

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} title="Couldn't load expenses" />
      ) : list.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SpendingSummary loading totalMinor={0} currency="INR" transactionCount={0} personalCount={0} sharedCount={0} pendingCount={0} delta={null} />
          <SpendingTrend loading transactions={[]} currency="INR" />
        </div>
      ) : items.length === 0 ? (
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
          <SpendingSummary
            totalMinor={summary.totalMinor}
            currency={summary.currency}
            transactionCount={summary.count}
            personalCount={summary.personal}
            sharedCount={summary.shared}
            pendingCount={summary.pending}
            delta={delta}
            partial={summary.partial}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SpendingTrend transactions={items} currency={summary.currency} />
            <CategoryBreakdown
              items={breakdown.items}
              total={breakdown.total}
              currency={summary.currency}
            />
          </div>
          <RecentTransactions
            transactions={items.slice(0, 6)}
            onSelect={setSelectedId}
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

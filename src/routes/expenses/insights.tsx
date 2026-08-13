import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InsightPanel, MetricPanel, PeriodChip, SectionHeader } from "@/components/future";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { SpendingTrend } from "@/features/expenses/components/spending-trend";
import { BudgetProgressBar } from "@/features/expenses/components/budget-progress-bar";
import { GlassCard } from "@/features/expenses/components/glass";
import {
  currentMonthKey,
  formatMonthLabel,
  shiftMonth,
} from "@/features/expenses/lib/budget-utils";
import {
  useCategoryInsights,
  useExpenseDashboard,
  useMemberInsights,
  useMerchantInsights,
  useMonthlyInsights,
} from "@/hooks/use-expenses";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/insights")({
  head: () => ({ meta: [{ title: "Insights — Personal OS" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const [month, setMonth] = useState(currentMonthKey());

  const dashboard = useExpenseDashboard(month);
  const monthly = useMonthlyInsights(month);
  const categories = useCategoryInsights(month);
  const merchants = useMerchantInsights(month);
  const members = useMemberInsights(month);

  const loading = dashboard.isLoading || monthly.isLoading || categories.isLoading;

  const breakdownItems = useMemo(
    () =>
      (categories.data ?? []).map((c) => ({
        id: c.categoryId,
        name: c.categoryName,
        amountMinor: c.amountMinor,
        percentage: c.percentage,
        budgetLimitMinor: c.budgetLimitMinor,
        budgetUsagePercent: c.budgetUsagePercent,
        budgetStatus: c.budgetStatus,
      })),
    [categories.data],
  );

  const dash = dashboard.data;
  const mon = monthly.data;

  return (
    <>
      <SectionHeader
        system="Expense system"
        module="Module 04 / Intelligence"
        title="Spending intelligence"
        subtitle={formatMonthLabel(month)}
        actions={
          <div className="flex gap-1 border border-hairline/60 p-0.5 angular-clip-sm">
            <PeriodChip
              label="This month"
              active={month === currentMonthKey()}
              onClick={() => setMonth(currentMonthKey())}
            />
            <PeriodChip
              label="Last month"
              active={month === shiftMonth(currentMonthKey(), -1)}
              onClick={() => setMonth(shiftMonth(currentMonthKey(), -1))}
            />
          </div>
        }
      />

      {loading ? (
        <div className="glass-panel h-48 animate-pulse rounded-2xl bg-muted/30" />
      ) : dashboard.isError ? (
        <ErrorState
          error={dashboard.error}
          onRetry={() => dashboard.refetch()}
          title="Couldn't load insights"
        />
      ) : !dash ? (
        <EmptyState
          title="No insights yet"
          line="Once you track expenses, your spending picture will appear here."
        />
      ) : (
        <div className="mt-6 space-y-5 animate-hud-in">
          {mon?.changePercent != null ? (
            <InsightPanel signal="Spending signal">
              Total spending {mon.changePercent >= 0 ? "increased" : "decreased"}{" "}
              {Math.abs(mon.changePercent).toFixed(1)}% compared with last month.
            </InsightPanel>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              label="Total spending"
              value={formatMoney(dash.totalSpentMinor, dash.currency)}
            />
            <SummaryTile
              label="Avg per transaction"
              value={
                mon?.averageTransactionMinor
                  ? formatMoney(mon.averageTransactionMinor, dash.currency)
                  : dash.transactionCount
                    ? formatMoney(
                        Math.round(dash.totalSpentMinor / dash.transactionCount),
                        dash.currency,
                      )
                    : "—"
              }
            />
            <SummaryTile
              label="Personal / Shared"
              value={`${formatMoney(mon?.personalSpentMinor ?? 0, dash.currency)} / ${formatMoney(mon?.sharedSpentMinor ?? 0, dash.currency)}`}
            />
            <SummaryTile
              label="vs last month"
              value={
                mon?.changePercent != null
                  ? `${mon.changePercent >= 0 ? "+" : ""}${mon.changePercent.toFixed(1)}%`
                  : "—"
              }
              accent={mon?.changePercent != null && mon.changePercent > 0}
            />
          </div>

          {dash.budgetTotalMinor ? (
            <GlassCard glow>
              <p className="label-eyebrow">Budget usage</p>
              <p className="mt-2 font-mono text-2xl tabular-nums">
                {formatMoney(dash.totalSpentMinor, dash.currency)} /{" "}
                {formatMoney(dash.budgetTotalMinor, dash.currency)}
              </p>
              <BudgetProgressBar
                className="mt-4"
                percent={dash.budgetUsagePercent ?? 0}
                status={dash.budgetStatus ?? "SAFE"}
              />
            </GlassCard>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <SpendingTrend daily={dash.weeklyTrend} currency={dash.currency} />
            <CategoryBreakdown
              items={breakdownItems}
              total={breakdownItems.reduce((s, i) => s + i.amountMinor, 0)}
              currency={dash.currency}
            />
          </div>

          {categories.data && categories.data.length > 0 ? (
            <GlassCard>
              <p className="label-eyebrow mb-4">Budget vs actual</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium">Budget</th>
                      <th className="pb-2 font-medium">Spent</th>
                      <th className="pb-2 font-medium">Remaining</th>
                      <th className="pb-2 font-medium">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.data
                      .filter((c) => c.budgetLimitMinor)
                      .map((c) => (
                        <tr key={c.categoryId} className="border-t border-hairline/40">
                          <td className="py-2.5">{c.categoryName}</td>
                          <td className="py-2.5 font-mono tabular-nums">
                            {formatMoney(c.budgetLimitMinor ?? 0, dash.currency)}
                          </td>
                          <td className="py-2.5 font-mono tabular-nums">
                            {formatMoney(c.budgetSpentMinor ?? c.amountMinor, dash.currency)}
                          </td>
                          <td className="py-2.5 font-mono tabular-nums">
                            {formatMoney(c.budgetRemainingMinor ?? 0, dash.currency)}
                          </td>
                          <td className="py-2.5 font-mono tabular-nums">
                            {c.budgetUsagePercent?.toFixed(1) ?? "—"}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard>
              <p className="label-eyebrow mb-3">Top merchants</p>
              {(merchants.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No merchant data for this period.</p>
              ) : (
                <ul className="space-y-2">
                  {merchants.data?.map((m) => (
                    <li key={m.merchant} className="flex justify-between text-sm">
                      <span>{m.merchant}</span>
                      <span className="font-mono tabular-nums">
                        {formatMoney(m.amountMinor, dash.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
            <GlassCard>
              <p className="label-eyebrow mb-3">Shared by member</p>
              {(members.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No shared spending in this period.</p>
              ) : (
                <ul className="space-y-2">
                  {members.data?.map((m) => (
                    <li key={m.memberId} className="flex justify-between text-sm">
                      <span>{m.memberName}</span>
                      <span className="font-mono tabular-nums">
                        {formatMoney(m.amountMinor, dash.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <GlassCard>
      <p className="label-eyebrow">{label}</p>
      <p className={cn("mt-2 font-mono text-xl tabular-nums", accent && "text-primary")}>{value}</p>
    </GlassCard>
  );
}

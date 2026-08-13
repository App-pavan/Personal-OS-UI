import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InsightPanel, PeriodChip, SectionHeader } from "@/components/future";
import type { SemanticTone } from "@/lib/design/semantic";
import { navAccentStyle, semanticTextClasses } from "@/lib/design/semantic";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { SpendingTrend } from "@/features/expenses/components/spending-trend";
import { BudgetProgressBar } from "@/features/expenses/components/budget-progress-bar";
import {
  CategoryBarChart,
  InsightSection,
  MemberBarChart,
  MerchantBarChart,
  PersonalSharedDonut,
  WeeklyPatternChart,
} from "@/features/expenses/components/insight-charts";
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
  const largest =
    dash?.recentTransactions && dash.recentTransactions.length > 0
      ? dash.recentTransactions.reduce(
          (max, tx) => (tx.amountMinor > max.amountMinor ? tx : max),
          dash.recentTransactions[0]!,
        )
      : undefined;

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
        <div className="mt-6 space-y-8 animate-hud-in">
          {/* SECTION 1: Financial summary */}
          <InsightSection title="Financial summary">
            {mon?.changePercent != null ? (
              <InsightPanel
                signal="Spending signal"
                kind={mon.changePercent >= 0 ? "over-budget" : "positive"}
              >
                Total spending {mon.changePercent >= 0 ? "increased" : "decreased"}{" "}
                {Math.abs(mon.changePercent).toFixed(1)}% compared with last month.
              </InsightPanel>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryTile
                label="Total spending"
                value={formatMoney(dash.totalSpentMinor, dash.currency)}
                tone="primary"
              />
              <SummaryTile label="Transactions" value={String(dash.transactionCount)} tone="aqua" />
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
                tone="purple"
              />
              <SummaryTile
                label="vs last month"
                value={
                  mon?.changePercent != null
                    ? `${mon.changePercent >= 0 ? "+" : ""}${mon.changePercent.toFixed(1)}%`
                    : "—"
                }
                tone={mon?.changePercent != null && mon.changePercent > 0 ? "danger" : "success"}
              />
            </div>
          </InsightSection>

          {/* SECTION 2: Spending trend */}
          <InsightSection title="Spending trend">
            <SpendingTrend daily={dash.weeklyTrend} currency={dash.currency} />
          </InsightSection>

          {/* SECTION 3: Category analysis */}
          <InsightSection title="Category analysis">
            <div className="grid gap-6 xl:grid-cols-2">
              <CategoryBreakdown
                items={breakdownItems}
                total={breakdownItems.reduce((s, i) => s + i.amountMinor, 0)}
                currency={dash.currency}
              />
              <GlassCard accent="orange">
                <p className="label-eyebrow mb-3">Category comparison</p>
                <CategoryBarChart items={categories.data ?? []} currency={dash.currency} />
              </GlassCard>
            </div>
          </InsightSection>

          {/* SECTION 4: People / split */}
          <InsightSection title="People & split analysis">
            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard accent="info">
                <p className="label-eyebrow mb-3">Personal vs shared</p>
                <PersonalSharedDonut
                  personalMinor={mon?.personalSpentMinor ?? 0}
                  sharedMinor={mon?.sharedSpentMinor ?? 0}
                  currency={dash.currency}
                />
              </GlassCard>
              <GlassCard accent="secondary">
                <p className="label-eyebrow mb-3">Shared by member</p>
                <MemberBarChart items={members.data ?? []} currency={dash.currency} />
              </GlassCard>
            </div>
          </InsightSection>

          {/* SECTION 5: Merchant analysis */}
          <InsightSection title="Merchant analysis">
            <GlassCard accent="info">
              <p className="label-eyebrow mb-3">Top merchants</p>
              <MerchantBarChart items={merchants.data ?? []} currency={dash.currency} />
            </GlassCard>
          </InsightSection>

          {/* SECTION 6: Budget analysis */}
          {dash.budgetTotalMinor ? (
            <InsightSection title="Budget analysis">
              <GlassCard glow accent="secondary">
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
              {categories.data && categories.data.some((c) => c.budgetLimitMinor) ? (
                <GlassCard className="mt-4">
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
                              <td className="py-2.5">
                                <Link
                                  to="/expenses/transactions"
                                  search={{ category: c.categoryId }}
                                  className="hover:text-primary"
                                >
                                  {c.categoryName}
                                </Link>
                              </td>
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
            </InsightSection>
          ) : null}

          {/* SECTION 7: Behavioral patterns */}
          <InsightSection title="Behavioral patterns">
            <GlassCard accent="aqua">
              <p className="label-eyebrow mb-3">Weekly spending pattern</p>
              <WeeklyPatternChart daily={dash.weeklyTrend ?? []} currency={dash.currency} />
            </GlassCard>
          </InsightSection>

          {/* SECTION 8: Highlights */}
          <InsightSection title="Highlights">
            <div className="grid gap-4 md:grid-cols-3">
              <GlassCard>
                <p className="label-eyebrow">Largest transaction</p>
                {largest ? (
                  <>
                    <p className="mt-2 font-medium">{largest.merchant}</p>
                    <p className="mt-1 font-mono text-lg tabular-nums">
                      {formatMoney(largest.amountMinor, dash.currency)}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
                )}
              </GlassCard>
              <GlassCard>
                <p className="label-eyebrow">Most frequent merchant</p>
                {merchants.data?.[0] ? (
                  <>
                    <p className="mt-2 font-medium">{merchants.data[0].merchant}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {merchants.data[0].transactionCount} transactions
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No merchant data.</p>
                )}
              </GlassCard>
              <GlassCard>
                <p className="label-eyebrow">Top spending member</p>
                {members.data?.[0] ? (
                  <>
                    <p className="mt-2 font-medium">{members.data[0].memberName}</p>
                    <p className="mt-1 font-mono tabular-nums">
                      {formatMoney(members.data[0].amountMinor, dash.currency)}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No shared spending.</p>
                )}
              </GlassCard>
            </div>
          </InsightSection>
        </div>
      )}
    </>
  );
}

function SummaryTile({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string;
  tone?: SemanticTone;
}) {
  return (
    <div className="hud-panel angular-clip p-4 card-accent-top" style={navAccentStyle(tone)}>
      <p className="label-eyebrow">{label}</p>
      <p className={cn("mt-2 font-mono text-xl tabular-nums", semanticTextClasses(tone))}>
        {value}
      </p>
    </div>
  );
}

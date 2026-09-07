import { useMemo } from "react";
import { useCan } from "@/features/capabilities/can";
import { currentMonthKey, formatMonthLabel } from "@/features/expenses/lib/budget-utils";
import { collapseSmsDuplicates } from "@/features/expenses/lib/sms-duplicate-matcher";
import { computeDeviceDashboardMetrics } from "../lib/device-metrics";
import { computeTaskDashboardMetrics } from "../lib/task-metrics";
import { ComparisonHint, ModuleSummaryCard } from "./module-summary-card";
import { MiniSpendingSparkline } from "./mini-spending-sparkline";
import { formatMoney } from "@/lib/money";
import { formatPnlPercent, pnlTone } from "@/features/wealth/lib/format";
import { PERM } from "@/lib/permissions";
import type { ExpenseDashboard } from "@/lib/api/expense-types";
import type { MonthlySummary } from "@/lib/api/expense-types";
import type { WealthOverview } from "@/lib/api/wealth-types";
import type { DeviceListItem } from "@/features/device-awareness/lib/presence-utils";
import type { TaskDashboardMetrics } from "../lib/task-metrics";
import type { DeviceDashboardMetrics } from "../lib/device-metrics";
import { DashboardWidget } from "./dashboard-widget";
import { RowsSkeleton } from "@/components/os/state-views";

export function ModuleSummaryRow({
  month,
  taskMetrics,
  tasksLoading,
  expenseDash,
  expenseInsights,
  expensesLoading,
  expensesError,
  onExpensesRetry,
  wealth,
  wealthLoading,
  wealthError,
  onWealthRetry,
  deviceItems,
  devicesLoading,
  devicesError,
  onDevicesRetry,
  onAddTask,
  onAddExpense,
}: {
  month: string;
  taskMetrics: TaskDashboardMetrics | null;
  tasksLoading?: boolean;
  expenseDash?: ExpenseDashboard;
  expenseInsights?: MonthlySummary;
  expensesLoading?: boolean;
  expensesError?: unknown;
  onExpensesRetry?: () => void;
  wealth?: WealthOverview;
  wealthLoading?: boolean;
  wealthError?: unknown;
  onWealthRetry?: () => void;
  deviceItems: DeviceListItem[];
  devicesLoading?: boolean;
  devicesError?: unknown;
  onDevicesRetry?: () => void;
  onAddTask: () => void;
  onAddExpense: () => void;
}) {
  const { can } = useCan();
  const showTasks = can(PERM.TASKS_VIEW);
  const showExpenses = can(PERM.EXPENSES_TRANSACTIONS_VIEW);
  const showWealth = can(PERM.WEALTH_PORTFOLIO_VIEW);
  const showDevices = can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  const deviceMetrics = useMemo(
    () => (deviceItems.length ? computeDeviceDashboardMetrics(deviceItems) : null),
    [deviceItems],
  );

  const cards = [
    showTasks && (
      <ModuleSummaryCard
        key="tasks"
        title="Tasks"
        to="/tasks"
        accent="primary"
        action="add"
        actionPermission={PERM.TASKS_CREATE}
        actionLabel="Add task"
        onActionClick={onAddTask}
        metrics={
          tasksLoading || !taskMetrics
            ? [
                { label: "Open", value: "—" },
                { label: "Due today", value: "—" },
              ]
            : [
                { label: "Open", value: String(taskMetrics.open) },
                { label: "Due today", value: String(taskMetrics.dueToday), tone: "info" },
                ...(taskMetrics.completionPercent != null
                  ? [
                      {
                        label: "Progress",
                        value: `${taskMetrics.completionPercent}%`,
                        tone: "success" as const,
                      },
                    ]
                  : []),
              ]
        }
      />
    ),
    showExpenses && (
      <ExpensesSummaryCard
        key="expenses"
        month={month}
        dash={expenseDash}
        insights={expenseInsights}
        loading={expensesLoading}
        error={expensesError}
        onRetry={onExpensesRetry}
        onAddExpense={onAddExpense}
      />
    ),
    showWealth && (
      <WealthSummaryCard
        key="wealth"
        overview={wealth}
        loading={wealthLoading}
        error={wealthError}
        onRetry={onWealthRetry}
      />
    ),
    showDevices && (
      <DevicesSummaryCard
        key="devices"
        metrics={deviceMetrics}
        loading={devicesLoading}
        error={devicesError}
        onRetry={onDevicesRetry}
      />
    ),
  ].filter(Boolean);

  if (!cards.length) return null;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards}</div>
  );
}

function ExpensesSummaryCard({
  month,
  dash,
  insights,
  loading,
  error,
  onRetry,
  onAddExpense,
}: {
  month: string;
  dash?: ExpenseDashboard;
  insights?: MonthlySummary;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onAddExpense: () => void;
}) {
  if (error) {
    return (
      <DashboardWidget error={error} onRetry={onRetry} errorTitle="Expenses unavailable" />
    );
  }

  if (loading && !dash) {
    return (
      <div className="metric-panel p-5">
        <RowsSkeleton rows={2} />
      </div>
    );
  }

  const total = dash?.totalSpentMinor ?? 0;
  const currency = dash?.currency ?? "INR";

  return (
    <ModuleSummaryCard
      title="Expenses"
      to="/expenses"
      search={{ month }}
      accent="aqua"
      action="add"
      actionPermission={PERM.EXPENSES_TRANSACTIONS_CREATE}
      actionLabel="Add expense"
      onActionClick={onAddExpense}
      metrics={[
        { label: "This month", value: formatMoney(total, currency) },
        {
          label: "Transactions",
          value: String(dash?.transactionCount ?? 0),
          tone: "secondary",
        },
      ]}
      footer={
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">{formatMonthLabel(month)}</p>
            <ComparisonHint changePercent={insights?.changePercent} inverted />
          </div>
          {dash?.weeklyTrend?.length ? (
            <MiniSpendingSparkline daily={dash.weeklyTrend} />
          ) : null}
        </div>
      }
    />
  );
}

function WealthSummaryCard({
  overview,
  loading,
  error,
  onRetry,
}: {
  overview?: WealthOverview;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <DashboardWidget error={error} onRetry={onRetry} errorTitle="Wealth unavailable" />
    );
  }

  if (loading && !overview) {
    return (
      <div className="metric-panel p-5">
        <RowsSkeleton rows={2} />
      </div>
    );
  }

  const noData =
    !overview ||
    overview.dataStatus === "no_connection" ||
    overview.dataStatus === "no_data";

  return (
    <ModuleSummaryCard
      title="Wealth"
      to="/wealth"
      accent="secondary"
      metrics={
        noData
          ? [
              { label: "Net worth", value: "—" },
              { label: "Status", value: "Unavailable", tone: "muted" },
            ]
          : [
              {
                label: "Portfolio",
                value: formatMoney(overview.currentValueMinor, overview.currency),
              },
              {
                label: "P&L",
                value: formatPnlPercent(overview.pnlPercentage),
                tone: pnlTone(overview.totalPnlMinor),
              },
            ]
      }
    />
  );
}

function DevicesSummaryCard({
  metrics,
  loading,
  error,
  onRetry,
}: {
  metrics: DeviceDashboardMetrics | null;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <DashboardWidget error={error} onRetry={onRetry} errorTitle="Devices unavailable" />
    );
  }

  if (loading && !metrics) {
    return (
      <div className="metric-panel p-5">
        <RowsSkeleton rows={2} />
      </div>
    );
  }

  return (
    <ModuleSummaryCard
      title="Device awareness"
      to="/devices"
      accent="info"
      metrics={
        metrics
          ? [
              { label: "Total", value: String(metrics.total) },
              { label: "Online", value: String(metrics.online), tone: "success" },
              { label: "Offline", value: String(metrics.offline), tone: "muted" },
              ...(metrics.onCall > 0
                ? [{ label: "On call", value: String(metrics.onCall), tone: "warning" as const }]
                : []),
            ]
          : [
              { label: "Total", value: "0" },
              { label: "Online", value: "0" },
            ]
      }
    />
  );
}

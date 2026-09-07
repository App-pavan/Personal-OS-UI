import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { InsightPanel } from "@/components/future";
import { useUniversalEditor } from "@/components/editor/create-surface";
import { useAuth } from "@/features/auth/auth-context";
import { useCan } from "@/features/capabilities/can";
import { currentMonthKey } from "@/features/expenses/lib/budget-utils";
import { collapseSmsDuplicates, resolveCanonicalTransactionId } from "@/features/expenses/lib/sms-duplicate-matcher";
import { CreateTransactionFlow } from "@/features/expenses/components/create-transaction";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import { buildAllDeviceItems } from "@/features/device-awareness/lib/presence-utils";
import { buildActivityFeed } from "../lib/build-activity-feed";
import { selectFocusQueue } from "../lib/focus-queue";
import { computeTaskDashboardMetrics } from "../lib/task-metrics";
import { dashboardQuote } from "../lib/dashboard-demo-data";
import { CommandCenterHeader } from "./command-center-header";
import { ModuleSummaryRow } from "./module-summary-row";
import { FocusQueueCard } from "./focus-queue-card";
import { DashboardRecentTransactions } from "./dashboard-recent-transactions";
import { SystemStatusCard } from "./system-status-card";
import { QuickActionsCard } from "./quick-actions-card";
import { RecentActivityCard } from "./recent-activity-card";
import { YourDevicesCard } from "./your-devices-card";
import { useTaskMutations, useTasks } from "@/hooks/use-tasks";
import {
  useCategories,
  useExpenseDashboard,
  useMembers,
  useMonthlyInsights,
  useTransaction,
  useTransactionMutations,
  useMemberMutations,
} from "@/hooks/use-expenses";
import { useWealthOverview } from "@/hooks/use-wealth";
import { useOwnDevices, useFamilyDevices } from "@/hooks/use-device-awareness";
import { PERM } from "@/lib/permissions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CommandCenterPage() {
  const { user } = useAuth();
  const { can } = useCan();
  const editor = useUniversalEditor();
  const navigate = useNavigate();
  const month = currentMonthKey();

  const showTasks = can(PERM.TASKS_VIEW);
  const showExpenses = can(PERM.EXPENSES_TRANSACTIONS_VIEW);
  const showWealth = can(PERM.WEALTH_PORTFOLIO_VIEW);
  const showDevices = can(PERM.DEVICE_AWARENESS_DEVICES_VIEW);

  const tasks = useTasks({ perPage: 100 }, { enabled: showTasks });
  const taskMutations = useTaskMutations();

  const expenseDashboard = useExpenseDashboard(month);
  const expenseInsights = useMonthlyInsights(month, { enabled: showExpenses });
  const categories = useCategories();
  const members = useMembers();
  const transactionMutations = useTransactionMutations();
  const memberMutations = useMemberMutations();

  const wealth = useWealthOverview();
  const ownDevices = useOwnDevices({ enabled: showDevices });
  const familyDevices = useFamilyDevices({ enabled: showDevices });

  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);
  const txDetail = useTransaction(selectedTxId);

  const taskItems = useMemo(() => tasks.data?.items ?? [], [tasks.data]);
  const taskMetrics = useMemo(
    () => (taskItems.length || !tasks.isLoading ? computeTaskDashboardMetrics(taskItems) : null),
    [taskItems, tasks.isLoading],
  );
  const focusTasks = useMemo(() => selectFocusQueue(taskItems), [taskItems]);

  const expenseDash = expenseDashboard.data;
  const recentTransactions = useMemo(
    () => collapseSmsDuplicates(expenseDash?.recentTransactions ?? []).slice(0, 5),
    [expenseDash?.recentTransactions],
  );

  const deviceItems = useMemo(() => {
    if (!showDevices) return [];
    return buildAllDeviceItems(
      ownDevices.data ?? [],
      familyDevices.data?.owners ?? [],
      user?.id,
    );
  }, [showDevices, ownDevices.data, familyDevices.data, user?.id]);

  const activityItems = useMemo(
    () =>
      buildActivityFeed({
        tasks: taskItems.slice(0, 30),
        transactions: recentTransactions,
        categories: categories.data ?? [],
        wealth: wealth.data,
      }),
    [taskItems, recentTransactions, categories.data, wealth.data],
  );

  const devicesLoading = ownDevices.isLoading || familyDevices.isLoading;
  const devicesError = ownDevices.error ?? familyDevices.error;

  const hasAnyWidget = showTasks || showExpenses || showWealth || showDevices;

  return (
    <div className="dashboard-command-center mx-auto w-full max-w-[1500px]">
      <CommandCenterHeader userName={user?.name} />

      <ModuleSummaryRow
        month={month}
        taskMetrics={showTasks ? taskMetrics : null}
        tasksLoading={tasks.isLoading}
        expenseDash={expenseDash}
        expenseInsights={expenseInsights.data}
        expensesLoading={expenseDashboard.isLoading}
        expensesError={expenseDashboard.error}
        onExpensesRetry={() => void expenseDashboard.refetch()}
        wealth={wealth.data}
        wealthLoading={wealth.isLoading}
        wealthError={wealth.error}
        onWealthRetry={() => void wealth.refetch()}
        deviceItems={deviceItems}
        devicesLoading={devicesLoading}
        devicesError={devicesError}
        onDevicesRetry={() => {
          void ownDevices.refetch();
          void familyDevices.refetch();
        }}
        onAddTask={() => editor.create("task")}
        onAddExpense={() => setCreateExpenseOpen(true)}
      />

      {hasAnyWidget ? (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-12">
            {showTasks ? (
              <div className="lg:col-span-7">
                <FocusQueueCard
                  tasks={focusTasks}
                  loading={tasks.isLoading}
                  error={tasks.error}
                  onRetry={() => void tasks.refetch()}
                  onComplete={(id) => taskMutations.complete.mutate([id])}
                  completing={taskMutations.complete.isPending}
                />
              </div>
            ) : null}

            {showExpenses ? (
              <div className={showTasks ? "lg:col-span-5" : "lg:col-span-12"}>
                <DashboardRecentTransactions
                  transactions={recentTransactions}
                  categories={categories.data ?? []}
                  month={month}
                  loading={expenseDashboard.isLoading}
                  error={expenseDashboard.error}
                  onRetry={() => void expenseDashboard.refetch()}
                  onSelect={(id) =>
                    setSelectedTxId(
                      resolveCanonicalTransactionId(id, expenseDash?.recentTransactions ?? []),
                    )
                  }
                />
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SystemStatusCard />
            <QuickActionsCard
              onAddTask={() => editor.create("task")}
              onAddExpense={() => setCreateExpenseOpen(true)}
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <RecentActivityCard
                items={activityItems}
                loading={
                  (showTasks && tasks.isLoading) ||
                  (showExpenses && expenseDashboard.isLoading)
                }
              />
            </div>
            {showDevices ? (
              <div className="lg:col-span-6">
                <YourDevicesCard
                  items={deviceItems}
                  loading={devicesLoading}
                  error={devicesError}
                  onRetry={() => {
                    void ownDevices.refetch();
                    void familyDevices.refetch();
                  }}
                  onSelectDevice={() => void navigate({ to: "/devices" })}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <InsightPanel signal="Personal OS tip" kind="neutral">
              {dashboardQuote()}
            </InsightPanel>
          </div>
        </>
      ) : (
        <div className="mt-8 surface-raised p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Your workspace is configured for what you can access. Use the navigation to get started.
          </p>
        </div>
      )}

      <TransactionDetail
        transaction={txDetail.data ?? null}
        categories={categories.data ?? []}
        members={members.data ?? []}
        open={Boolean(selectedTxId)}
        onOpenChange={(open) => !open && setSelectedTxId(null)}
        onUpdate={(input) =>
          selectedTxId &&
          transactionMutations.update.mutate(
            { id: selectedTxId, input },
            { onSuccess: () => setSelectedTxId(null) },
          )
        }
        onPatch={(input) => selectedTxId && transactionMutations.update.mutate({ id: selectedTxId, input })}
        onIgnore={(id) => transactionMutations.ignore.mutate(id)}
        onUnignore={(id) => transactionMutations.unignore.mutate(id)}
        onArchive={(id) => {
          transactionMutations.remove.mutate(id);
          setSelectedTxId(null);
        }}
        updating={transactionMutations.update.isPending}
      />

      <Sheet open={createExpenseOpen} onOpenChange={setCreateExpenseOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>New transaction</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CreateTransactionFlow
              categories={categories.data ?? []}
              members={members.data ?? []}
              {...(transactionMutations.create.isPending ? { creating: true } : {})}
              {...(memberMutations.create.isPending ? { creatingMember: true } : {})}
              onCreateMember={(name) => memberMutations.create.mutate({ name })}
              onCreate={(input) =>
                transactionMutations.create.mutate(input, {
                  onSuccess: () => setCreateExpenseOpen(false),
                })
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

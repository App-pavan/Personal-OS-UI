import { createFileRoute } from "@tanstack/react-router";
import { Lock, Plus, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState } from "@/components/os/state-views";
import { BudgetMonthSelector } from "@/features/expenses/components/budget-month-selector";
import { BudgetProgressBar } from "@/features/expenses/components/budget-progress-bar";
import { CategoryBudgetCard } from "@/features/expenses/components/category-budget-card";
import { CreateCategoryDialog } from "@/features/expenses/components/create-category-dialog";
import { GlassBadge, GlassButton, GlassCard, GlassInput } from "@/features/expenses/components/glass";
import {
  budgetHealthLabel,
  budgetStatusTone,
  currentMonthKey,
  formatMonthLabel,
  isMonthEditable,
} from "@/features/expenses/lib/budget-utils";
import {
  useBudgetMutations,
  useBudgetSummary,
  useBudgets,
  useCategories,
} from "@/hooks/use-expenses";
import { formatMoney, inputToMinor, minorToInput } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/budgets")({
  head: () => ({ meta: [{ title: "Budgets — Personal OS" }] }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const [month, setMonth] = useState(currentMonthKey());
  const [editMode, setEditMode] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [totalInput, setTotalInput] = useState("");
  const [limits, setLimits] = useState<Record<string, string>>({});

  const budgets = useBudgets();
  const categories = useCategories();
  const budget = useMemo(
    () => (budgets.data ?? []).find((b) => b.month === month),
    [budgets.data, month],
  );
  const summary = useBudgetSummary(budget?.id ?? null);
  const mutations = useBudgetMutations();

  const editable = summary.data?.editable ?? isMonthEditable(month);
  const locked = summary.data?.locked ?? !editable;

  useEffect(() => {
    setEditMode(false);
    setTotalInput("");
    setLimits({});
  }, [month]);

  useEffect(() => {
    if (!editMode || !budget) return;
    setTotalInput(minorToInput(budget.totalAmountMinor));
    const next: Record<string, string> = {};
    for (const cl of budget.categoryLimits) {
      next[cl.categoryId] = minorToInput(cl.limitMinor);
    }
    setLimits(next);
  }, [editMode, budget]);

  const categoryRows = useMemo(() => {
    const fromSummary = summary.data?.categoryBudgets ?? [];
    const summaryIds = new Set(fromSummary.map((r) => r.categoryId));
    const extras = (categories.data ?? [])
      .filter((c) => !summaryIds.has(c.id))
      .map((c) => ({
        categoryId: c.id,
        categoryName: c.name,
        limitMinor: 0,
        spentMinor: 0,
        remainingMinor: 0,
        usagePercent: 0,
        status: "SAFE" as const,
      }));
    return [...fromSummary, ...extras];
  }, [summary.data?.categoryBudgets, categories.data]);

  const allocatedMinor =
    summary.data?.allocatedMinor ??
    Object.values(limits)
      .map((v) => inputToMinor(v) ?? 0)
      .reduce((a, b) => a + b, 0);
  const totalMinor = budget?.totalAmountMinor ?? inputToMinor(totalInput) ?? 0;
  const unallocatedMinor = summary.data?.unallocatedMinor ?? Math.max(0, totalMinor - allocatedMinor);
  const overAllocationMinor =
    summary.data?.overAllocationMinor ?? Math.max(0, allocatedMinor - totalMinor);

  const onSave = async () => {
    const totalAmountMinor = inputToMinor(totalInput) ?? 0;
    const categoryLimits = Object.entries(limits)
      .map(([categoryId, value]) => ({
        categoryId,
        limitMinor: inputToMinor(value) ?? 0,
      }))
      .filter((l) => l.limitMinor > 0);

    if (budget) {
      await mutations.update.mutateAsync({
        id: budget.id,
        input: { totalAmountMinor, categoryLimits },
      });
    } else {
      await mutations.create.mutateAsync({
        month,
        totalAmountMinor,
        categoryLimits,
      });
    }
    setEditMode(false);
  };

  const loading = budgets.isLoading || (budget && summary.isLoading);

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Monthly budget"
        description={`Plan and track spending for ${formatMonthLabel(month)}`}
        actions={<BudgetMonthSelector month={month} onChange={setMonth} />}
      />

      {budgets.isError ? (
        <ErrorState error={budgets.error} onRetry={() => budgets.refetch()} title="Couldn't load budgets" />
      ) : loading ? (
        <BudgetSkeleton />
      ) : locked && !budget ? (
        <EmptyState
          title="No budget for this month"
          message="This month has ended. Historical budgets cannot be created from the app."
        />
      ) : !budget && !editMode ? (
        <EmptyState
          title="No budget yet"
          message="Set your monthly budget to start understanding your spending — even mid-month."
          actionLabel="Create budget"
          onAction={() => setEditMode(true)}
        />
      ) : (
        <div className="space-y-6">
          {locked ? (
            <GlassCard className="border-hairline/60 bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="size-4" />
                <span>
                  <strong className="text-foreground">{formatMonthLabel(month)}</strong> — Budget
                  locked. This month&apos;s budget can no longer be modified.
                </span>
              </div>
            </GlassCard>
          ) : null}

          {summary.data ? (
            <GlassCard glow className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10" />
              <div className="relative grid gap-6 md:grid-cols-4">
                <HeroMetric
                  label="Monthly budget"
                  value={formatMoney(summary.data.budget.totalAmountMinor, summary.data.budget.currency)}
                />
                <HeroMetric
                  label="Spent so far"
                  value={formatMoney(summary.data.spentMinor, summary.data.budget.currency)}
                />
                <HeroMetric
                  label="Remaining"
                  value={formatMoney(summary.data.remainingMinor, summary.data.budget.currency)}
                />
                <HeroMetric label="Used" value={`${summary.data.usagePercent.toFixed(1)}%`} />
              </div>
              <BudgetProgressBar
                percent={summary.data.usagePercent}
                status={summary.data.status}
                className="relative mt-6"
              />
              <div className="relative mt-3 flex flex-wrap items-center gap-2">
                <GlassBadge tone="muted">{budgetHealthLabel(summary.data.status)}</GlassBadge>
                <span className={cn("text-xs", budgetStatusTone(summary.data.status))}>
                  {summary.data.transactionCount} managed transactions counted
                </span>
              </div>
            </GlassCard>
          ) : editMode ? (
            <GlassCard>
              <label className="label-eyebrow">Monthly budget</label>
              <GlassInput
                className="mt-2 font-mono text-lg"
                placeholder="30000"
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Mid-month budgets use the full month window. Spent so far updates as transactions are
                managed.
              </p>
            </GlassCard>
          ) : null}

          {(summary.data || editMode) && (
            <GlassCard>
              <p className="label-eyebrow">Allocation</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <AllocationTile label="Monthly budget" value={formatMoney(totalMinor)} />
                <AllocationTile label="Allocated to categories" value={formatMoney(allocatedMinor)} />
                <AllocationTile
                  label={overAllocationMinor > 0 ? "Over-allocated" : "Unallocated"}
                  value={formatMoney(overAllocationMinor > 0 ? overAllocationMinor : unallocatedMinor)}
                  warn={overAllocationMinor > 0}
                />
              </div>
              {overAllocationMinor > 0 ? (
                <p className="mt-3 text-sm text-warning">
                  Category budgets exceed monthly budget by {formatMoney(overAllocationMinor)}.
                </p>
              ) : null}
            </GlassCard>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label-eyebrow">Category budgets</p>
            {editable && editMode ? (
              <GlassButton type="button" variant="ghost" onClick={() => setShowCreateCategory(true)}>
                <Plus className="size-4" /> Add category
              </GlassButton>
            ) : editable && budget ? (
              <GlassButton type="button" variant="ghost" onClick={() => setEditMode(true)}>
                <Pencil className="size-4" /> Edit budget
              </GlassButton>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoryRows.map((row) => (
              <CategoryBudgetCard
                key={row.categoryId}
                categoryName={row.categoryName}
                limitMinor={row.limitMinor}
                spentMinor={row.spentMinor}
                remainingMinor={row.remainingMinor}
                usagePercent={row.usagePercent}
                status={row.status}
                currency={summary.data?.budget.currency ?? "INR"}
                editable={editable && editMode}
                limitInput={limits[row.categoryId]}
                onLimitChange={(v) => setLimits((prev) => ({ ...prev, [row.categoryId]: v }))}
              />
            ))}
          </div>

          {editable && editMode ? (
            <div className="flex gap-2">
              <GlassButton
                onClick={onSave}
                disabled={mutations.create.isPending || mutations.update.isPending}
              >
                Save changes
              </GlassButton>
              <GlassButton type="button" variant="ghost" onClick={() => setEditMode(false)}>
                Cancel
              </GlassButton>
            </div>
          ) : null}
        </div>
      )}

      <CreateCategoryDialog
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCreated={(id) => setLimits((prev) => ({ ...prev, [id]: prev[id] ?? "" }))}
      />
    </>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-eyebrow">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function AllocationTile({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline/50 bg-background/30 px-4 py-3",
        warn && "border-warning/40 bg-warning/5",
      )}
    >
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums">{value}</p>
    </div>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="glass-panel h-40 rounded-2xl bg-muted/30" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel h-32 rounded-xl bg-muted/20" />
        <div className="glass-panel h-32 rounded-xl bg-muted/20" />
        <div className="glass-panel h-32 rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}

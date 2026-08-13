import { createFileRoute } from "@tanstack/react-router";
import { Lock, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { ErrorState } from "@/components/os/state-views";
import { BudgetEditorModal } from "@/features/expenses/components/budget-editor-modal";
import { BudgetEmptyState } from "@/features/expenses/components/budget-empty-state";
import { BudgetMonthSelector } from "@/features/expenses/components/budget-month-selector";
import { BudgetProgressBar } from "@/features/expenses/components/budget-progress-bar";
import { CategoryBudgetCard } from "@/features/expenses/components/category-budget-card";
import { GlassBadge, GlassButton, GlassCard } from "@/features/expenses/components/glass";
import {
  budgetBadgeTone,
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
import { formatMoney, minorToInput } from "@/lib/money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/expenses/budgets")({
  head: () => ({ meta: [{ title: "Budgets — Personal OS" }] }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const [month, setMonth] = useState(currentMonthKey());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");

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
    setEditorOpen(false);
  }, [month]);

  const categoryIconById = useMemo(() => {
    const map = new Map<string, string | undefined>();
    for (const c of categories.data ?? []) {
      map.set(c.id, c.icon);
    }
    return map;
  }, [categories.data]);

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

  const initialLimits = useMemo(() => {
    if (!budget) return {};
    const next: Record<string, string> = {};
    for (const cl of budget.categoryLimits) {
      next[cl.categoryId] = minorToInput(cl.limitMinor);
    }
    return next;
  }, [budget]);

  const allocatedMinor = summary.data?.allocatedMinor ?? 0;
  const totalMinor = summary.data?.budget.totalAmountMinor ?? budget?.totalAmountMinor ?? 0;
  const unallocatedMinor = summary.data?.unallocatedMinor ?? 0;
  const overAllocationMinor = summary.data?.overAllocationMinor ?? 0;

  const openCreate = () => {
    setEditorMode("create");
    setEditorOpen(true);
  };

  const openEdit = () => {
    setEditorMode("edit");
    setEditorOpen(true);
  };

  const onSave = async (payload: {
    totalAmountMinor: number;
    categoryLimits: { categoryId: string; limitMinor: number }[];
  }) => {
    if (budget) {
      await mutations.update.mutateAsync({
        id: budget.id,
        input: payload,
      });
    } else {
      await mutations.create.mutateAsync({
        month,
        ...payload,
      });
    }
    setEditorOpen(false);
  };

  const loading = budgets.isLoading || (budget && summary.isLoading);
  const currency = summary.data?.budget.currency ?? budget?.currency ?? "INR";

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Monthly budget"
        description={`Plan and track spending for ${formatMonthLabel(month)}`}
        actions={<BudgetMonthSelector month={month} onChange={setMonth} />}
      />

      {budgets.isError ? (
        <ErrorState
          error={budgets.error}
          onRetry={() => budgets.refetch()}
          title="Couldn't load budgets"
        />
      ) : loading ? (
        <BudgetSkeleton />
      ) : !budget ? (
        <BudgetEmptyState month={month} locked={locked} onCreate={openCreate} />
      ) : (
        <div className="space-y-6 animate-soft-in">
          {locked ? (
            <GlassCard className="border-hairline bg-[rgb(238_238_238/0.04)]">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="size-4 text-muted-foreground" />
                <span>
                  <strong className="text-foreground">Budget locked</strong> —{" "}
                  {formatMonthLabel(month)} is finalized. Historical budgets cannot be modified.
                </span>
              </div>
            </GlassCard>
          ) : null}

          {summary.data ? (
            <GlassCard glow className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-[rgb(255_95_0/0.04)]" />
              <div className="relative">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {formatMonthLabel(month).toUpperCase()}
                </p>
                <p className="label-eyebrow mt-1">Monthly budget</p>
                <p className="mt-2 font-mono text-4xl font-semibold tabular-nums tracking-tight md:text-5xl">
                  {formatMoney(summary.data.budget.totalAmountMinor, currency)}
                </p>
              </div>
              <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
                <HeroMetric label="Spent" value={formatMoney(summary.data.spentMinor, currency)} />
                <HeroMetric
                  label="Remaining"
                  value={formatMoney(summary.data.remainingMinor, currency)}
                  warn={summary.data.remainingMinor < 0}
                />
                <HeroMetric label="Used" value={`${summary.data.usagePercent.toFixed(1)}%`} />
              </div>
              <BudgetProgressBar
                percent={summary.data.usagePercent}
                status={summary.data.status}
                className="relative mt-6"
              />
              <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <GlassBadge tone={budgetBadgeTone(summary.data.status)}>
                    {budgetHealthLabel(summary.data.status)}
                  </GlassBadge>
                  <span className={cn("text-xs", budgetStatusTone(summary.data.status))}>
                    {summary.data.transactionCount} managed transactions counted
                  </span>
                </div>
                {editable ? (
                  <GlassButton type="button" variant="ghost" onClick={openEdit}>
                    <Pencil className="size-4" /> Edit budget
                  </GlassButton>
                ) : null}
              </div>
            </GlassCard>
          ) : null}

          {summary.data ? (
            <GlassCard>
              <p className="label-eyebrow">Budget allocation</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <AllocationTile label="Total budget" value={formatMoney(totalMinor, currency)} />
                <AllocationTile label="Allocated" value={formatMoney(allocatedMinor, currency)} />
                <AllocationTile
                  label={overAllocationMinor > 0 ? "Over-allocated" : "Unallocated"}
                  value={formatMoney(
                    overAllocationMinor > 0 ? overAllocationMinor : unallocatedMinor,
                    currency,
                  )}
                  warn={overAllocationMinor > 0}
                />
              </div>
              {overAllocationMinor > 0 ? (
                <p className="mt-3 text-sm text-destructive">
                  Category allocation exceeds monthly budget by{" "}
                  {formatMoney(overAllocationMinor, currency)}.
                </p>
              ) : null}
            </GlassCard>
          ) : null}

          {categoryRows.length > 0 ? (
            <>
              <p className="label-eyebrow">Category budgets</p>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryRows.map((row) => (
                  <CategoryBudgetCard
                    key={row.categoryId}
                    categoryName={row.categoryName}
                    categoryIcon={categoryIconById.get(row.categoryId)}
                    limitMinor={row.limitMinor}
                    spentMinor={row.spentMinor}
                    remainingMinor={row.remainingMinor}
                    usagePercent={row.usagePercent}
                    status={row.status}
                    currency={currency}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}

      <BudgetEditorModal
        open={editorOpen && !locked}
        mode={editorMode}
        month={month}
        currency={currency}
        categories={categories.data ?? []}
        initialTotalMinor={budget?.totalAmountMinor ?? 0}
        initialLimits={initialLimits}
        saving={mutations.create.isPending || mutations.update.isPending}
        onClose={() => setEditorOpen(false)}
        onSave={onSave}
      />
    </>
  );
}

function HeroMetric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-[rgb(238_238_238/0.04)] px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-xl tabular-nums md:text-2xl",
          warn && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AllocationTile({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-hairline bg-[rgb(238_238_238/0.04)] px-4 py-3",
        warn && "border-destructive/30 bg-destructive/5",
      )}
    >
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-lg tabular-nums", warn && "text-destructive")}>
        {value}
      </p>
    </div>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="glass-panel h-48 rounded-2xl bg-[rgb(238_238_238/0.06)]" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel h-32 rounded-xl bg-[rgb(238_238_238/0.04)]" />
        <div className="glass-panel h-32 rounded-xl bg-[rgb(238_238_238/0.04)]" />
        <div className="glass-panel h-32 rounded-xl bg-[rgb(238_238_238/0.04)]" />
      </div>
    </div>
  );
}

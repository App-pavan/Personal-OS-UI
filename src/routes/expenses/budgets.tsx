import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { ErrorState } from "@/components/os/state-views";
import { GlassButton, GlassCard } from "@/features/expenses/components/glass";
import {
  useBudgetMutations,
  useBudgetSummary,
  useBudgets,
  useCategories,
} from "@/hooks/use-expenses";
import { formatMoney, inputToMinor, minorToInput } from "@/lib/money";

export const Route = createFileRoute("/expenses/budgets")({
  head: () => ({ meta: [{ title: "Budgets — Personal OS" }] }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const budgets = useBudgets();
  const categories = useCategories();
  const budget = useMemo(
    () => (budgets.data ?? []).find((b) => b.month === month),
    [budgets.data, month],
  );
  const summary = useBudgetSummary(budget?.id ?? null);
  const mutations = useBudgetMutations();

  const [totalInput, setTotalInput] = useState("");
  const [limits, setLimits] = useState<Record<string, string>>({});

  const catMap = useMemo(
    () => new Map((categories.data ?? []).map((c) => [c.id, c.name])),
    [categories.data],
  );

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
  };

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Monthly budget"
        description={month}
        actions={
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-hairline/60 bg-background/50 px-3 py-1.5 text-sm"
          />
        }
      />

      {budgets.isError ? (
        <ErrorState error={budgets.error} onRetry={() => budgets.refetch()} title="Couldn't load budgets" />
      ) : (
        <div className="space-y-4">
          {summary.data ? (
            <GlassCard glow>
              <p className="label-eyebrow">Spent this month</p>
              <p className="display-xl font-mono tabular-nums">
                {formatMoney(summary.data.spentMinor, summary.data.budget.currency)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatMoney(summary.data.remainingMinor, summary.data.budget.currency)} remaining ·{" "}
                {summary.data.usagePercent.toFixed(1)}%
              </p>
            </GlassCard>
          ) : null}

          <GlassCard>
            <label className="label-eyebrow">Monthly budget</label>
            <input
              className="mt-2 w-full rounded-lg border border-hairline/60 bg-background/50 px-3 py-2 font-mono"
              placeholder="30000"
              value={totalInput || (budget ? minorToInput(budget.totalAmountMinor) : "")}
              onChange={(e) => setTotalInput(e.target.value)}
            />
          </GlassCard>

          <GlassCard>
            <p className="label-eyebrow mb-3">Category budgets</p>
            <div className="space-y-3">
              {(summary.data?.categoryBudgets ?? []).map((row) => (
                <div key={row.categoryId} className="rounded-lg border border-hairline/40 p-3">
                  <div className="flex justify-between text-sm">
                    <span>{row.categoryName}</span>
                    <span className="font-mono tabular-nums">
                      {formatMoney(row.spentMinor)} / {formatMoney(row.limitMinor)}
                    </span>
                  </div>
                  <input
                    className="mt-2 w-full rounded-md border border-hairline/40 bg-background/40 px-2 py-1 text-sm font-mono"
                    placeholder="Limit"
                    value={limits[row.categoryId] ?? minorToInput(row.limitMinor)}
                    onChange={(e) =>
                      setLimits((prev) => ({ ...prev, [row.categoryId]: e.target.value }))
                    }
                  />
                </div>
              ))}
              {(categories.data ?? [])
                .filter((c) => !(summary.data?.categoryBudgets ?? []).some((r) => r.categoryId === c.id))
                .slice(0, 3)
                .map((c) => (
                  <div key={c.id} className="rounded-lg border border-dashed border-hairline/40 p-3">
                    <span className="text-sm">{catMap.get(c.id) ?? c.name}</span>
                    <input
                      className="mt-2 w-full rounded-md border border-hairline/40 bg-background/40 px-2 py-1 text-sm font-mono"
                      placeholder="Add limit"
                      value={limits[c.id] ?? ""}
                      onChange={(e) => setLimits((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    />
                  </div>
                ))}
            </div>
          </GlassCard>

          <GlassButton onClick={onSave} disabled={mutations.create.isPending || mutations.update.isPending}>
            Save budget
          </GlassButton>
        </div>
      )}
    </>
  );
}

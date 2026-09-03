import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { IconBadge } from "@/components/future";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState, Skeleton } from "@/components/os/state-views";
import { getCategoryMeta } from "@/features/expenses/lib/category-meta";
import { GlassBadge, GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { useExpenseMonth } from "@/features/expenses/expense-month-context";
import { formatMonthLabel } from "@/features/expenses/lib/budget-utils";
import { navAccentStyle } from "@/lib/design/semantic";
import { useCategories, useCategoryInsights, useCategoryMutations } from "@/hooks/use-expenses";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/expenses/categories")({
  head: () => ({ meta: [{ title: "Categories — Personal OS" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { month } = useExpenseMonth();
  const cats = useCategories();
  const insights = useCategoryInsights(month);
  const m = useCategoryMutations();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const items = (cats.data ?? []).filter((c) => !c.archived);
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of insights.data ?? []) {
      map.set(row.categoryId, row.amountMinor);
    }
    return map;
  }, [insights.data]);

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Categories"
        description={`How you organise spending — ${formatMonthLabel(month)}`}
        actions={
          <GlassButton onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Create category
          </GlassButton>
        }
      />

      {creating && (
        <form
          className="glass-panel flex flex-wrap gap-2 rounded-xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) return;
            m.create.mutate(
              { name: trimmed },
              {
                onSuccess: () => {
                  setName("");
                  setCreating(false);
                },
              },
            );
          }}
        >
          <GlassInput
            autoFocus
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[200px] flex-1"
          />
          <GlassButton type="submit" disabled={m.create.isPending || !name.trim()}>
            Save
          </GlassButton>
          <GlassButton type="button" variant="ghost" onClick={() => setCreating(false)}>
            Cancel
          </GlassButton>
        </form>
      )}

      {cats.isError ? (
        <ErrorState error={cats.error} onRetry={() => cats.refetch()} />
      ) : cats.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No categories yet"
          line="Categories seed automatically when you first connect. Create custom ones anytime."
          action={<GlassButton onClick={() => setCreating(true)}>Create category</GlassButton>}
          tone="orange"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cat) => {
            const meta = getCategoryMeta(cat.name, cat.id);
            const spentMinor = spentByCategory.get(cat.id);
            return (
              <div
                key={cat.id}
                className="glass-panel card-accent-top rounded-xl border border-hairline/60 p-4 transition hover:shadow-[var(--glow-primary)]"
                style={navAccentStyle(meta.tone)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    {cat.icon ? (
                      <span className="text-xl">{cat.icon}</span>
                    ) : (
                      <IconBadge icon={meta.icon} tone={meta.tone} size="sm" />
                    )}
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      {spentMinor != null && spentMinor > 0 ? (
                        <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
                          {formatMoney(spentMinor, "INR")} this month
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {cat.color ? (
                    <span
                      className="size-3 rounded-full shadow-[var(--glow-primary)]"
                      style={{ background: cat.color }}
                    />
                  ) : (
                    <GlassBadge tone="success" dot>
                      Active
                    </GlassBadge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

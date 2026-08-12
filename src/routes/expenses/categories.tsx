import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState, Skeleton } from "@/components/os/state-views";
import { GlassBadge, GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { useCategories, useCategoryMutations } from "@/hooks/use-expenses";

export const Route = createFileRoute("/expenses/categories")({
  head: () => ({ meta: [{ title: "Categories — Personal OS" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const cats = useCategories();
  const m = useCategoryMutations();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const items = (cats.data ?? []).filter((c) => !c.archived);

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Categories"
        description="How you organise spending."
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
            m.create.mutate({ name: trimmed }, { onSuccess: () => { setName(""); setCreating(false); } });
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
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((cat) => (
            <div
              key={cat.id}
              className="glass-panel rounded-xl border border-hairline/60 p-4 transition hover:border-primary/25"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  {cat.icon ? <span className="text-xl">{cat.icon}</span> : null}
                  <p className="mt-1 font-medium">{cat.name}</p>
                </div>
                {cat.color ? (
                  <span className="size-3 rounded-full" style={{ background: cat.color }} />
                ) : (
                  <GlassBadge tone="muted">Active</GlassBadge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

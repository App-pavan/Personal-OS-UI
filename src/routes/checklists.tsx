import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Copy, ListChecks, Plus, RotateCcw, Star, UserRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Meter, Pill } from "@/components/os/primitives";
import {
  useChecklistInstance,
  useChecklistInstances,
  useChecklistMutations,
  useChecklistTemplates,
} from "@/hooks/use-checklists";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { useAuth } from "@/features/auth/auth-context";
import type { ChecklistInstanceItem } from "@/lib/api/types";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { title: "Checklists — Personal OS" },
      {
        name: "description",
        content:
          "Reusable checklist templates and live runs: packing, leaving home, maintenance and shopping routines.",
      },
      { property: "og:title", content: "Checklists — Personal OS" },
      { property: "og:description", content: "Routines you can run, not lists you rewrite." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const { user } = useAuth();
  const templates = useChecklistTemplates();
  const instances = useChecklistInstances();
  const m = useChecklistMutations();

  const active = useMemo(
    () => (instances.data ?? []).filter((i) => i.status === "active"),
    [instances.data],
  );
  const [runId, setRunId] = useState<string | null>(null);
  const currentRunId = runId ?? active[0]?.id ?? null;
  const run = useChecklistInstance(currentRunId);

  const [startFor, setStartFor] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");

  const [newName, setNewName] = useState("");

  // Assignees come from real data only — the owner plus anyone already
  // assigned on this run. There is no directory API yet.
  const assignees = useMemo(() => {
    const names = new Set<string>();
    if (user?.name) names.add(user.name);
    for (const item of run.data?.items ?? []) if (item.assigneeName) names.add(item.assigneeName);
    return [...names];
  }, [run.data, user?.name]);

  const grouped = useMemo(() => {
    const items = run.data?.items ?? [];
    const map = new Map<string, ChecklistInstanceItem[]>();
    for (const item of [...items].sort((a, b) => a.position - b.position)) {
      const key = item.category ?? "General";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [run.data]);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="animate-rise max-w-2xl">
        <p className="label-eyebrow">Checklists</p>
        <h1 className="display-lg mt-3">
          {active.length
            ? `${active.length} routine${active.length > 1 ? "s" : ""} running right now.`
            : "Nothing is running. Start a routine when you need it."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Templates are the routines you keep. Runs are the times you actually did them.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
        {/* ---------------- library ---------------- */}
        <section className="animate-rise" style={{ animationDelay: "80ms" }}>
          {instances.isLoading ? (
            <RowsSkeleton rows={2} />
          ) : instances.isError ? (
            <ErrorState
              error={instances.error}
              title="Unable to load your running checklists."
              onRetry={() => void instances.refetch()}
            />
          ) : active.length ? (
            <>
              <p className="label-eyebrow">Running</p>
              <div className="hairline-list mt-2 border-t border-hairline">
                {active.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setRunId(i.id)}
                    className={cn(
                      "row-quiet flex w-full items-center gap-3 py-3 text-left",
                      currentRunId === i.id && "bg-muted/60",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{i.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {i.templateName}
                        {i.destination ? ` · ${i.destination}` : ""} · {i.completedCount}/{i.itemCount}
                      </span>
                      <Meter value={(i.completedCount / Math.max(1, i.itemCount)) * 100} className="mt-2" />
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
            <p className="label-eyebrow">Template library</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = newName.trim();
                if (!name) return;
                m.createTemplate.mutate(
                  { name, category: "personal" },
                  {
                    onSuccess: () => {
                      setNewName("");
                      toast.success("Checklist created", { description: name });
                    },
                  },
                );
              }}
              className="flex items-center gap-2"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New checklist name"
                aria-label="New checklist name"
                className="h-9 w-44 rounded-md border border-hairline bg-transparent px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button
                type="submit"
                disabled={m.createTemplate.isPending}
                className="gradient-primary h-9 rounded-md px-3 text-xs font-semibold text-primary-foreground disabled:opacity-70"
              >
                <Plus className="mr-1 inline size-3.5" />
                Create
              </button>
            </form>
          </div>
          {templates.isLoading ? (
            <RowsSkeleton rows={4} />
          ) : templates.isError ? (
            <ErrorState
              error={templates.error}
              title="Unable to load your checklists."
              onRetry={() => void templates.refetch()}
            />
          ) : !(templates.data ?? []).filter((t) => !t.archived).length ? (
            <EmptyState
              title="No reusable checklists yet."
              line="Create your first checklist for trips, routines or anything you repeat."
            />
          ) : (
          <div className="hairline-list mt-2 border-t border-hairline">
            {(templates.data ?? [])
              .filter((t) => !t.archived)
              .map((t) => (
                <div key={t.id} className="py-3.5">
                  <div className="flex items-start gap-3">
                    <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">{t.name}</p>
                        {t.favorite ? <Star className="size-3 fill-accent text-accent" /> : null}
                        <Pill>{t.category}</Pill>
                      </div>
                      {t.description ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {t.description}
                        </p>
                      ) : null}
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t.itemCount} items · {t.requiredItemCount} required · used {t.usageCount}×
                        {t.estimatedMinutes ? ` · ~${t.estimatedMinutes} min` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => m.duplicateTemplate.mutate(t.id, { onSuccess: () => toast.success("Template duplicated") })}
                        aria-label={`Duplicate ${t.name}`}
                        className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted/70"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setStartFor(t.id);
                          setName(t.name);
                          setDestination("");
                        }}
                        className="gradient-primary rounded-md px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition active:scale-95"
                      >
                        Start
                      </button>
                    </div>
                  </div>

                  {startFor === t.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        m.start.mutate(
                          {
                            templateId: t.id,
                            name: name.trim() || t.name,
                            ...(destination.trim() ? { destination: destination.trim() } : {}),
                          },
                          {
                            onSuccess: (created) => {
                              setRunId(created.id);
                              setStartFor(null);
                              toast.success("Checklist started", { description: created.name });
                            },
                          },
                        );
                      }}
                      className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Run name"
                        aria-label="Run name"
                        className="h-9 rounded-md border border-hairline bg-transparent px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                      />
                      <input
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Destination (optional)"
                        aria-label="Destination"
                        className="h-9 rounded-md border border-hairline bg-transparent px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                      />
                      <button
                        type="submit"
                        className="gradient-primary h-9 rounded-md px-3 text-xs font-medium text-primary-foreground"
                      >
                        <Plus className="mr-1 inline size-3.5" />
                        Create run
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
          </div>
          )}
        </section>

        {/* ---------------- runner ---------------- */}
        {run.data ? (
          <aside key={run.data.id} className="animate-rise surface-card sticky top-24 h-fit p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label-eyebrow">{run.data.templateName} · v{run.data.templateVersion}</p>
                <h2 className="mt-2 truncate text-lg font-medium">{run.data.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {run.data.destination ? `${run.data.destination} · ` : ""}
                  {run.data.completedCount}/{run.data.itemCount} done · required{" "}
                  {run.data.requiredCompletedCount}/{run.data.requiredCount}
                </p>
              </div>
              <Pill tone={run.data.status === "active" ? "primary" : "muted"}>{run.data.status}</Pill>
            </div>

            <Meter
              value={(run.data.completedCount / Math.max(1, run.data.itemCount)) * 100}
              className="mt-4"
            />

            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => m.checkAllRequired.mutate(run.data!.id)}
                className="gradient-primary rounded-md px-2.5 py-1.5 font-semibold text-primary-foreground transition active:scale-95"
              >
                Check all required
              </button>
              <button
                onClick={() => m.uncheckAll.mutate(run.data!.id)}
                className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
              >
                Uncheck all
              </button>
              <button
                onClick={() => m.reset.mutate(run.data!.id)}
                className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
              >
                <RotateCcw className="mr-1 inline size-3" />
                Reset
              </button>
              <button
                onClick={() =>
                  m.complete.mutate(run.data!.id, { onSuccess: () => toast.success("Checklist completed") })
                }
                className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
              >
                Complete
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <p className="label-eyebrow">{category}</p>
                  <div className="mt-1.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 py-2">
                        <button
                          onClick={() => m.toggleItem.mutate({ id: run.data!.id, itemId: item.id })}
                          role="checkbox"
                          aria-checked={item.completed}
                          aria-label={`Check ${item.title}`}
                          className={cn(
                            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition active:scale-95",
                            item.completed
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-input text-transparent hover:border-primary hover:text-primary",
                          )}
                        >
                          <Check className="size-3.5" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-sm", item.completed && "text-muted-foreground line-through")}>
                            {item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} ` : ""}
                            {item.title}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            <span>{item.required ? "Required" : "Optional"}</span>
                            {item.assigneeName ? (
                              <span className="flex items-center gap-1">
                                <UserRound className="size-3" />
                                {item.assigneeName}
                              </span>
                            ) : null}
                            {item.linkedTaskId ? <span className="text-primary">Task linked</span> : null}
                            {item.completedByName ? <span>· by {item.completedByName}</span> : null}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <select
                            aria-label={`Assign ${item.title}`}
                            value={item.assigneeName ?? ""}
                            onChange={(e) =>
                              m.assignItem.mutate({
                                id: run.data!.id,
                                itemId: item.id,
                                assigneeName: e.target.value,
                              })
                            }
                            className="h-7 rounded-md border border-hairline bg-transparent px-1 text-xs text-muted-foreground"
                          >
                            <option value="">—</option>
                            {assignees.map((p: string) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          {!item.linkedTaskId ? (
                            <button
                              onClick={() =>
                                m.convertItemToTask.mutate(
                                  { id: run.data!.id, itemId: item.id },
                                  { onSuccess: () => toast.success("Task created from item") },
                                )
                              }
                              className="rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted/70"
                            >
                              Create task
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="label-eyebrow">History</p>
              <div className="mt-2 space-y-2">
                {run.data.history.slice(0, 6).map((h) => (
                  <p key={h.id} className="text-xs leading-relaxed text-muted-foreground">
                    <span className="text-foreground/80">
                      {new Date(h.createdAt).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>{" "}
                    — {h.description}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        ) : run.isLoading && currentRunId ? (
          <aside className="surface-card h-fit p-5">
            <RowsSkeleton rows={5} />
          </aside>
        ) : run.isError ? (
          <aside className="h-fit">
            <ErrorState
              error={run.error}
              title="Unable to load this checklist run."
              onRetry={() => void run.refetch()}
            />
          </aside>
        ) : (
          <aside className="surface-quiet h-fit p-6 text-sm text-muted-foreground">
            Pick a template and start a run to see the checklist runner here.
          </aside>
        )}
      </div>
    </div>
  );
}

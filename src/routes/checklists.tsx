import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronRight,
  ClipboardCheck,
  Copy,
  History,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Meter } from "@/components/os/primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useChecklistInstance,
  useChecklistInstances,
  useChecklistMutations,
  useChecklistTemplates,
} from "@/hooks/use-checklists";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { useAuth } from "@/features/auth/auth-context";
import { useUniversalEditor } from "@/components/editor/create-surface";
import type { ChecklistInstanceItem, ChecklistTemplate } from "@/lib/api/types";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { title: "Checklists — Personal OS" },
      {
        name: "description",
        content:
          "Reusable checklists you can start in one tap: packing, leaving home, maintenance and shopping routines.",
      },
      { property: "og:title", content: "Checklists — Personal OS" },
      { property: "og:description", content: "Pick a checklist, press Start, tick things off." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChecklistsPage,
});

const relative = (iso?: string) => {
  if (!iso) return null;
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "used today";
  if (days === 1) return "used yesterday";
  if (days < 30) return `used ${days} days ago`;
  return `used ${Math.round(days / 30)} months ago`;
};

function ChecklistsPage() {
  const { user } = useAuth();
  const editor = useUniversalEditor();
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

  const [showArchived, setShowArchived] = useState(false);
  const [detailsFor, setDetailsFor] = useState<ChecklistTemplate | null>(null);

  const library = (templates.data ?? []).filter((t) => (showArchived ? t.archived : !t.archived));

  const start = (t: ChecklistTemplate, name?: string, destination?: string) =>
    m.start.mutate(
      {
        templateId: t.id,
        name: (name ?? t.name).trim() || t.name,
        ...(destination?.trim() ? { destination: destination.trim() } : {}),
      },
      {
        onSuccess: (created) => {
          setDetailsFor(null);
          setRunId(created.id);
          toast.success("Checklist started", { description: created.name });
        },
      },
    );

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="animate-rise grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <p className="label-eyebrow">Checklists</p>
          <h1 className="display-lg mt-3">
            {active.length
              ? `${active.length === 1 ? "One checklist is" : `${active.length} checklists are`} in progress.`
              : "Pick a checklist and press Start."}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Keep the routines you repeat. Start one whenever you need it.
          </p>
        </div>
        <button
          onClick={() => editor.create("checklist")}
          className="gradient-primary flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95"
        >
          <Plus className="size-4" /> Create
        </button>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
        {/* ---------------- library ---------------- */}
        <section className="animate-rise" style={{ animationDelay: "80ms" }}>
          {active.length ? (
            <>
              <p className="label-eyebrow">In progress</p>
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
                        {i.completedCount} of {i.itemCount} done
                        {i.destination ? ` · ${i.destination}` : ""}
                      </span>
                      <Meter
                        value={(i.completedCount / Math.max(1, i.itemCount)) * 100}
                        className="mt-2"
                      />
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <p className="label-eyebrow">{showArchived ? "Archived" : "Your checklists"}</p>
            <button
              onClick={() => setShowArchived((v) => !v)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/70"
            >
              {showArchived ? "Show active" : "Show archived"}
            </button>
          </div>

          {templates.isLoading ? (
            <RowsSkeleton rows={4} />
          ) : templates.isError ? (
            <ErrorState
              error={templates.error}
              title="Unable to load your checklists."
              onRetry={() => void templates.refetch()}
            />
          ) : !library.length ? (
            <EmptyState
              title={showArchived ? "Nothing archived." : "No checklists yet."}
              line={
                showArchived
                  ? "Archived checklists stay here so you can bring them back."
                  : "Create one for trips, mornings, shopping — anything you repeat."
              }
              action={
                showArchived ? undefined : (
                  <button
                    onClick={() => editor.create("checklist")}
                    className="gradient-primary rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Create a checklist
                  </button>
                )
              }
            />
          ) : (
            <div className="hairline-list mt-2 border-t border-hairline">
              {library.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3.5">
                  <ClipboardCheck className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium">{t.name}</p>
                      {t.favorite ? <Star className="size-3 shrink-0 fill-accent text-accent" /> : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t.itemCount} items
                      {t.usageCount ? ` · used ${t.usageCount}×` : ""}
                      {relative(t.lastUsedAt) ? ` · ${relative(t.lastUsedAt)}` : ""}
                    </p>
                  </div>

                  {t.archived ? (
                    <button
                      onClick={() =>
                        m.restoreTemplate.mutate(t.id, { onSuccess: () => toast.success("Restored") })
                      }
                      className="shrink-0 rounded-md border border-hairline px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted/70"
                    >
                      <ArchiveRestore className="mr-1 inline size-3" /> Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => start(t)}
                      disabled={m.start.isPending}
                      className="gradient-primary shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-60"
                    >
                      Start
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label={`More actions for ${t.name}`}
                        className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/70"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl border-hairline">
                      <DropdownMenuItem onSelect={() => editor.edit("checklist", t.id)}>
                        <Pencil className="size-3.5" /> Edit
                      </DropdownMenuItem>
                      {!t.archived ? (
                        <DropdownMenuItem onSelect={() => setDetailsFor(t)}>
                          <ListChecks className="size-3.5" /> Start with details
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        onSelect={() =>
                          m.duplicateTemplate.mutate(t.id, {
                            onSuccess: () => toast.success("Checklist duplicated"),
                          })
                        }
                      >
                        <Copy className="size-3.5" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          m.updateTemplate.mutate({ id: t.id, input: { favorite: !t.favorite } })
                        }
                      >
                        <Star className="size-3.5" /> {t.favorite ? "Remove favorite" : "Favorite"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {t.archived ? (
                        <DropdownMenuItem onSelect={() => m.restoreTemplate.mutate(t.id)}>
                          <ArchiveRestore className="size-3.5" /> Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onSelect={() => {
                            if (!window.confirm(`Archive “${t.name}”? You can restore it later.`)) return;
                            m.archiveTemplate.mutate(t.id, {
                              onSuccess: () => toast.success("Checklist archived"),
                            });
                          }}
                        >
                          <Archive className="size-3.5" /> Archive
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {instances.isError ? (
            <div className="mt-6">
              <ErrorState
                error={instances.error}
                title="Unable to load checklists in progress."
                onRetry={() => void instances.refetch()}
              />
            </div>
          ) : null}
        </section>

        {/* ---------------- runner ---------------- */}
        <section className="lg:sticky lg:top-24 lg:h-fit">
          {run.data ? (
            <Runner
              key={run.data.id}
              run={run.data}
              ownerName={user?.name}
              mutations={m}
              onClose={() => setRunId(null)}
            />
          ) : run.isLoading && currentRunId ? (
            <div className="surface-card p-5">
              <RowsSkeleton rows={5} />
            </div>
          ) : run.isError ? (
            <ErrorState
              error={run.error}
              title="Unable to open this checklist."
              onRetry={() => void run.refetch()}
            />
          ) : (
            <div className="surface-quiet p-6 text-sm text-muted-foreground">
              Press Start on a checklist and it opens right here.
            </div>
          )}
        </section>
      </div>

      {/* optional details — never required before starting */}
      {detailsFor ? (
        <StartDetails template={detailsFor} onCancel={() => setDetailsFor(null)} onStart={start} />
      ) : null}
    </div>
  );
}

/* ---------------- optional start details ---------------- */

function StartDetails({
  template,
  onCancel,
  onStart,
}: {
  template: ChecklistTemplate;
  onCancel: () => void;
  onStart: (t: ChecklistTemplate, name?: string, destination?: string) => void;
}) {
  const [name, setName] = useState(template.name);
  const [destination, setDestination] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-3 backdrop-blur-sm sm:place-items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(template, name, destination);
        }}
        className="surface-raised animate-soft-in w-full max-w-md rounded-xl p-5 shadow-float"
      >
        <p className="label-eyebrow">Optional details</p>
        <h2 className="mt-2 text-base font-medium">Start “{template.name}”</h2>
        <label className="mt-4 block text-xs text-muted-foreground">
          Call this run
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-hairline bg-transparent px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
          />
        </label>
        <label className="mt-3 block text-xs text-muted-foreground">
          Where / what for
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Pune, relatives, weekend trip…"
            className="mt-1.5 h-10 w-full rounded-md border border-hairline bg-transparent px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
          />
        </label>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted/70"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="gradient-primary rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          >
            Start
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- runner ---------------- */

type Mutations = ReturnType<typeof useChecklistMutations>;

function Runner({
  run,
  ownerName,
  mutations: m,
  onClose,
}: {
  run: NonNullable<ReturnType<typeof useChecklistInstance>["data"]>;
  ownerName?: string;
  mutations: Mutations;
  onClose: () => void;
}) {
  const [showHistory, setShowHistory] = useState(false);

  const assignees = useMemo(() => {
    const names = new Set<string>();
    if (ownerName) names.add(ownerName);
    for (const item of run.items) if (item.assigneeName) names.add(item.assigneeName);
    return [...names];
  }, [run.items, ownerName]);

  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistInstanceItem[]>();
    for (const item of [...run.items].sort((a, b) => a.position - b.position)) {
      const key = item.category ?? "Items";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [run.items]);

  const done = run.completedCount === run.itemCount && run.itemCount > 0;

  return (
    <div className="animate-rise surface-card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-medium">{run.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {run.completedCount} / {run.itemCount} completed
            {run.destination ? ` · ${run.destination}` : ""}
            {run.status !== "active" ? ` · ${run.status}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Checklist actions"
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/70"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-hairline">
              <DropdownMenuItem onSelect={() => m.checkAllRequired.mutate(run.id)}>
                <Check className="size-3.5" /> Check all required
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => m.uncheckAll.mutate(run.id)}>
                <X className="size-3.5" /> Uncheck everything
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => m.reset.mutate(run.id)}>
                <RotateCcw className="size-3.5" /> Start over
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  m.duplicateInstance.mutate(run.id, {
                    onSuccess: () => toast.success("Checklist duplicated"),
                  })
                }
              >
                <Copy className="size-3.5" /> Duplicate this run
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowHistory((v) => !v)}>
                <History className="size-3.5" /> {showHistory ? "Hide history" : "View history"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  if (!window.confirm("Cancel this checklist?")) return;
                  m.cancel.mutate(run.id, { onSuccess: () => toast.success("Checklist cancelled") });
                }}
              >
                <X className="size-3.5" /> Cancel checklist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={onClose}
            aria-label="Close checklist"
            className="grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/70"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <Meter value={(run.completedCount / Math.max(1, run.itemCount)) * 100} className="mt-4" />

      <div className="mt-5 space-y-6">
        {grouped.map(([category, items]) => (
          <div key={category}>
            <p className="label-eyebrow">{category}</p>
            <div className="mt-1.5">
              {items.map((item) => (
                <div key={item.id} className="group/item flex items-start gap-3 py-1">
                  <button
                    onClick={() => m.toggleItem.mutate({ id: run.id, itemId: item.id })}
                    role="checkbox"
                    aria-checked={item.completed}
                    aria-label={item.title}
                    className="flex min-h-11 min-w-0 flex-1 items-start gap-3 rounded-md px-1 text-left transition hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "mt-2.5 grid size-[22px] shrink-0 place-items-center rounded-md border transition",
                        item.completed
                          ? "border-transparent bg-primary text-primary-foreground"
                          : item.required
                            ? "border-primary/60 text-transparent"
                            : "border-input text-transparent",
                      )}
                    >
                      <Check className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 py-2">
                      <span
                        className={cn(
                          "block text-[15px]",
                          item.completed && "text-muted-foreground line-through",
                        )}
                      >
                        {item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} ` : ""}
                        {item.title}
                      </span>
                      {item.assigneeName || item.linkedTaskId || item.notes ? (
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          {item.assigneeName ? (
                            <span className="flex items-center gap-1">
                              <UserRound className="size-3" />
                              {item.assigneeName}
                            </span>
                          ) : null}
                          {item.linkedTaskId ? <span className="text-primary">Task created</span> : null}
                          {item.notes ? <span className="truncate">{item.notes}</span> : null}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label={`Options for ${item.title}`}
                        className="mt-2 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted/70 group-hover/item:opacity-100 focus-visible:opacity-100 md:opacity-0"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl border-hairline">
                      {!item.linkedTaskId ? (
                        <DropdownMenuItem
                          onSelect={() =>
                            m.convertItemToTask.mutate(
                              { id: run.id, itemId: item.id },
                              { onSuccess: () => toast.success("Task created from item") },
                            )
                          }
                        >
                          <ListChecks className="size-3.5" /> Make it a task
                        </DropdownMenuItem>
                      ) : null}
                      {assignees.length ? (
                        <>
                          <DropdownMenuSeparator />
                          {assignees.map((name) => (
                            <DropdownMenuItem
                              key={name}
                              onSelect={() =>
                                m.assignItem.mutate({
                                  id: run.id,
                                  itemId: item.id,
                                  assigneeName: name,
                                })
                              }
                            >
                              <UserRound className="size-3.5" /> Assign to {name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      ) : null}
                      {item.assigneeName ? (
                        <DropdownMenuItem
                          onSelect={() =>
                            m.assignItem.mutate({ id: run.id, itemId: item.id, assigneeName: "" })
                          }
                        >
                          <X className="size-3.5" /> Remove assignment
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {run.status === "active" ? (
        <button
          onClick={() =>
            m.complete.mutate(run.id, { onSuccess: () => toast.success("Checklist completed") })
          }
          className={cn(
            "mt-6 w-full rounded-lg py-3 text-sm font-semibold transition active:scale-[0.99]",
            done
              ? "gradient-primary text-primary-foreground"
              : "border border-hairline text-muted-foreground hover:bg-muted/70",
          )}
        >
          {done ? "Complete" : `Complete (${run.itemCount - run.completedCount} left)`}
        </button>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          This checklist is {run.status}. Duplicate it from the menu to run it again.
        </p>
      )}

      {showHistory ? (
        <div className="mt-6">
          <p className="label-eyebrow">History</p>
          <div className="mt-2 space-y-2">
            {run.history.length ? (
              run.history.slice(0, 8).map((h) => (
                <p key={h.id} className="text-xs leading-relaxed text-muted-foreground">
                  <span className="text-foreground/80">
                    {new Date(h.createdAt).toLocaleString([], {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>{" "}
                  — {h.description}
                </p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Nothing recorded yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

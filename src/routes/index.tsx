import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { DataPanel, HudPanel, InsightPanel, MetricPanel, SectionHeader } from "@/components/future";
import {
  semanticSurfaceClasses,
  semanticTextClasses,
  type SemanticTone,
} from "@/lib/design/semantic";
import { Meter, Pill } from "@/components/os/primitives";
import { EmptyState, ErrorState, FutureState, RowsSkeleton } from "@/components/os/state-views";
import { formatDueLabel, isDueToday, isOverdue } from "@/features/tasks/lib/task-buckets";
import { useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { useChecklistInstances } from "@/hooks/use-checklists";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Home — Personal OS" }],
  }),
  component: HomePage,
});

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Winding down";
};

function HomePage() {
  const { user } = useAuth();
  const tasks = useTasks({ perPage: 100 });
  const instances = useChecklistInstances();
  const m = useTaskMutations();
  const [draft, setDraft] = useState("");

  const items = useMemo(() => tasks.data?.items ?? [], [tasks.data]);
  const open = useMemo(
    () => items.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [items],
  );
  const overdue = useMemo(() => open.filter((t) => isOverdue(t)), [open]);
  const today = useMemo(
    () => open.filter((t) => isDueToday(t) || isOverdue(t)).slice(0, 8),
    [open],
  );
  const running = useMemo(
    () => (instances.data ?? []).filter((i) => i.status === "active"),
    [instances.data],
  );

  const briefing = tasks.isLoading
    ? "Initializing personal context…"
    : tasks.isError
      ? "System connection interrupted."
      : overdue.length
        ? `${overdue.length} commitment${overdue.length > 1 ? "s" : ""} past due.`
        : today.length
          ? `${today.length} item${today.length > 1 ? "s" : ""} for today.`
          : open.length
            ? `${open.length} open commitment${open.length > 1 ? "s" : ""} in queue.`
            : "All systems quiet.";

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    m.create.mutate(
      { title, dueAt: new Date().toISOString() },
      {
        onSuccess: () => {
          setDraft("");
          toast.success("Task added for today");
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <SectionHeader
        system="Personal OS"
        module="Command center"
        title={`${greeting()}${user?.name ? `, ${user.name}` : ""}`}
        subtitle="What would you like to accomplish today?"
      />

      <MetricPanel className="mt-6">
        <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          System status
        </p>
        <p className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">{briefing}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { label: "Open", value: open.length, tone: "primary" as SemanticTone },
              { label: "Due today", value: today.length, tone: "info" as SemanticTone },
              { label: "Overdue", value: overdue.length, tone: "danger" as SemanticTone },
              { label: "Running", value: running.length, tone: "secondary" as SemanticTone },
            ] as const
          ).map((s) => (
            <div key={s.label} className={semanticSurfaceClasses(s.tone)}>
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{s.label}</p>
              <p
                className={cn(
                  "mt-1 font-mono text-2xl font-semibold tabular-nums",
                  semanticTextClasses(s.tone),
                )}
              >
                {tasks.isLoading || instances.isLoading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>
      </MetricPanel>

      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        <HudPanel glow corners className="lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <p className="label-eyebrow">Today</p>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-xs text-primary hover:text-accent"
            >
              Open board <ArrowRight className="size-3" />
            </Link>
          </div>

          <form onSubmit={addTask} className="mt-3 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add something for today…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-hairline bg-surface/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="submit"
              disabled={m.create.isPending}
              className="gradient-primary grid size-10 shrink-0 place-items-center rounded-lg text-primary-foreground disabled:opacity-70"
              aria-label="Add task"
            >
              <Plus className="size-4" />
            </button>
          </form>

          {tasks.isLoading ? (
            <RowsSkeleton rows={4} />
          ) : tasks.isError ? (
            <ErrorState
              error={tasks.error}
              title="Unable to load tasks."
              onRetry={() => tasks.refetch()}
            />
          ) : !today.length ? (
            <EmptyState
              title="Nothing scheduled for today"
              line="Capture a task above or open the board to plan the week."
            />
          ) : (
            <div className="hairline-list mt-3">
              {today.map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-3">
                  <button
                    onClick={() => m.complete.mutate([t.id])}
                    aria-label={`Complete ${t.title}`}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center angular-clip-sm border border-primary/40 text-transparent transition hover:text-primary"
                  >
                    <Check className="size-3" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to="/tasks" className="truncate text-sm hover:text-primary">
                        {t.title}
                      </Link>
                      <Pill
                        tone={
                          t.priority === "urgent"
                            ? "danger"
                            : t.priority === "high"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {t.priority}
                      </Pill>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDueLabel(t.dueAt) ?? t.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </HudPanel>

        <div className="space-y-4 lg:col-span-5">
          <DataPanel title="Running routines">
            {instances.isLoading ? (
              <RowsSkeleton rows={2} />
            ) : instances.isError ? (
              <ErrorState error={instances.error} onRetry={() => instances.refetch()} />
            ) : !running.length ? (
              <p className="text-sm text-muted-foreground">No active routines.</p>
            ) : (
              <div className="space-y-4">
                {running.slice(0, 3).map((i) => (
                  <div key={i.id}>
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-sm">{i.name}</p>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {i.completedCount}/{i.itemCount}
                      </span>
                    </div>
                    <Meter
                      value={(i.completedCount / Math.max(1, i.itemCount)) * 100}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </DataPanel>

          <InsightPanel signal="Context" kind="ai">
            {overdue.length
              ? `Clearing "${overdue[0]!.title}" removes most of today's pressure.`
              : running.length
                ? `Mid-routine on ${running[0]!.name} — ${running[0]!.itemCount - running[0]!.completedCount} items left.`
                : today.length
                  ? "Focus on today's list first — the board has the rest."
                  : "Nothing needs you. That is allowed."}
          </InsightPanel>
        </div>
      </div>

      <div className="mt-4">
        <FutureState
          title="Calendar, finance, documents & home"
          line="These modules arrive when their backend does. Nothing here is simulated."
        />
      </div>
    </div>
  );
}

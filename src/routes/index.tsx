import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useUniversalEditor } from "@/components/editor/create-surface";
import { DataPanel, HudPanel, InsightPanel, MetricPanel, SectionHeader } from "@/components/future";
import {
  semanticSurfaceClasses,
  semanticTextClasses,
  type SemanticTone,
} from "@/lib/design/semantic";
import { Pill } from "@/components/os/primitives";
import { EmptyState, ErrorState, FutureState, RowsSkeleton } from "@/components/os/state-views";
import { isDueToday, isOverdue } from "@/features/tasks/lib/task-timeline";
import { formatDueLabel } from "@/features/tasks/lib/task-buckets";
import { useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { useChecklistInstances } from "@/hooks/use-checklists";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

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
  const editor = useUniversalEditor();
  const tasks = useTasks({ perPage: 100 });
  const instances = useChecklistInstances();
  const m = useTaskMutations();

  const items = useMemo(() => tasks.data?.items ?? [], [tasks.data]);
  const open = useMemo(
    () => items.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [items],
  );
  const overdue = useMemo(() => open.filter((t) => isOverdue(t)), [open]);
  const todayOpen = useMemo(
    () => open.filter((t) => isDueToday(t) || isOverdue(t)),
    [open],
  );
  const focusTask = useMemo(() => {
    const urgent = todayOpen.find((t) => t.priority === "urgent" || t.priority === "high");
    return urgent ?? todayOpen[0] ?? overdue[0] ?? null;
  }, [todayOpen, overdue]);
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
        : todayOpen.length
          ? `${todayOpen.length} item${todayOpen.length > 1 ? "s" : ""} for today.`
          : open.length
            ? `${open.length} open commitment${open.length > 1 ? "s" : ""} in queue.`
            : "All systems quiet.";

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
              { label: "Due today", value: todayOpen.length, tone: "info" as SemanticTone },
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
            <p className="label-eyebrow">Focus queue</p>
            <Link
              to="/tasks"
              search={{ filter: "today" }}
              className="flex items-center gap-1 text-xs text-primary hover:text-accent"
            >
              View today&apos;s tasks <ArrowRight className="size-3" />
            </Link>
          </div>

          {tasks.isLoading ? (
            <RowsSkeleton rows={3} />
          ) : tasks.isError ? (
            <ErrorState
              error={tasks.error}
              title="Unable to load tasks."
              onRetry={() => tasks.refetch()}
            />
          ) : !focusTask ? (
            <EmptyState
              title="Nothing needs you right now"
              line="Create a task when something comes up."
              action={
                <button
                  type="button"
                  onClick={() => editor.create("task")}
                  className="gradient-primary rounded-md px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  New task
                </button>
              }
            />
          ) : (
            <div className="mt-3 rounded-lg border border-hairline/60 bg-surface/30 p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => m.complete.mutate([focusTask.id])}
                  aria-label={`Complete ${focusTask.title}`}
                  className="mt-0.5 grid size-5 shrink-0 place-items-center angular-clip-sm border border-primary/40 text-transparent transition hover:text-primary"
                >
                  <Check className="size-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/tasks"
                    search={{ taskId: focusTask.id }}
                    className="text-sm font-medium leading-snug hover:text-primary"
                  >
                    {focusTask.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Pill
                      tone={
                        focusTask.priority === "urgent"
                          ? "danger"
                          : focusTask.priority === "high"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {focusTask.priority}
                    </Pill>
                    <span className="text-xs text-muted-foreground">
                      {formatDueLabel(focusTask.dueAt) ?? focusTask.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
              {todayOpen.length > 1 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {todayOpen.length - 1} more task{todayOpen.length > 2 ? "s" : ""} today
                </p>
              ) : null}
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
                : todayOpen.length
                  ? "Focus on today's queue first — the timeline has the rest."
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

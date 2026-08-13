import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Check, ClipboardCheck, Clock, ListChecks, Sparkles } from "lucide-react";
import { DataPanel, HudPanel, InsightPanel, MetricPanel, SectionHeader } from "@/components/future";
import { Meter, Pill } from "@/components/os/primitives";
import { EmptyState, ErrorState, FutureState, RowsSkeleton } from "@/components/os/state-views";
import { useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { useChecklistInstances } from "@/hooks/use-checklists";
import { useAuth } from "@/features/auth/auth-context";

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

const isToday = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const timeOf = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

function HomePage() {
  const { user } = useAuth();
  const tasks = useTasks({ perPage: 100 });
  const instances = useChecklistInstances();
  const m = useTaskMutations();

  const items = useMemo(() => tasks.data?.items ?? [], [tasks.data]);
  const open = useMemo(
    () => items.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    [items],
  );
  const overdue = useMemo(
    () => open.filter((t) => t.dueAt && new Date(t.dueAt).getTime() < Date.now()),
    [open],
  );
  const today = useMemo(() => open.filter((t) => isToday(t.dueAt)), [open]);
  const important = useMemo(
    () => open.filter((t) => t.priority === "urgent" || t.priority === "high" || t.pinned),
    [open],
  );
  const focus = (today.length ? today : important.length ? important : open).slice(0, 6);
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
          ? `${today.length} priority item${today.length > 1 ? "s" : ""} for today.`
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
          {[
            { label: "Open", value: open.length },
            { label: "Due today", value: today.length },
            { label: "Overdue", value: overdue.length },
            { label: "Running", value: running.length },
          ].map((s) => (
            <div
              key={s.label}
              className="angular-clip-sm border border-hairline/50 bg-background/15 px-3 py-2.5"
            >
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{s.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
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
              className="flex items-center gap-1 text-xs text-primary hover:text-accent"
            >
              All tasks <ArrowRight className="size-3" />
            </Link>
          </div>
          {tasks.isLoading ? (
            <RowsSkeleton rows={4} />
          ) : tasks.isError ? (
            <ErrorState
              error={tasks.error}
              title="Unable to load tasks."
              onRetry={() => tasks.refetch()}
            />
          ) : !focus.length ? (
            <EmptyState
              title="Queue clear"
              line="Capture something you need to get done and it will appear here."
            />
          ) : (
            <div className="hairline-list mt-2">
              {focus.map((t) => (
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
                      <p className="truncate text-sm">{t.title}</p>
                      <Pill tone={t.priority === "urgent" ? "danger" : "muted"}>{t.priority}</Pill>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.status.replace(/_/g, " ")}
                      {timeOf(t.dueAt) ? ` · ${timeOf(t.dueAt)}` : ""}
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

          <InsightPanel signal="Context">
            {overdue.length
              ? `Clearing "${overdue[0]!.title}" removes most of today's pressure.`
              : running.length
                ? `Mid-routine on ${running[0]!.name} — ${running[0]!.itemCount - running[0]!.completedCount} items left.`
                : open.length
                  ? "Your day is balanced. Pick the nearest due date and stop there."
                  : "Nothing needs you. That is allowed."}
          </InsightPanel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DataPanel title="Recent activity">
          {tasks.isLoading ? (
            <RowsSkeleton rows={3} />
          ) : items.length ? (
            <div className="hairline-list">
              {[...items]
                .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
                .slice(0, 4)
                .map((t) => (
                  <div key={t.id} className="py-2.5">
                    <p className="truncate text-sm">{t.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(t.updatedAt).toLocaleString([], {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent changes.</p>
          )}
        </DataPanel>

        <FutureState
          title="Calendar, finance, documents & home"
          line="These modules arrive when their backend does. Nothing here is simulated."
        />
      </div>
    </div>
  );
}

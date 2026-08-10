import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight, Check, ClipboardCheck, Clock, ListChecks, Sparkles } from "lucide-react";
import { Meter, Pill } from "@/components/os/primitives";
import { EmptyState, ErrorState, FutureState, RowsSkeleton } from "@/components/os/state-views";
import { useTaskMutations, useTasks } from "@/hooks/use-tasks";
import { useChecklistInstances } from "@/hooks/use-checklists";
import { useAuth } from "@/features/auth/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Personal OS" },
      {
        name: "description",
        content:
          "A calm briefing of what matters today: your open tasks, what's overdue and the routines you're running.",
      },
      { property: "og:title", content: "Home — Personal OS" },
      { property: "og:description", content: "Your day, composed from real data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
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
    ? "Reading your day…"
    : tasks.isError
      ? "Your day is out of reach right now."
      : overdue.length
        ? `${overdue.length} thing${overdue.length > 1 ? "s" : ""} slipped past its time.`
        : today.length
          ? `You have ${today.length === 1 ? "one important thing" : `${today.length} things`} to finish today.`
          : open.length
            ? `Nothing is due today. ${open.length} open commitment${open.length > 1 ? "s" : ""} wait when you're ready.`
            : "Nothing is asking for you right now.";

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="animate-rise max-w-2xl">
        <p className="label-eyebrow">
          {greeting()}
          {user?.name ? `, ${user.name}` : ""}
        </p>
        <h1 className="display-lg mt-3 text-balance">{briefing}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Everything below is live from your Personal OS backend — tasks and checklists only, for now.
        </p>
      </header>

      <div className="bento-grid mt-8">
        {/* focus */}
        <section
          className="bento-tile tile-glow animate-rise md:col-span-6 xl:col-span-7 xl:row-span-2"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="label-eyebrow">Focus</p>
            <Link
              to="/tasks"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              All tasks <ArrowRight className="size-3" />
            </Link>
          </div>

          {tasks.isLoading ? (
            <div className="mt-3">
              <RowsSkeleton rows={4} />
            </div>
          ) : tasks.isError ? (
            <div className="mt-4">
              <ErrorState
                error={tasks.error}
                title="Unable to load your tasks."
                onRetry={() => void tasks.refetch()}
              />
            </div>
          ) : !focus.length ? (
            <EmptyState
              title="No tasks yet."
              line="Capture something you need to get done and it will show up here."
              icon={<ListChecks className="size-4" />}
              action={
                <Link
                  to="/tasks"
                  className="gradient-primary rounded-md px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  New task
                </Link>
              }
            />
          ) : (
            <div className="hairline-list mt-3">
              {focus.map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-3">
                  <button
                    onClick={() => m.complete.mutate([t.id])}
                    role="checkbox"
                    aria-checked={false}
                    aria-label={`Complete ${t.title}`}
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-input text-transparent transition hover:border-primary hover:text-primary"
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
        </section>

        {/* counts */}
        <section
          className="bento-tile animate-rise md:col-span-3 xl:col-span-5"
          style={{ animationDelay: "120ms" }}
        >
          <p className="label-eyebrow">Where you stand</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              { label: "Open", value: open.length },
              { label: "Due today", value: today.length },
              { label: "Overdue", value: overdue.length },
              { label: "Running routines", value: running.length },
            ].map((s) => (
              <div key={s.label} className="border-l border-hairline pl-3">
                <p className="text-2xl font-semibold tabular-nums">
                  {tasks.isLoading || instances.isLoading ? "—" : s.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* checklists */}
        <section
          className="bento-tile animate-rise md:col-span-3 xl:col-span-5"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="label-eyebrow">Running routines</p>
            <Link
              to="/checklists"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Checklists <ArrowRight className="size-3" />
            </Link>
          </div>

          {instances.isLoading ? (
            <div className="mt-3">
              <RowsSkeleton rows={2} />
            </div>
          ) : instances.isError ? (
            <div className="mt-4">
              <ErrorState
                error={instances.error}
                title="Unable to load your checklists."
                onRetry={() => void instances.refetch()}
              />
            </div>
          ) : !running.length ? (
            <EmptyState
              title="Nothing is running."
              line="Start a checklist when you pack, travel or run a routine."
              icon={<ClipboardCheck className="size-4" />}
              action={
                <Link
                  to="/checklists"
                  className="gradient-primary rounded-md px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Open checklists
                </Link>
              }
            />
          ) : (
            <div className="mt-3 space-y-4">
              {running.slice(0, 3).map((i) => (
                <div key={i.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm">{i.name}</p>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {i.completedCount}/{i.itemCount}
                    </span>
                  </div>
                  <Meter value={(i.completedCount / Math.max(1, i.itemCount)) * 100} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required {i.requiredCompletedCount}/{i.requiredCount}
                    {i.destination ? ` · ${i.destination}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* recently touched */}
        <section
          className="bento-tile animate-rise md:col-span-3 xl:col-span-4"
          style={{ animationDelay: "200ms" }}
        >
          <p className="label-eyebrow">Recent activity</p>
          {tasks.isLoading ? (
            <div className="mt-3">
              <RowsSkeleton rows={3} />
            </div>
          ) : items.length ? (
            <div className="hairline-list mt-3">
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
            <p className="mt-3 text-sm text-muted-foreground">Nothing has changed yet.</p>
          )}
        </section>

        {/* honest future modules */}
        <section
          className="animate-rise md:col-span-3 xl:col-span-4"
          style={{ animationDelay: "240ms" }}
        >
          <FutureState
            title="Calendar, finance, documents & home"
            line="These modules arrive when their backend does. Nothing here is simulated."
          />
        </section>

        <section
          className="bento-tile animate-rise md:col-span-6 xl:col-span-4"
          style={{ animationDelay: "280ms" }}
        >
          <p className="label-eyebrow">Context</p>
          <p className="mt-3 flex gap-2.5 text-sm leading-relaxed">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span className="text-foreground/85">
              {overdue.length
                ? `Clearing ${overdue[0]!.title.toLowerCase()} first would remove most of today's pressure.`
                : running.length
                  ? `You're mid-routine on ${running[0]!.name} — ${running[0]!.itemCount - running[0]!.completedCount} items left.`
                  : open.length
                    ? "Your day is balanced. Pick the task with the nearest date and stop there."
                    : "Nothing needs you. That is allowed."}
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}

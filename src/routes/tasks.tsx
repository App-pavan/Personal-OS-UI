import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, ListTree, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskBoardColumn, TaskTimelineSection } from "@/features/tasks/components/task-board-column";
import { TaskCard } from "@/features/tasks/components/task-card";
import { TaskDetailPane } from "@/features/tasks/components/task-detail-pane";
import {
  boardColumns,
  dateGroupLabels,
  groupByBoard,
  groupByDate,
  isOverdue,
} from "@/features/tasks/lib/task-buckets";
import { EmptyState, ErrorState, RowsSkeleton, Skeleton } from "@/components/os/state-views";
import { useTask, useTaskMutations, useTasks } from "@/hooks/use-tasks";
import type { TaskListQuery, TaskStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [{ title: "Tasks — Personal OS" }],
  }),
  component: TasksPage,
});

const startOfTomorrow = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

const views: { key: string; label: string; line: string; query: TaskListQuery }[] = [
  { key: "all", label: "All", line: "Your commitments across capture, focus, and flow.", query: {} },
  { key: "inbox", label: "Inbox", line: "Captured, not yet decided.", query: { status: ["inbox"] } },
  {
    key: "today",
    label: "Today",
    line: "What needs you before the day ends.",
    query: { dueBefore: startOfTomorrow() },
  },
  {
    key: "upcoming",
    label: "Upcoming",
    line: "Scheduled ahead without crowding today.",
    query: { dueAfter: startOfTomorrow() },
  },
  {
    key: "in_progress",
    label: "In progress",
    line: "Already in motion.",
    query: { status: ["in_progress"] },
  },
  { key: "waiting", label: "Waiting", line: "Held by someone else.", query: { status: ["waiting"] } },
  { key: "blocked", label: "Blocked", line: "Something must clear first.", query: { status: ["blocked"] } },
  { key: "completed", label: "Completed", line: "Closed and done.", query: { status: ["completed"] } },
  { key: "archived", label: "Archived", line: "Out of the way, still yours.", query: { archived: true } },
];

const openStatus = (status: TaskStatus) => status !== "completed" && status !== "cancelled";

type LayoutMode = "board" | "timeline";

function TasksPage() {
  const [view, setView] = useState(views[0]!);
  const [layout, setLayout] = useState<LayoutMode>("board");
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useTasks({ perPage: 100, ...view.query });
  const detail = useTask(openId);
  const m = useTaskMutations();

  const items = useMemo(() => list.data?.items ?? [], [list.data]);
  const openCount = items.filter((i) => openStatus(i.status)).length;
  const board = useMemo(() => groupByBoard(items), [items]);
  const timeline = useMemo(() => groupByDate(items), [items]);

  const headline = list.isLoading
    ? "Reading your commitments…"
    : list.isError
      ? "Your tasks are out of reach right now."
      : openCount === 0
        ? "This view is clear."
        : openCount === 1
          ? "One thing wants you in this view."
          : `${openCount} things want you in this view.`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    m.create.mutate(
      { title },
      {
        onSuccess: (created) => {
          setDraft("");
          setOpenId(created.id);
          toast.success("Task captured");
        },
      },
    );
  };

  const toggleComplete = (id: string, done: boolean) => {
    if (done) m.reopen.mutate([id]);
    else m.complete.mutate([id]);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <header className="animate-rise max-w-3xl">
        <p className="label-eyebrow">Tasks</p>
        <h1 className="display-lg mt-3">{headline}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{view.line}</p>
      </header>

      <div className="animate-rise mt-6 flex flex-wrap items-center gap-2" style={{ animationDelay: "60ms" }}>
        <div className="glass-panel inline-flex flex-wrap items-center gap-1 rounded-xl p-1">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v)}
              className={cn(
                "rail-item rounded-lg px-3 py-1.5 text-sm",
                view.key === v.key
                  ? "gradient-primary font-semibold text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted/70",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="glass-panel inline-flex rounded-xl p-1">
          {(
            [
              ["board", LayoutGrid, "Board"],
              ["timeline", ListTree, "Timeline"],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
                layout === mode
                  ? "bg-muted/80 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="animate-rise mt-5 flex items-center gap-2"
        style={{ animationDelay: "100ms" }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a task the way you'd say it out loud…"
          className="h-11 min-w-0 flex-1 rounded-lg border border-hairline bg-surface/60 px-3.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="submit"
          disabled={m.create.isPending}
          aria-label="Add task"
          className="gradient-primary grid size-11 shrink-0 place-items-center rounded-lg text-primary-foreground transition active:scale-95 disabled:opacity-70"
        >
          <Plus className="size-4" />
        </button>
      </form>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
        <section className="animate-rise min-w-0" style={{ animationDelay: "140ms" }}>
          {list.isLoading ? (
            <RowsSkeleton rows={6} />
          ) : list.isError ? (
            <ErrorState
              error={list.error}
              title="Unable to load your tasks."
              onRetry={() => void list.refetch()}
            />
          ) : !items.length ? (
            <EmptyState
              title="No tasks yet."
              line="Capture something you need to get done — it stays connected to everything else."
            />
          ) : layout === "board" ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {boardColumns.map((column) => (
                <TaskBoardColumn
                  key={column.id}
                  title={column.title}
                  hint={column.hint}
                  count={board[column.id].length}
                  accent=""
                >
                  {board[column.id].length ? (
                    board[column.id].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        accent={column.id}
                        selected={openId === task.id}
                        onOpen={() => setOpenId(task.id)}
                        onToggleComplete={() =>
                          toggleComplete(task.id, task.status === "completed")
                        }
                      />
                    ))
                  ) : (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">Nothing here.</p>
                  )}
                </TaskBoardColumn>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {timeline.map((section) => (
                <TaskTimelineSection
                  key={section.group}
                  title={dateGroupLabels[section.group]}
                  count={section.tasks.length}
                >
                  {section.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      accent={isOverdue(task) ? "overdue" : section.group}
                      selected={openId === task.id}
                      onOpen={() => setOpenId(task.id)}
                      onToggleComplete={() => toggleComplete(task.id, task.status === "completed")}
                    />
                  ))}
                </TaskTimelineSection>
              ))}
            </div>
          )}
          {list.data?.meta && list.data.meta.total > items.length ? (
            <p className="pt-3 text-xs text-muted-foreground">
              Showing {items.length} of {list.data.meta.total}
            </p>
          ) : null}
        </section>

        {openId ? (
          <aside
            key={openId}
            className="animate-rise surface-raised tile-glow sticky top-24 h-fit overflow-hidden p-5"
          >
            {detail.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ) : detail.isError ? (
              <ErrorState
                error={detail.error}
                title="Unable to load this task."
                onRetry={() => void detail.refetch()}
              />
            ) : detail.data ? (
              <TaskDetailPane task={detail.data} onClose={() => setOpenId(null)} mutations={m} />
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

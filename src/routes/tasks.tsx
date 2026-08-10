import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronRight,
  Clock,
  Copy,
  History,
  Link2,
  Paperclip,
  Pin,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Meter, Pill } from "@/components/os/primitives";
import { EmptyState, ErrorState, RowsSkeleton, Skeleton } from "@/components/os/state-views";
import { useTask, useTaskMutations, useTasks } from "@/hooks/use-tasks";
import type { TaskListQuery, TaskPriority, TaskStatus } from "@/lib/api/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Personal OS" },
      {
        name: "description",
        content:
          "Every commitment as an object: status, priority, dates, steps, dependencies, comments and history.",
      },
      { property: "og:title", content: "Tasks — Personal OS" },
      { property: "og:description", content: "Tasks as objects, not a checklist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

const startOfTomorrow = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

/** Only filters the backend actually accepts. */
const views: { key: string; label: string; line: string; query: TaskListQuery }[] = [
  { key: "all", label: "All", line: "Everything open across your life.", query: {} },
  { key: "inbox", label: "Inbox", line: "Captured, not yet decided.", query: { status: ["inbox"] } },
  {
    key: "today",
    label: "Today",
    line: "Due before the day ends.",
    query: { dueBefore: startOfTomorrow() },
  },
  {
    key: "upcoming",
    label: "Upcoming",
    line: "Shapes the week without pressing on today.",
    query: { dueAfter: startOfTomorrow() },
  },
  {
    key: "in_progress",
    label: "In progress",
    line: "Already moving.",
    query: { status: ["in_progress"] },
  },
  { key: "waiting", label: "Waiting", line: "Held by someone else.", query: { status: ["waiting"] } },
  { key: "blocked", label: "Blocked", line: "Something must clear first.", query: { status: ["blocked"] } },
  {
    key: "completed",
    label: "Completed",
    line: "Closed and done.",
    query: { status: ["completed"] },
  },
  { key: "archived", label: "Archived", line: "Out of the way, still yours.", query: { archived: true } },
];

const priorityTone: Record<TaskPriority, "danger" | "warning" | "info" | "muted"> = {
  urgent: "danger",
  high: "warning",
  normal: "info",
  low: "muted",
};

const openStatus = (status: TaskStatus) => status !== "completed" && status !== "cancelled";

const when = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

function TasksPage() {
  const [view, setView] = useState(views[0]!);
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useTasks({ perPage: 50, ...view.query });
  const detail = useTask(openId);
  const m = useTaskMutations();

  const items = useMemo(() => list.data?.items ?? [], [list.data]);
  const openCount = items.filter((i) => openStatus(i.status)).length;

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

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <header className="animate-rise max-w-2xl">
        <p className="label-eyebrow">Tasks</p>
        <h1 className="display-lg mt-3">{headline}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{view.line}</p>
      </header>

      <div
        className="animate-rise glass-panel mt-6 inline-flex flex-wrap items-center gap-1 rounded-xl p-1"
        style={{ animationDelay: "80ms" }}
      >
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

      <form
        onSubmit={submit}
        className="animate-rise mt-5 flex items-center gap-2"
        style={{ animationDelay: "120ms" }}
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <section
          className="animate-rise surface-raised h-fit p-4 md:p-5"
          style={{ animationDelay: "160ms" }}
        >
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
          ) : (
            <div className="hairline-list">
              {items.map((i) => {
                const done = i.status === "completed";
                return (
                  <button
                    key={i.id}
                    onClick={() => setOpenId(i.id)}
                    className={cn(
                      "row-quiet flex w-full items-start gap-3 py-3.5 text-left",
                      openId === i.id && "bg-muted/60",
                    )}
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (done) m.reopen.mutate([i.id]);
                        else m.complete.mutate([i.id]);
                      }}
                      role="checkbox"
                      aria-checked={done}
                      aria-label={done ? `Reopen ${i.title}` : `Complete ${i.title}`}
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
                        done
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-input text-transparent hover:border-primary hover:text-primary",
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-sm", done && "text-muted-foreground line-through")}>
                          {i.title}
                        </span>
                        <Pill tone={priorityTone[i.priority]}>{i.priority}</Pill>
                        {i.pinned ? <Pin className="size-3 text-primary" /> : null}
                        {i.favorite ? <Star className="size-3 fill-accent text-accent" /> : null}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{i.status.replace(/_/g, " ")}</span>
                        {when(i.dueAt) ? (
                          <>
                            <span>·</span>
                            <span>{when(i.dueAt)}</span>
                          </>
                        ) : null}
                        {i.subtaskCount ? (
                          <>
                            <span>·</span>
                            <span>
                              {i.subtaskCompletedCount}/{i.subtaskCount} steps
                            </span>
                          </>
                        ) : null}
                        {i.projectName ? (
                          <>
                            <span>·</span>
                            <span>{i.projectName}</span>
                          </>
                        ) : null}
                      </span>
                    </span>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
          {list.data?.meta && list.data.meta.total > items.length ? (
            <p className="pt-3 text-xs text-muted-foreground">
              Showing {items.length} of {list.data.meta.total}
            </p>
          ) : null}
        </section>

        {/* Task as an object — steps, relationships, history */}
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
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : detail.isError ? (
              <ErrorState
                error={detail.error}
                title="Unable to load this task."
                onRetry={() => void detail.refetch()}
              />
            ) : detail.data ? (
              <TaskDetailPane
                task={detail.data}
                onClose={() => setOpenId(null)}
                mutations={m}
              />
            ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

type Mutations = ReturnType<typeof useTaskMutations>;

function TaskDetailPane({
  task,
  onClose,
  mutations: m,
}: {
  task: NonNullable<ReturnType<typeof useTask>["data"]>;
  onClose: () => void;
  mutations: Mutations;
}) {
  const [subDraft, setSubDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-eyebrow">
            {task.type.replace(/_/g, " ")} · {task.status.replace(/_/g, " ")}
          </p>
          <h2 className="mt-2 text-lg leading-snug font-medium">{task.title}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted/70"
        >
          <X className="size-4" />
        </button>
      </div>

      {task.description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {when(task.dueAt) ? (
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {when(task.dueAt)}
          </span>
        ) : null}
        {(["urgent", "high", "normal", "low"] as TaskPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => m.update.mutate({ id: task.id, input: { priority: p } })}
            className={cn(
              "rounded-md px-1.5 py-0.5",
              task.priority === p ? "bg-primary-soft text-primary" : "hover:bg-muted/70",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <Meter value={task.progress} className="mt-4" />
      <p className="mt-1.5 text-xs text-muted-foreground">{task.progress}% complete</p>

      <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
        {task.status === "completed" ? (
          <button
            onClick={() => m.reopen.mutate([task.id])}
            className="gradient-primary rounded-md px-2.5 py-1.5 font-semibold text-primary-foreground"
          >
            <RotateCcw className="mr-1 inline size-3" /> Reopen
          </button>
        ) : (
          <button
            onClick={() => m.complete.mutate([task.id])}
            className="gradient-primary rounded-md px-2.5 py-1.5 font-semibold text-primary-foreground"
          >
            <Check className="mr-1 inline size-3" /> Complete
          </button>
        )}
        <button
          onClick={() => m.pin.mutate([task.id, !task.pinned])}
          className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
        >
          <Pin className="mr-1 inline size-3" /> {task.pinned ? "Unpin" : "Pin"}
        </button>
        <button
          onClick={() => m.favorite.mutate([task.id, !task.favorite])}
          className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
        >
          <Star className="mr-1 inline size-3" /> {task.favorite ? "Unfavorite" : "Favorite"}
        </button>
        <button
          onClick={() => m.duplicate.mutate([task.id])}
          className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
        >
          <Copy className="mr-1 inline size-3" /> Duplicate
        </button>
        {task.archived ? (
          <button
            onClick={() => m.restore.mutate([task.id])}
            className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
          >
            <ArchiveRestore className="mr-1 inline size-3" /> Restore
          </button>
        ) : (
          <button
            onClick={() => m.archive.mutate([task.id])}
            className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70"
          >
            <Archive className="mr-1 inline size-3" /> Archive
          </button>
        )}
        <button
          onClick={() => {
            if (!window.confirm("Delete this task? It is kept as deleted on the server.")) return;
            m.remove.mutate([task.id], { onSuccess: () => onClose() });
          }}
          className="rounded-md px-2.5 py-1.5 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-1 inline size-3" /> Delete
        </button>
      </div>

      {task.aiContext?.summary ? (
        <p className="mt-4 flex gap-2.5 border-l border-primary/40 pl-3 text-sm leading-relaxed">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span className="text-foreground/85">{task.aiContext.summary}</span>
        </p>
      ) : null}

      <div className="mt-5">
        <p className="label-eyebrow">Steps</p>
        <div className="mt-2 space-y-1">
          {task.subtasks.map((s) => (
            <button
              key={s.id}
              onClick={() => m.toggleSubtask.mutate([task.id, s.id])}
              className="row-quiet flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left"
            >
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded border",
                  s.completed
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-input text-transparent",
                )}
              >
                <Check className="size-2.5" />
              </span>
              <span className={cn("text-sm", s.completed && "text-muted-foreground line-through")}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subDraft.trim()) return;
            m.addSubtask.mutate([task.id, subDraft.trim()]);
            setSubDraft("");
          }}
          className="mt-2"
        >
          <input
            value={subDraft}
            onChange={(e) => setSubDraft(e.target.value)}
            placeholder="Add a step…"
            className="h-9 w-full rounded-md border border-hairline bg-transparent px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </form>
      </div>

      {task.checklist.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">Inline checklist</p>
          <div className="mt-2 space-y-1">
            {task.checklist.map((c) => (
              <button
                key={c.id}
                onClick={() => m.toggleChecklistItem.mutate([task.id, c.id])}
                className="row-quiet flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left"
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    c.completed
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-input text-transparent",
                  )}
                >
                  <Check className="size-2.5" />
                </span>
                <span className={cn("text-sm", c.completed && "text-muted-foreground line-through")}>
                  {c.title}
                </span>
                {c.required ? <Pill tone="muted">required</Pill> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {task.dependencies.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">Dependencies</p>
          <div className="mt-2 space-y-1.5">
            {task.dependencies.map((d) => (
              <p key={d.id} className="text-sm text-muted-foreground">
                <span className="text-foreground/85">{d.title}</span> — {d.type.replace(/_/g, " ")} ·{" "}
                {d.status.replace(/_/g, " ")}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {task.links.length || task.attachments.length || task.entityLinks.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">Related</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {task.entityLinks.map((l) => (
              <span
                key={`${l.entityType}-${l.entityId}`}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 text-xs text-muted-foreground"
              >
                <Link2 className="size-3" />
                {l.label}
              </span>
            ))}
            {task.links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 text-xs text-muted-foreground hover:bg-muted/70"
              >
                <Link2 className="size-3" />
                {l.title ?? l.url}
              </a>
            ))}
            {task.attachments.map((a) => (
              <span
                key={a.id}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 text-xs text-muted-foreground"
              >
                <Paperclip className="size-3" />
                {a.filename}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="label-eyebrow">Comments</p>
        <div className="mt-2 space-y-2.5">
          {task.comments.length ? (
            task.comments.map((c) => (
              <div key={c.id} className="text-sm">
                <p className="text-foreground/90">{c.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.authorName} · {when(c.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!commentDraft.trim()) return;
            m.comment.mutate([task.id, commentDraft.trim()]);
            setCommentDraft("");
          }}
          className="mt-2"
        >
          <input
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="Write a comment…"
            className="h-9 w-full rounded-md border border-hairline bg-transparent px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </form>
      </div>

      {task.timeline.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">History</p>
          <div className="mt-2 space-y-2">
            {task.timeline.slice(0, 8).map((h) => (
              <p key={h.id} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <History className="mt-0.5 size-3 shrink-0" />
                <span>
                  <span className="text-foreground/80">{when(h.createdAt)}</span> — {h.description}
                </span>
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

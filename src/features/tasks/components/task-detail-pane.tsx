import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  Clock,
  Copy,
  History,
  Link2,
  Paperclip,
  Pin,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Meter, Pill } from "@/components/os/primitives";
import { formatDueLabel } from "@/features/tasks/lib/task-buckets";
import { useTaskMutations } from "@/hooks/use-tasks";
import type { TaskDetail, TaskPriority } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Mutations = ReturnType<typeof useTaskMutations>;

export function TaskDetailPane({
  task,
  onClose,
  mutations: m,
}: {
  task: TaskDetail;
  onClose: () => void;
  mutations: Mutations;
}) {
  const [subDraft, setSubDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  const subtasks = task.subtasks ?? [];
  const checklist = task.checklist ?? [];
  const dependencies = task.dependencies ?? [];
  const links = task.links ?? [];
  const attachments = task.attachments ?? [];
  const entityLinks = task.entityLinks ?? [];
  const comments = task.comments ?? [];
  const timeline = task.timeline ?? [];
  const due = formatDueLabel(task.dueAt);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-eyebrow">
            {(task.type ?? "task").replace(/_/g, " ")} · {(task.status ?? "inbox").replace(/_/g, " ")}
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
        {due ? (
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {due}
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

      <Meter value={task.progress ?? 0} className="mt-4" />
      <p className="mt-1.5 text-xs text-muted-foreground">{task.progress ?? 0}% complete</p>

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
            if (!window.confirm("Delete this task?")) return;
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
          {subtasks.map((s) => (
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

      {checklist.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">Inline checklist</p>
          <div className="mt-2 space-y-1">
            {checklist.map((c) => (
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

      {dependencies.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">Dependencies</p>
          <div className="mt-2 space-y-1.5">
            {dependencies.map((d) => (
              <p key={d.id} className="text-sm text-muted-foreground">
                <span className="text-foreground/85">{d.title}</span> — {d.type.replace(/_/g, " ")} ·{" "}
                {d.status.replace(/_/g, " ")}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {links.length || attachments.length || entityLinks.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">Related</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entityLinks.map((l) => (
              <span
                key={`${l.entityType}-${l.entityId}`}
                className="flex items-center gap-1.5 rounded-md border border-hairline px-2 py-1 text-xs text-muted-foreground"
              >
                <Link2 className="size-3" />
                {l.label}
              </span>
            ))}
            {links.map((l) => (
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
            {attachments.map((a) => (
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
          {comments.length ? (
            comments.map((c) => (
              <div key={c.id} className="text-sm">
                <p className="text-foreground/90">{c.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.authorName} · {new Date(c.createdAt).toLocaleString()}
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

      {timeline.length ? (
        <div className="mt-5">
          <p className="label-eyebrow">History</p>
          <div className="mt-2 space-y-2">
            {timeline.slice(0, 8).map((h) => (
              <p key={h.id} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <History className="mt-0.5 size-3 shrink-0" />
                <span>
                  <span className="text-foreground/80">
                    {new Date(h.createdAt).toLocaleString()}
                  </span>{" "}
                  — {h.description}
                </span>
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

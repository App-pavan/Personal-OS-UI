import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Can } from "@/features/capabilities/can";
import { PERM } from "@/lib/permissions";
import {
  Archive,
  ArchiveRestore,
  Check,
  Clock,
  Copy,
  History,
  Link2,
  MoreHorizontal,
  Paperclip,
  Pin,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Meter, Pill } from "@/components/os/primitives";
import { formatDueLabel } from "@/features/tasks/lib/task-dates";
import type { useTaskMutations } from "@/hooks/use-tasks";
import type { TaskDetail, TaskPriority } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Mutations = ReturnType<typeof useTaskMutations>;

function formatDetailDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

function listLabel(task: TaskDetail): string {
  if (task.projectName) return task.projectName;
  if (task.status === "inbox") return "Inbox";
  return task.status.replace(/_/g, " ");
}

export function TaskDetailPane({
  task,
  onClose,
  mutations: m,
}: {
  task: TaskDetail;
  onClose: () => void;
  mutations: Mutations;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [subDraft, setSubDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
  }, [task.id, task.title, task.description]);

  const subtasks = task.subtasks ?? [];
  const checklist = task.checklist ?? [];
  const dependencies = task.dependencies ?? [];
  const links = task.links ?? [];
  const attachments = task.attachments ?? [];
  const entityLinks = task.entityLinks ?? [];
  const comments = task.comments ?? [];
  const timeline = task.timeline ?? [];
  const due = formatDueLabel(task.dueAt);
  const isCompleted = task.status === "completed";

  const saveTitle = () => {
    const next = title.trim();
    if (next && next !== task.title) {
      m.update.mutate({ id: task.id, input: { title: next } });
    }
  };

  const saveDescription = () => {
    const next = description.trim();
    if (next !== (task.description ?? "")) {
      m.update.mutate({ id: task.id, input: { description: next || undefined } });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--task-text-muted)]">
            Task
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="grid size-8 shrink-0 place-items-center rounded-md text-[var(--task-text-muted)] transition-colors duration-150 hover:bg-[var(--task-surface-hover)] hover:text-[var(--task-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
          >
            <X className="size-4" />
          </button>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          className="mt-2 h-auto border-0 bg-transparent px-0 text-xl font-semibold leading-snug tracking-tight text-[var(--task-text)] shadow-none focus-visible:ring-0 sm:text-2xl"
          aria-label="Task title"
        />

        <button
          type="button"
          onClick={() =>
            isCompleted ? m.reopen.mutate([task.id]) : m.complete.mutate([task.id])
          }
          className={cn(
            "mt-4 inline-flex items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors duration-150",
            "text-[var(--task-text-secondary)] hover:text-[var(--task-text)]",
          )}
        >
          <span
            className={cn(
              "grid size-[18px] shrink-0 place-items-center rounded-full border transition-all duration-150",
              isCompleted
                ? "border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
                : "border-[var(--task-checkbox-border)] hover:border-[var(--task-accent)]",
            )}
          >
            {isCompleted ? <Check className="size-3" /> : null}
          </span>
          <span>{isCompleted ? "Completed" : "Complete"}</span>
        </button>

        <div className="my-5 h-px bg-[var(--task-border)]" />

        <div className="space-y-5">
          <DetailField label="Due date">
            <Input
              type="date"
              value={task.dueAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                m.update.mutate({
                  id: task.id,
                  input: { dueAt: e.target.value || undefined },
                })
              }
              className="h-9 max-w-[240px] border-[var(--task-border)] bg-[var(--task-surface)] text-sm text-[var(--task-text)]"
            />
            {due ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--task-text-secondary)]">
                <Clock className="size-3.5" />
                {due}
              </p>
            ) : null}
          </DetailField>

          <DetailField label="Priority">
            <Select
              value={task.priority}
              onValueChange={(v) =>
                m.update.mutate({ id: task.id, input: { priority: v as TaskPriority } })
              }
            >
              <SelectTrigger className="h-9 w-full max-w-[240px] border-[var(--task-border)] bg-[var(--task-surface)] text-sm capitalize text-[var(--task-text)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["low", "normal", "high", "urgent"] as TaskPriority[]).map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DetailField>

          <DetailField label="List">
            <p className="text-sm capitalize text-[var(--task-text-secondary)]">{listLabel(task)}</p>
          </DetailField>

          <DetailField label="Notes">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              placeholder="Add a note..."
              rows={4}
              className="resize-none border-[var(--task-border)] bg-[var(--task-surface)] text-sm text-[var(--task-text)] placeholder:text-[var(--task-text-muted)]"
            />
          </DetailField>
        </div>

        <div className="my-5 h-px bg-[var(--task-border)]" />

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <MetaRow label="Created" value={formatDetailDate(task.createdAt)} />
          <MetaRow label="Updated" value={formatDetailDate(task.updatedAt)} />
        </div>

        {task.progress != null && task.progress > 0 ? (
          <div className="mt-5">
            <Meter value={task.progress} />
            <p className="mt-1.5 text-xs text-[var(--task-text-muted)]">{task.progress}% complete</p>
          </div>
        ) : null}

        {task.aiContext?.summary ? (
          <p className="mt-5 flex gap-2.5 border-l-2 border-[var(--task-accent)]/40 pl-3 text-sm leading-relaxed text-[var(--task-text-secondary)]">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--task-accent)]" />
            <span>{task.aiContext.summary}</span>
          </p>
        ) : null}

        <div className="mt-6">
          <SectionLabel>Steps</SectionLabel>
          <div className="mt-2 space-y-1">
            {subtasks.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => m.toggleSubtask.mutate([task.id, s.id])}
                  className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors duration-150 hover:bg-[var(--task-surface-hover)]"
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded border",
                      s.completed
                        ? "border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
                        : "border-[var(--task-checkbox-border)]",
                    )}
                  >
                    {s.completed ? <Check className="size-2.5" /> : null}
                  </span>
                  <span
                    className={cn(
                      "text-sm text-[var(--task-text)]",
                      s.completed && "text-[var(--task-completed)] line-through",
                    )}
                  >
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
                className="h-9 w-full rounded-md border border-[var(--task-border)] bg-[var(--task-surface)] px-2.5 text-sm text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
              />
            </form>
          </div>

        {checklist.length ? (
          <div className="mt-6">
            <SectionLabel>Checklist</SectionLabel>
            <div className="mt-2 space-y-1">
              {checklist.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => m.toggleChecklistItem.mutate([task.id, c.id])}
                  className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors duration-150 hover:bg-[var(--task-surface-hover)]"
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded border",
                      c.completed
                        ? "border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
                        : "border-[var(--task-checkbox-border)]",
                    )}
                  >
                    {c.completed ? <Check className="size-2.5" /> : null}
                  </span>
                  <span
                    className={cn(
                      "text-sm text-[var(--task-text)]",
                      c.completed && "text-[var(--task-completed)] line-through",
                    )}
                  >
                    {c.title}
                  </span>
                  {c.required ? <Pill tone="muted">required</Pill> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {dependencies.length ? (
          <div className="mt-6">
            <SectionLabel>Dependencies</SectionLabel>
            <div className="mt-2 space-y-1.5">
              {dependencies.map((d) => (
                <p key={d.id} className="text-sm text-[var(--task-text-secondary)]">
                  <span className="text-[var(--task-text)]">{d.title}</span> —{" "}
                  {d.type.replace(/_/g, " ")} · {d.status.replace(/_/g, " ")}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {links.length || attachments.length || entityLinks.length ? (
          <div className="mt-6">
            <SectionLabel>Related</SectionLabel>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entityLinks.map((l) => (
                <span
                  key={`${l.entityType}-${l.entityId}`}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--task-border)] px-2 py-1 text-xs text-[var(--task-text-secondary)]"
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
                  className="flex items-center gap-1.5 rounded-md border border-[var(--task-border)] px-2 py-1 text-xs text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-surface-hover)]"
                >
                  <Link2 className="size-3" />
                  {l.title ?? l.url}
                </a>
              ))}
              {attachments.map((a) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--task-border)] px-2 py-1 text-xs text-[var(--task-text-secondary)]"
                >
                  <Paperclip className="size-3" />
                  {a.filename}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <SectionLabel>Comments</SectionLabel>
          <div className="mt-2 space-y-2.5">
            {comments.length ? (
              comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <p className="text-[var(--task-text)]">{c.body}</p>
                  <p className="mt-0.5 text-xs text-[var(--task-text-muted)]">
                    {c.authorName} · {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--task-text-muted)]">No comments yet.</p>
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
              className="h-9 w-full rounded-md border border-[var(--task-border)] bg-[var(--task-surface)] px-2.5 text-sm text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
            />
          </form>
        </div>

        {timeline.length ? (
          <div className="mt-6">
            <SectionLabel>History</SectionLabel>
            <div className="mt-2 space-y-2">
              {timeline.slice(0, 8).map((h) => (
                <p
                  key={h.id}
                  className="flex gap-2.5 text-xs leading-relaxed text-[var(--task-text-muted)]"
                >
                  <History className="mt-0.5 size-3 shrink-0" />
                  <span>
                    <span className="text-[var(--task-text-secondary)]">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>{" "}
                    — {h.description}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1 border-t border-[var(--task-border)] px-5 py-3 sm:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--task-text-muted)] hover:bg-[var(--task-surface-hover)] hover:text-[var(--task-text)]"
              aria-label="Task actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px]">
            {!isCompleted ? (
              <DropdownMenuItem onClick={() => m.complete.mutate([task.id])}>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => m.reopen.mutate([task.id])}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reopen
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => m.pin.mutate([task.id, !task.pinned])}>
              <Pin className="mr-2 h-4 w-4" />
              {task.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => m.favorite.mutate([task.id, !task.favorite])}>
              <Star className="mr-2 h-4 w-4" />
              {task.favorite ? "Unfavorite" : "Favorite"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => m.duplicate.mutate([task.id])}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            {task.archived ? (
              <DropdownMenuItem onClick={() => m.restore.mutate([task.id])}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => m.archive.mutate([task.id])}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            <Can permission={PERM.TASKS_DELETE}>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (!window.confirm("Delete this task?")) return;
                  m.remove.mutate([task.id], { onSuccess: () => onClose() });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete task
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--task-text-muted)]">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--task-text-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-[var(--task-text-secondary)]">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--task-text-muted)]">
      {children}
    </p>
  );
}

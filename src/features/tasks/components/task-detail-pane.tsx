import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Check,
  Copy,
  MoreHorizontal,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Can } from "@/features/capabilities/can";
import { TaskTagPicker } from "@/features/tasks/components/task-tag-picker";
import { formatDueLabel, isOverdue } from "@/features/tasks/lib/task-dates";
import { isTaskArchived, isTaskCompleted } from "@/features/tasks/lib/task-filters";
import { getVisibleTaskTagId } from "@/features/tasks/lib/task-tags";
import { useTaskTagAssignment, useTaskTagRegistry } from "@/hooks/use-task-tags";
import type { useTaskMutations } from "@/hooks/use-tasks";
import { PERM } from "@/lib/permissions";
import type { TaskDetail, TaskPriority } from "@/lib/api/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type TaskDraft = {
  title: string;
  description: string;
  dueAt: string;
  priority: TaskPriority;
};

function draftFromTask(task: TaskDetail): TaskDraft {
  return {
    title: task.title,
    description: task.description ?? "",
    dueAt: task.dueAt?.slice(0, 10) ?? "",
    priority: task.priority,
  };
}

function draftsEqual(a: TaskDraft, b: TaskDraft): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.dueAt === b.dueAt &&
    a.priority === b.priority
  );
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
  const [draft, setDraft] = useState(() => draftFromTask(task));
  const [subDraft, setSubDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [discardOpen, setDiscardOpen] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  const tags = useTaskTagRegistry();
  const { assignTag, createAndAssign } = useTaskTagAssignment();

  const baseline = useMemo(() => draftFromTask(task), [task]);
  const isDirty = !draftsEqual(draft, baseline);
  const done = isTaskCompleted(task);
  const archived = isTaskArchived(task);
  const due = formatDueLabel(task.dueAt);
  const overdue = isOverdue(task) && !done;
  const visibleTagId = getVisibleTaskTagId(task);

  useEffect(() => {
    setDraft(draftFromTask(task));
  }, [task.id, task.title, task.description, task.dueAt, task.priority]);

  const requestClose = useCallback(() => {
    if (isDirty) setDiscardOpen(true);
    else onClose();
  }, [isDirty, onClose]);

  const handleSave = () => {
    const nextTitle = draft.title.trim();
    if (!nextTitle) {
      toast.error("Task title is required.");
      return;
    }

    const input: Record<string, unknown> = {};
    if (nextTitle !== task.title) input.title = nextTitle;
    if (draft.description.trim() !== (task.description ?? "")) {
      input.description = draft.description.trim() || undefined;
    }
    const dueValue = draft.dueAt || undefined;
    if ((dueValue ?? "") !== (task.dueAt?.slice(0, 10) ?? "")) {
      input.dueAt = dueValue;
    }
    if (draft.priority !== task.priority) input.priority = draft.priority;

    if (!Object.keys(input).length) {
      onClose();
      return;
    }

    m.update.mutate(
      { id: task.id, input },
      {
        onSuccess: () => {
          toast.success("Task saved");
          onClose();
        },
        onError: () => toast.error("Changes could not be saved."),
      },
    );
  };

  const setTodayDue = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setDraft((d) => ({ ...d, dueAt: today }));
  };

  const subtasks = task.subtasks ?? [];
  const comments = task.comments ?? [];

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <header className="shrink-0 border-b border-[var(--task-border)] px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--task-accent)]">
              Task
            </p>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="More task actions"
                    className="grid size-8 place-items-center rounded-lg text-[var(--task-text-muted)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem onClick={() => m.favorite.mutate([task.id, !task.favorite])}>
                    <Star className="mr-2 size-4" />
                    {task.favorite ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => m.duplicate.mutate([task.id])}>
                    <Copy className="mr-2 size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {archived ? (
                    <DropdownMenuItem onClick={() => m.restore.mutate([task.id])}>
                      <ArchiveRestore className="mr-2 size-4" />
                      Unarchive
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => m.archive.mutate([task.id])}>
                      <Archive className="mr-2 size-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <Can permission={PERM.TASKS_DELETE}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if (!window.confirm("Delete this task?")) return;
                        m.remove.mutate([task.id], { onSuccess: () => onClose() });
                      }}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </Can>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close task editor"
                className="grid size-8 place-items-center rounded-lg text-[var(--task-text-muted)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <textarea
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            rows={Math.min(4, Math.max(1, Math.ceil(draft.title.length / 42)))}
            aria-label="Task title"
            className={cn(
              "mt-4 w-full resize-none bg-transparent text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--task-text)] outline-none sm:text-[1.625rem]",
              titleFocused && "ring-0",
            )}
          />

          <button
            type="button"
            onClick={() => (done ? m.reopen.mutate([task.id]) : m.complete.mutate([task.id]))}
            className="mt-4 inline-flex items-center gap-2.5 rounded-lg py-1 text-[15px] text-[var(--task-text-secondary)] transition-colors hover:text-[var(--task-text)]"
          >
            <span
              className={cn(
                "grid size-[18px] shrink-0 place-items-center rounded-full border-2 transition-all",
                done
                  ? "border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
                  : "border-[var(--task-checkbox-border)]",
              )}
            >
              {done ? <Check className="size-3" /> : null}
            </span>
            {done ? "Completed" : "Not completed"}
          </button>
        </header>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <PanelField label="Due date">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={draft.dueAt}
                  onChange={(e) => setDraft((d) => ({ ...d, dueAt: e.target.value }))}
                  className="h-9 rounded-lg border border-[var(--task-border)] bg-[var(--task-surface-secondary)] px-3 text-sm text-[var(--task-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
                />
                <button
                  type="button"
                  onClick={setTodayDue}
                  className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--task-accent)] transition-colors hover:bg-[var(--task-accent-soft)]"
                >
                  Today
                </button>
              </div>
              {due ? (
                <p
                  className={cn(
                    "mt-2 text-[13px]",
                    overdue ? "font-medium text-[var(--task-overdue)]" : "text-[var(--task-text-muted)]",
                  )}
                >
                  {overdue ? "Overdue · " : ""}
                  {due}
                </p>
              ) : null}
            </PanelField>

            <PanelField label="Priority">
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft((d) => ({ ...d, priority: v as TaskPriority }))}
              >
                <SelectTrigger className="h-9 w-full max-w-[240px] border-[var(--task-border)] bg-[var(--task-surface-secondary)] text-sm capitalize">
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
            </PanelField>

            <PanelField label="Tag">
              <TaskTagPicker
                tags={tags}
                value={visibleTagId}
                onSelect={(tagId) => assignTag(task.id, tagId)}
                onCreate={(name) => createAndAssign(task.id, name)}
                placeholder="Select tag"
              />
            </PanelField>

            <PanelField label="Notes">
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Add a note…"
                rows={draft.description.trim() ? 5 : 3}
                className="resize-y min-h-[80px] border-[var(--task-border)] bg-[var(--task-surface-secondary)] text-[15px] leading-relaxed text-[var(--task-text)] placeholder:text-[var(--task-text-muted)]"
              />
            </PanelField>

            <div>
              <SectionLabel>Steps</SectionLabel>
              <div className="mt-3 space-y-1">
                {subtasks.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => m.toggleSubtask.mutate([task.id, s.id])}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--task-hover)]"
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
                        "text-[15px] text-[var(--task-text)]",
                        s.completed && "text-[var(--task-text-muted)] line-through",
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
                  className="h-9 w-full rounded-lg border border-[var(--task-border)] bg-[var(--task-surface-secondary)] px-3 text-sm text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
                />
              </form>
            </div>

            <div>
              <SectionLabel>Comments</SectionLabel>
              <div className="mt-3 space-y-3">
                {comments.length ? (
                  comments.map((c) => (
                    <div key={c.id} className="text-[15px]">
                      <p className="text-[var(--task-text)]">{c.body}</p>
                      <p className="mt-1 text-[12px] text-[var(--task-text-muted)]">
                        {c.authorName} · {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[var(--task-text-muted)]">No comments yet.</p>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentDraft.trim()) return;
                  m.comment.mutate([task.id, commentDraft.trim()]);
                  setCommentDraft("");
                }}
                className="mt-3"
              >
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write a comment…"
                  className="h-9 w-full rounded-lg border border-[var(--task-border)] bg-[var(--task-surface-secondary)] px-3 text-sm text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
                />
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-[var(--task-border)] px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={isDirty ? () => setDraft(baseline) : requestClose}
              className="text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={m.update.isPending || !draft.title.trim()}
              className="bg-[var(--task-accent)] text-[#041018] hover:bg-[var(--task-accent)]/90"
            >
              {m.update.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </footer>
      </div>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="border-[var(--task-border)] bg-[var(--task-surface)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Discard them or keep editing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false);
                onClose();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PanelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--task-text-muted)]">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--task-text-muted)]">
      {children}
    </p>
  );
}

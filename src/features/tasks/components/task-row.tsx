import { Check, Loader2, MoreHorizontal, Star } from "lucide-react";
import { formatDueLabel, isOverdue } from "@/features/tasks/lib/task-dates";
import { isTaskCompleted } from "@/features/tasks/lib/task-filters";
import type { TaskSummary } from "@/lib/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function taskMetadata(task: TaskSummary): string {
  const parts: string[] = [task.priority];
  const overdue = isOverdue(task);
  if (overdue && !isTaskCompleted(task)) parts.push("overdue");
  const due = formatDueLabel(task.dueAt);
  if (due) parts.push(due.toLowerCase());
  if (task.status === "inbox") parts.push("inbox");
  else if (task.status !== "completed") parts.push(task.status.replace(/_/g, " "));
  if (task.projectName) parts.push(task.projectName);
  return parts.join(" · ");
}

export function TaskRow({
  task,
  selected,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onDelete,
  canUpdate,
  canDelete,
}: {
  task: TaskSummary;
  selected?: boolean;
  onOpen: () => void;
  onToggleComplete: () => void;
  onToggleFavorite?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}) {
  const done = isTaskCompleted(task);
  const inProgress = task.status === "in_progress";
  const overdue = isOverdue(task) && !done;
  const metadata = taskMetadata(task);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors",
        selected && "bg-[var(--task-accent-soft)]",
        !selected && "hover:bg-[var(--task-hover)]",
      )}
    >
      <button
        type="button"
        onClick={onToggleComplete}
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        className={cn(
          "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors",
          done
            ? "border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
            : inProgress
              ? "border-[var(--task-accent)] text-[var(--task-accent)]"
              : "border-[var(--task-checkbox-border)] text-transparent hover:border-[var(--task-accent)]",
        )}
      >
        {inProgress && !done ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Check className={cn("size-3", !done && "opacity-0 group-hover:opacity-40")} />
        )}
      </button>

      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p
          className={cn(
            "text-[15px] leading-snug font-medium text-[var(--task-text)]",
            done && "text-[var(--task-completed)] line-through decoration-[var(--task-completed)]",
          )}
        >
          {task.title}
        </p>
        {metadata ? (
          <p className="mt-0.5 text-xs text-[var(--task-text-secondary)]">
            <span
              className={cn(
                "inline-block size-1.5 rounded-full align-middle mr-1.5",
                task.priority === "urgent" && "bg-[var(--task-priority-urgent)]",
                task.priority === "high" && "bg-[var(--task-priority-high)]",
                task.priority === "normal" && "bg-[var(--task-priority-normal)]",
                task.priority === "low" && "bg-[var(--task-priority-low)]",
              )}
              aria-hidden
            />
            <span className={overdue ? "text-[var(--task-overdue)]" : undefined}>{metadata}</span>
          </p>
        ) : null}
      </button>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {canUpdate && onToggleFavorite ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={task.favorite ? "Remove star" : "Star task"}
            className={cn(
              "grid size-8 place-items-center rounded-md text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]",
              task.favorite && "text-[var(--task-accent)] opacity-100",
            )}
          >
            <Star className={cn("size-4", task.favorite && "fill-current")} />
          </button>
        ) : null}

        {(canUpdate || canDelete) && (onArchive || onDelete) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="grid size-8 place-items-center rounded-md text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {canUpdate && onArchive ? (
                <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
              ) : null}
              {canDelete && onDelete ? (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}

/** @deprecated Use TaskRow */
export function TaskTimelineItem(props: Parameters<typeof TaskRow>[0]) {
  return <TaskRow {...props} />;
}

/** @deprecated Use TaskRow */
export function TaskListRow(props: Parameters<typeof TaskRow>[0]) {
  return <TaskRow {...props} />;
}

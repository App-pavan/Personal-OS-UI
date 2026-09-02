import { useState } from "react";
import { Check, Flag, Loader2, MoreHorizontal, Star } from "lucide-react";
import { formatDueLabel, isOverdue } from "@/features/tasks/lib/task-dates";
import { isTaskCompleted } from "@/features/tasks/lib/task-filters";
import { taskRowGrid } from "@/features/tasks/lib/tasks-ui";
import type { TaskPriority, TaskSummary } from "@/lib/api/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return "var(--task-priority-urgent)";
    case "high":
      return "var(--task-priority-high)";
    case "normal":
      return "var(--task-priority-normal)";
    default:
      return "var(--task-priority-low)";
  }
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
  compact?: boolean;
}) {
  const [completing, setCompleting] = useState(false);
  const done = isTaskCompleted(task);
  const inProgress = task.status === "in_progress";
  const overdue = isOverdue(task) && !done;
  const due = formatDueLabel(task.dueAt);

  const handleComplete = () => {
    if (done) {
      onToggleComplete();
      return;
    }
    setCompleting(true);
    window.setTimeout(() => {
      onToggleComplete();
      setCompleting(false);
    }, 180);
  };

  return (
    <div
      className={cn(
        taskRowGrid,
        "group rounded-xl border border-transparent px-1 py-3.5 transition-all duration-200 sm:py-4",
        selected
          ? "border-[var(--task-accent)]/25 bg-[var(--task-selected)]"
          : "hover:border-[var(--task-border)] hover:bg-[var(--task-surface-elevated)]",
        completing && "pointer-events-none scale-[0.99] opacity-40",
      )}
    >
      <button
        type="button"
        onClick={handleComplete}
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        className={cn(
          "grid size-8 place-items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
          done || completing
            ? "border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
            : inProgress
              ? "border-[var(--task-accent)] text-[var(--task-accent)]"
              : "border-[var(--task-checkbox-border)] hover:border-[var(--task-accent)] hover:bg-[var(--task-accent-soft)]",
        )}
      >
        {inProgress && !done && !completing ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Check
            className={cn(
              "size-3.5 transition-all duration-200",
              done || completing ? "scale-100 opacity-100" : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-60",
            )}
          />
        )}
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)] rounded-md"
      >
        <p className="text-base leading-snug font-medium text-[var(--task-text)] sm:text-[17px]">
          {task.title}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--task-text-secondary)] sm:text-sm">
          {overdue ? (
            <span className="font-medium text-[var(--task-overdue)]">Overdue</span>
          ) : due ? (
            due
          ) : (
            "No date"
          )}
        </p>
      </button>

      <div className="relative flex items-start justify-end pt-0.5">
        <span
          className="grid size-8 place-items-center text-[var(--task-text-muted)]"
          title={`${task.priority} priority`}
          aria-label={`${task.priority} priority`}
        >
          <Flag className="size-4" style={{ color: priorityColor(task.priority) }} strokeWidth={1.75} />
        </span>

        <div className="absolute top-0 right-8 flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          {canUpdate && onToggleFavorite ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              aria-label={task.favorite ? "Remove star" : "Star task"}
              className={cn(
                "grid size-8 place-items-center rounded-lg text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)]",
                task.favorite && "text-[var(--task-accent)] opacity-100",
              )}
            >
              <Star className={cn("size-4", task.favorite && "fill-current")} strokeWidth={1.75} />
            </button>
          ) : null}

          {(canUpdate || canDelete) && (onArchive || onDelete) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More actions"
                  className="grid size-8 place-items-center rounded-lg text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)]"
                >
                  <MoreHorizontal className="size-4" strokeWidth={1.75} />
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
    </div>
  );
}

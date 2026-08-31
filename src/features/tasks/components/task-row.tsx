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

type MetaPart = { text: string; tone?: "overdue" | "default" };

function buildMetadataParts(task: TaskSummary): MetaPart[] {
  const parts: MetaPart[] = [{ text: task.priority }];
  const overdue = isOverdue(task) && !isTaskCompleted(task);
  if (overdue) parts.push({ text: "overdue", tone: "overdue" });
  const due = formatDueLabel(task.dueAt);
  if (due) parts.push({ text: due.toLowerCase() });
  if (task.status === "inbox") parts.push({ text: "inbox" });
  else if (task.status !== "completed") parts.push({ text: task.status.replace(/_/g, " ") });
  if (task.projectName) parts.push({ text: task.projectName });
  return parts;
}

function TaskMetadata({ parts, done }: { parts: MetaPart[]; done: boolean }) {
  if (!parts.length) return null;
  return (
    <p
      className={cn(
        "mt-0.5 text-[11px] leading-relaxed",
        done ? "text-[var(--task-completed)]" : "text-[var(--task-text-secondary)]",
      )}
    >
      {parts.map((part, index) => (
        <span key={`${part.text}-${index}`}>
          {index > 0 ? <span className="mx-1 opacity-40">·</span> : null}
          <span
            className={cn(
              part.tone === "overdue" && !done && "font-medium text-[var(--task-overdue)]",
            )}
          >
            {part.text}
          </span>
        </span>
      ))}
    </p>
  );
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
  compact,
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
  const done = isTaskCompleted(task);
  const inProgress = task.status === "in_progress";
  const metadataParts = buildMetadataParts(task);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border border-transparent px-2.5 transition-[background-color,border-color,box-shadow] duration-150",
        compact ? "py-2" : "py-2.5",
        selected
          ? "border-[var(--task-accent)]/25 bg-[var(--task-accent-soft)] shadow-[var(--task-shadow-sm)]"
          : "hover:border-[var(--task-border-subtle)] hover:bg-[var(--task-surface-elevated)] hover:shadow-[var(--task-shadow-sm)]",
        done && !selected && "opacity-75 hover:opacity-90",
      )}
    >
      <button
        type="button"
        onClick={onToggleComplete}
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
          done
            ? "scale-100 border-[var(--task-accent)] bg-[var(--task-accent)] text-[#041018]"
            : inProgress
              ? "border-[var(--task-accent)] text-[var(--task-accent)]"
              : "border-[var(--task-checkbox-border)] text-transparent hover:border-[var(--task-accent)] hover:bg-[var(--task-accent-soft)]",
        )}
      >
        {inProgress && !done ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Check
            className={cn(
              "size-3 transition-all duration-150",
              done ? "scale-100 opacity-100" : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-50",
            )}
          />
        )}
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)] rounded-sm"
      >
        <p
          className={cn(
            "text-[15px] leading-snug font-medium text-[var(--task-text)]",
            done && "font-normal text-[var(--task-completed)] line-through decoration-[var(--task-completed)]/70",
          )}
        >
          {task.title}
        </p>
        <TaskMetadata parts={metadataParts} done={done} />
      </button>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        {canUpdate && onToggleFavorite ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            aria-label={task.favorite ? "Remove star" : "Star task"}
            className={cn(
              "grid size-8 place-items-center rounded-md text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]",
              task.favorite && "text-[var(--task-accent)] opacity-100",
            )}
          >
            <Star className={cn("size-[15px]", task.favorite && "fill-current")} strokeWidth={1.75} />
          </button>
        ) : null}

        {(canUpdate || canDelete) && (onArchive || onDelete) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="grid size-8 place-items-center rounded-md text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
              >
                <MoreHorizontal className="size-[15px]" strokeWidth={1.75} />
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

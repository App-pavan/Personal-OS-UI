import { Check, Loader2 } from "lucide-react";
import { formatTaskTime, isOverdue } from "@/features/tasks/lib/task-dates";
import type { TaskPriority, TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const priorityDot: Record<TaskPriority, string> = {
  urgent: "bg-destructive",
  high: "bg-amber-400",
  normal: "bg-primary/70",
  low: "bg-muted-foreground/50",
};

export function TaskTimelineItem({
  task,
  selected,
  onOpen,
  onToggleComplete,
}: {
  task: TaskSummary;
  selected?: boolean;
  onOpen: () => void;
  onToggleComplete: () => void;
}) {
  const done = task.status === "completed" || task.status === "cancelled";
  const inProgress = task.status === "in_progress";
  const overdue = isOverdue(task);
  const time = formatTaskTime(task.dueAt);
  const statusLabel = task.status.replace(/_/g, " ");

  return (
    <div
      className={cn(
        "group animate-rise grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-hairline/60 hover:bg-surface/40",
        selected && "border-primary/30 bg-primary/5",
        done && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onToggleComplete}
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
          done
            ? "border-transparent bg-primary text-primary-foreground"
            : inProgress
              ? "border-primary/50 text-primary"
              : "border-input text-transparent hover:border-primary hover:text-primary",
        )}
      >
        {inProgress && !done ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}
      </button>
      <button type="button" onClick={onOpen} className="min-w-0 text-left">
        <div className="flex items-start gap-2">
          <span
            className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", priorityDot[task.priority] ?? priorityDot.normal)}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            {time ? (
              <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{time}</p>
            ) : null}
            <p className={cn("text-sm leading-snug", done && "line-through")}>{task.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              <span className={overdue ? "text-destructive" : undefined}>
                {task.priority}
                {overdue ? " · overdue" : ""}
              </span>
              {" · "}
              {statusLabel}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

export function TaskListRow({
  task,
  selected,
  onOpen,
  onToggleComplete,
}: {
  task: TaskSummary;
  selected?: boolean;
  onOpen: () => void;
  onToggleComplete: () => void;
}) {
  return (
    <TaskTimelineItem
      task={task}
      selected={selected}
      onOpen={onOpen}
      onToggleComplete={onToggleComplete}
    />
  );
}

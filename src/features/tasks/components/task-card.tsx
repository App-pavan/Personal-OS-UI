import { Check, Clock, Pin, Star } from "lucide-react";
import { Pill } from "@/components/os/primitives";
import { formatDueLabel } from "@/features/tasks/lib/task-buckets";
import type { TaskPriority, TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const priorityTone: Record<TaskPriority, "danger" | "warning" | "info" | "muted"> = {
  urgent: "danger",
  high: "warning",
  normal: "info",
  low: "muted",
};

const columnAccent: Record<string, string> = {
  inbox: "from-slate-500/10 to-transparent border-slate-400/20",
  today: "from-cyan-500/15 to-transparent border-cyan-400/30",
  active: "from-violet-500/12 to-transparent border-violet-400/25",
  done: "from-emerald-500/10 to-transparent border-emerald-400/20",
  overdue: "from-rose-500/15 to-transparent border-rose-400/30",
  tomorrow: "from-amber-500/12 to-transparent border-amber-400/25",
  this_week: "from-blue-500/10 to-transparent border-blue-400/20",
  later: "from-slate-500/8 to-transparent border-slate-400/15",
  no_date: "from-slate-500/8 to-transparent border-slate-400/15",
};

export function TaskCard({
  task,
  selected,
  accent = "inbox",
  onOpen,
  onToggleComplete,
}: {
  task: TaskSummary;
  selected?: boolean;
  accent?: string;
  onOpen: () => void;
  onToggleComplete: () => void;
}) {
  const done = task.status === "completed";
  const due = formatDueLabel(task.dueAt);
  const tone = priorityTone[task.priority] ?? "muted";

  return (
    <article
      className={cn(
        "group animate-rise rounded-xl border bg-gradient-to-br p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        columnAccent[accent] ?? columnAccent.inbox,
        selected && "ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
            done
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-input text-transparent hover:border-primary hover:text-primary",
          )}
        >
          <Check className="size-3" />
        </button>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <p className={cn("text-sm leading-snug font-medium", done && "text-muted-foreground line-through")}>
            {task.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Pill tone={tone}>{task.priority}</Pill>
            {due ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                {due}
              </span>
            ) : null}
            {task.pinned ? <Pin className="size-3 text-primary" /> : null}
            {task.favorite ? <Star className="size-3 fill-accent text-accent" /> : null}
          </div>
          {task.subtaskCount ? (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {task.subtaskCompletedCount}/{task.subtaskCount} steps
            </p>
          ) : null}
        </button>
      </div>
    </article>
  );
}

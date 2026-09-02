import { cn } from "@/lib/utils";

export function TaskProgress({
  completed,
  total,
  className,
}: {
  completed: number;
  total: number;
  className?: string;
}) {
  if (total <= 0) return null;

  const pct = Math.round((completed / total) * 100);

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-[var(--task-text)]">Progress</p>
        <p className="text-sm tabular-nums text-[var(--task-text-secondary)]">
          {completed}/{total} completed
        </p>
      </div>
      <div
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--task-progress-track)]"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} of ${total} tasks completed`}
      >
        <div
          className="h-full rounded-full bg-[var(--task-progress-fill)] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

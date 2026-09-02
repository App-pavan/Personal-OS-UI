import { taskSummaryText } from "@/features/tasks/lib/tasks-ui";
import { cn } from "@/lib/utils";

export function TasksSummaryStats({
  today,
  overdue,
  upcoming,
}: {
  today: number;
  overdue: number;
  upcoming: number;
}) {
  return (
    <p className={cn(taskSummaryText, "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1")}>
      <span>
        <span className="font-medium tabular-nums text-[var(--task-text)]">{today}</span> today
      </span>
      <span className="text-[var(--task-border)]" aria-hidden>
        ·
      </span>
      <span>
        <span
          className={
            overdue > 0
              ? "font-medium tabular-nums text-[var(--task-overdue)]"
              : "font-medium tabular-nums text-[var(--task-text)]"
          }
        >
          {overdue}
        </span>{" "}
        overdue
      </span>
      <span className="text-[var(--task-border)]" aria-hidden>
        ·
      </span>
      <span>
        <span className="font-medium tabular-nums text-[var(--task-text)]">{upcoming}</span> upcoming
      </span>
    </p>
  );
}

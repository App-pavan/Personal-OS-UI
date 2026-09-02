import type { ExecutionHistoryGroup } from "@/features/tasks/lib/execution-history";
import { taskSectionTitle } from "@/features/tasks/lib/tasks-ui";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function ExecutionHistoryPanel({
  groups,
  onOpen,
}: {
  groups: ExecutionHistoryGroup[];
  onOpen: (id: string) => void;
}) {
  return (
    <div>
      <p className={cn(taskSectionTitle, "mb-1 text-[var(--task-text-muted)]")}>Execution</p>
      <h2 className="text-base font-semibold text-[var(--task-text)]">Timeline</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--task-text-muted)]">
        What you&apos;ve completed
      </p>

      {!groups.length ? (
        <p className="mt-8 text-[13px] leading-relaxed text-[var(--task-text-muted)]">
          Completed tasks will appear here as you finish work.
        </p>
      ) : (
        <div className="relative mt-8 space-y-8">
          <div
            className="absolute top-1 bottom-1 left-[5px] w-px bg-[var(--task-timeline-muted)]"
            aria-hidden
          />
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="mb-4 pl-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--task-text-muted)]">
                {group.label}
              </h3>
              <ul className="space-y-4">
                {group.entries.map(({ task, timeLabel }) => (
                  <TimelineEvent
                    key={task.id}
                    task={task}
                    timeLabel={timeLabel}
                    onOpen={() => onOpen(task.id)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineEvent({
  task,
  timeLabel,
  onOpen,
}: {
  task: TaskSummary;
  timeLabel: string;
  onOpen: () => void;
}) {
  return (
    <li className="relative pl-6">
      <span
        className="absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-[var(--task-timeline)] bg-[var(--task-bg)]"
        aria-hidden
      />
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
      >
        <p className="text-[14px] leading-snug font-medium text-[var(--task-text-secondary)] line-through decoration-[var(--task-completed)]/60">
          {task.title}
        </p>
        {timeLabel ? (
          <p className="mt-0.5 text-[12px] text-[var(--task-text-muted)]">{timeLabel}</p>
        ) : null}
      </button>
    </li>
  );
}

import { History } from "lucide-react";
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
        <div className="mt-10 text-center xl:text-left">
          <History
            className="mx-auto mb-3 size-8 text-[var(--task-text-muted)] opacity-40 xl:mx-0"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-[13px] leading-relaxed text-[var(--task-text-muted)]">
            Your completed work will appear here.
          </p>
        </div>
      ) : (
        <div className="relative mt-8">
          <div
            className="absolute top-2 bottom-2 left-[7px] w-px bg-[var(--task-timeline-muted)]"
            aria-hidden
          />
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={group.key}>
                <h3 className="mb-4 pl-8 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--task-text-muted)]">
                  {group.label}
                </h3>
                <ul className="space-y-5">
                  {group.entries.map(({ task, metaLabel }) => (
                    <TimelineEvent
                      key={task.id}
                      task={task}
                      metaLabel={metaLabel}
                      onOpen={() => onOpen(task.id)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineEvent({
  task,
  metaLabel,
  onOpen,
}: {
  task: TaskSummary;
  metaLabel: string;
  onOpen: () => void;
}) {
  return (
    <li className="relative pl-8">
      <span
        className="absolute top-2 left-0 size-[15px] rounded-full border-2 border-[var(--task-timeline)] bg-[var(--task-bg)]"
        aria-hidden
      />
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-lg py-1 text-left transition-colors duration-150 hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
      >
        <p className="text-[15px] leading-snug font-medium text-[var(--task-text-secondary)] line-through decoration-[var(--task-completed)]/60">
          {task.title}
        </p>
        <p className="mt-1 text-[12px] text-[var(--task-text-muted)]">{metaLabel}</p>
      </button>
    </li>
  );
}

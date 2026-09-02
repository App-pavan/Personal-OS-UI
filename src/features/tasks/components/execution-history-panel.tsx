import type { CSSProperties } from "react";
import { History } from "lucide-react";
import type { ExecutionHistoryGroup } from "@/features/tasks/lib/execution-history";
import { isTaskCompleted } from "@/features/tasks/lib/task-filters";
import { taskSectionTitle } from "@/features/tasks/lib/tasks-ui";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const TIMELINE_X = 7;

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
        Completed work and archived tasks
      </p>

      {!groups.length ? (
        <div className="mt-10 text-center xl:text-left">
          <History
            className="mx-auto mb-3 size-8 text-[var(--task-text-muted)] opacity-40 xl:mx-0"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-[13px] leading-relaxed text-[var(--task-text-muted)]">
            Your activity will appear here as you complete or archive tasks.
          </p>
        </div>
      ) : (
        <div className="relative mt-8">
          <div
            className="absolute top-3 bottom-3 w-px bg-[var(--task-timeline-muted)]"
            style={{ left: TIMELINE_X }}
            aria-hidden
          />
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.key}>
                <div className="relative mb-5">
                  <span
                    className="absolute top-1/2 z-10 size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--task-accent)] shadow-[0_0_0_3px_var(--task-bg)]"
                    style={{ left: TIMELINE_X }}
                    aria-hidden
                  />
                  <h3 className="pl-[calc(var(--timeline-x,28px))] text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--task-text-muted)]" style={{ "--timeline-x": `${TIMELINE_X + 20}px` } as CSSProperties}>
                    {group.label}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {group.entries.map(({ task, metaLabel, secondaryMeta }, index) => (
                    <TimelineTaskEntry
                      key={task.id}
                      task={task}
                      metaLabel={metaLabel}
                      secondaryMeta={secondaryMeta}
                      isLast={index === group.entries.length - 1}
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

function TimelineTaskEntry({
  task,
  metaLabel,
  secondaryMeta,
  isLast,
  onOpen,
}: {
  task: TaskSummary;
  metaLabel: string;
  secondaryMeta?: string;
  isLast: boolean;
  onOpen: () => void;
}) {
  const completed = isTaskCompleted(task);

  return (
    <li className="relative">
      <span
        className="absolute top-[0.85rem] h-px bg-[var(--task-timeline-muted)]"
        style={{ left: TIMELINE_X, width: 14 }}
        aria-hidden
      />
      <span
        className="absolute top-[0.65rem] text-[11px] leading-none text-[var(--task-timeline-muted)]"
        style={{ left: TIMELINE_X + 12 }}
        aria-hidden
      >
        {isLast ? "└" : "├"}
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-lg py-1 pl-[calc(var(--timeline-x,28px))] text-left transition-colors duration-150 hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
        style={{ "--timeline-x": `${TIMELINE_X + 28}px` } as CSSProperties}
      >
        <p
          className={cn(
            "text-[15px] leading-snug font-medium text-[var(--task-text-secondary)]",
            completed && "line-through decoration-[var(--task-completed)]/60",
          )}
        >
          {task.title}
        </p>
        <p className="mt-1 text-[12px] text-[var(--task-text-muted)]">{metaLabel}</p>
        {secondaryMeta ? (
          <p className="mt-0.5 text-[12px] text-[var(--task-text-muted)]">{secondaryMeta}</p>
        ) : null}
      </button>
    </li>
  );
}

import type { CSSProperties } from "react";
import { History } from "lucide-react";
import type { ExecutionHistoryGroup } from "@/features/tasks/lib/execution-history";
import {
  formatTimelineTime,
  terminalStateLabel,
} from "@/features/tasks/lib/execution-history";
import { taskSectionTitle } from "@/features/tasks/lib/tasks-ui";
import type { TimelineTerminalState } from "@/features/tasks/lib/task-lifecycle";
import { cn } from "@/lib/utils";

const TIMELINE_X = 7;

function statusDotClass(state: TimelineTerminalState): string {
  switch (state) {
    case "completed":
      return "bg-[var(--task-accent)]";
    case "not_completed":
      return "bg-amber-400";
    case "archived":
      return "bg-[var(--task-text-muted)]";
  }
}

function statusBadgeClass(state: TimelineTerminalState): string {
  switch (state) {
    case "completed":
      return "border-[var(--task-accent)]/30 bg-[var(--task-accent-soft)] text-[var(--task-accent)]";
    case "not_completed":
      return "border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-400";
    case "archived":
      return "border-[var(--task-border)] bg-[var(--task-surface-secondary)] text-[var(--task-text-muted)]";
  }
}

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
        Completed, not completed, and archived tasks
      </p>

      {!groups.length ? (
        <div className="mt-10 text-center xl:text-left">
          <History
            className="mx-auto mb-3 size-8 text-[var(--task-text-muted)] opacity-40 xl:mx-0"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-[13px] leading-relaxed text-[var(--task-text-muted)]">
            Your activity will appear here as you complete, archive, or mark tasks not completed.
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
                  <div
                    className="pl-[calc(var(--timeline-x,28px))]"
                    style={{ "--timeline-x": `${TIMELINE_X + 20}px` } as CSSProperties}
                  >
                    {group.isToday ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--task-text-muted)]">
                        Today
                      </p>
                    ) : null}
                    <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--task-text-muted)]">
                      {group.dateHeadline}
                    </h3>
                  </div>
                </div>
                <ul className="space-y-5">
                  {group.entries.map((entry, index) => (
                    <TimelineTaskEntry
                      key={entry.task.id}
                      entry={entry}
                      isLast={index === group.entries.length - 1}
                      onOpen={() => onOpen(entry.task.id)}
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
  entry,
  isLast,
  onOpen,
}: {
  entry: ExecutionHistoryGroup["entries"][number];
  isLast: boolean;
  onOpen: () => void;
}) {
  const { task, createdAt, terminalState, terminalAt } = entry;
  const createdTime = formatTimelineTime(createdAt);
  const terminalTime = formatTimelineTime(terminalAt);
  const label = terminalStateLabel(terminalState);

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
        <div className="flex items-center gap-2">
          <span
            className={cn("size-2 shrink-0 rounded-full bg-[var(--task-accent)]")}
            aria-hidden
          />
          <p className="text-[12px] text-[var(--task-text-muted)]">
            Created{createdTime ? ` · ${createdTime}` : ""}
          </p>
        </div>

        <p className="mt-1.5 text-[15px] leading-snug font-medium text-[var(--task-text-secondary)]">
          {task.title}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn("size-2 shrink-0 rounded-full", statusDotClass(terminalState))}
              aria-hidden
            />
            <p className="text-[12px] text-[var(--task-text-muted)]">
              {label}
              {terminalTime ? ` · ${terminalTime}` : ""}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              statusBadgeClass(terminalState),
            )}
          >
            {label}
          </span>
        </div>
      </button>
    </li>
  );
}

import { MoreHorizontal, Search, X } from "lucide-react";
import { TaskAppearanceMenu } from "./task-appearance-menu";
import { TasksFilterTabs } from "./tasks-filter-tabs";
import { TasksIconButton } from "./tasks-icon-button";
import { TasksSummaryStats } from "./tasks-summary-stats";
import { taskEyebrow, taskPageTitle } from "@/features/tasks/lib/tasks-ui";
import type { TimelineFilter } from "@/features/tasks/lib/task-timeline";
import { cn } from "@/lib/utils";

export function TasksHeader({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  summary,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filter: TimelineFilter;
  onFilterChange: (filter: TimelineFilter) => void;
  summary: { today: number; overdue: number; upcoming: number };
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className={taskEyebrow}>Tasks</p>
          <h1 className={cn(taskPageTitle, "mt-2")}>All tasks</h1>
          <TasksSummaryStats
            today={summary.today}
            overdue={summary.overdue}
            upcoming={summary.upcoming}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <TaskAppearanceMenu />
          <TasksIconButton label="More options">
            <MoreHorizontal className="size-4" strokeWidth={1.75} />
          </TasksIconButton>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <TasksFilterTabs value={filter} onChange={onFilterChange} />
        <div className="relative w-full lg:max-w-[280px] lg:shrink-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--task-text-muted)]"
            strokeWidth={1.75}
          />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="h-10 w-full rounded-xl border border-[var(--task-border)] bg-[var(--task-surface-secondary)] pr-9 pl-10 text-sm text-[var(--task-text)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--task-text-muted)] focus:border-[var(--task-accent)]/40 focus:shadow-[0_0_0_3px_var(--task-focus-ring)]"
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--task-text-muted)] hover:bg-[var(--task-hover)]"
            >
              <X className="size-3.5" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

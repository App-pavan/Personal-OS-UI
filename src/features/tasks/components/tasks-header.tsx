import { List, MoreHorizontal, Palette, Rows3, Search, X } from "lucide-react";
import { TaskAppearanceMenu } from "./task-appearance-menu";
import { TasksFilterTabs } from "./tasks-filter-tabs";
import { TasksIconButton } from "./tasks-icon-button";
import { TasksSummaryStats } from "./tasks-summary-stats";
import { taskEyebrow, taskPageTitle, taskSegmentItem, taskWorkspaceMax } from "@/features/tasks/lib/tasks-ui";
import type { TimelineFilter } from "@/features/tasks/lib/task-timeline";
import { cn } from "@/lib/utils";

export function TasksHeader({
  title,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filter,
  onFilterChange,
  summary,
}: {
  title: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: "list" | "timeline";
  onViewModeChange: (mode: "list" | "timeline") => void;
  filter: TimelineFilter;
  onFilterChange: (filter: TimelineFilter) => void;
  summary: { today: number; overdue: number; upcoming: number };
}) {
  return (
    <header className="border-b border-[var(--task-border-subtle)] px-4 py-5 sm:px-6">
      <div className={cn(taskWorkspaceMax, "space-y-5")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className={taskEyebrow}>Tasks</p>
            <h1 className={cn(taskPageTitle, "mt-1.5")}>{title}</h1>
            <TasksSummaryStats
              today={summary.today}
              overdue={summary.overdue}
              upcoming={summary.upcoming}
            />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <TaskAppearanceMenu
              trigger={
                <TasksIconButton label="Appearance">
                  <Palette className="size-[15px]" strokeWidth={1.75} />
                </TasksIconButton>
              }
            />

            <div
              className="inline-flex items-center rounded-lg border border-[var(--task-border-subtle)] bg-[var(--task-surface-secondary)] p-0.5"
              role="group"
              aria-label="View mode"
            >
              <button
                type="button"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => onViewModeChange("list")}
                className={taskSegmentItem(viewMode === "list") + " grid size-8 place-items-center px-2"}
              >
                <List className="size-[15px]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Timeline view"
                aria-pressed={viewMode === "timeline"}
                onClick={() => onViewModeChange("timeline")}
                className={taskSegmentItem(viewMode === "timeline") + " grid size-8 place-items-center px-2"}
              >
                <Rows3 className="size-[15px]" strokeWidth={1.75} />
              </button>
            </div>

            <TasksIconButton label="More options">
              <MoreHorizontal className="size-[15px]" strokeWidth={1.75} />
            </TasksIconButton>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TasksFilterTabs value={filter} onChange={onFilterChange} />

          <div className="relative w-full sm:max-w-[280px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-[15px] -translate-y-1/2 text-[var(--task-text-secondary)]"
              strokeWidth={1.75}
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks…"
              aria-label="Search tasks"
              className="h-9 w-full rounded-lg border border-[var(--task-border-subtle)] bg-[var(--task-surface-secondary)] pr-8 pl-9 text-[13px] text-[var(--task-text)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--task-text-secondary)] focus:border-[var(--task-accent)]/35 focus:shadow-[0_0_0_3px_var(--task-focus-ring)]"
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-[var(--task-text-secondary)] transition-colors hover:bg-[var(--task-hover)] hover:text-[var(--task-text)]"
              >
                <X className="size-3.5" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

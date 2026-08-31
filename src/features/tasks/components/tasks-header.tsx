import { List, Palette, Rows3, Search, X } from "lucide-react";
import { TaskAppearanceMenu } from "./task-appearance-menu";
import { cn } from "@/lib/utils";

export function TasksHeader({
  title,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  summaryLine,
}: {
  title: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: "list" | "timeline";
  onViewModeChange: (mode: "list" | "timeline") => void;
  summaryLine?: string;
}) {
  return (
    <header className="border-b border-[var(--task-border)] px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--task-accent)]">
            Tasks
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--task-text)]">{title}</h1>
          {summaryLine ? (
            <p className="mt-1 text-xs text-[var(--task-text-secondary)]">{summaryLine}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <TaskAppearanceMenu
            trigger={
              <button
                type="button"
                aria-label="Appearance"
                className="grid size-9 place-items-center rounded-md text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]"
              >
                <Palette className="size-4" />
              </button>
            }
          />

          <div className="flex rounded-md border border-[var(--task-border)] p-0.5">
            <button
              type="button"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              className={cn(
                "grid size-8 place-items-center rounded-sm transition-colors",
                viewMode === "list"
                  ? "bg-[var(--task-accent-soft)] text-[var(--task-accent)]"
                  : "text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]",
              )}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Timeline view"
              aria-pressed={viewMode === "timeline"}
              onClick={() => onViewModeChange("timeline")}
              className={cn(
                "grid size-8 place-items-center rounded-sm transition-colors",
                viewMode === "timeline"
                  ? "bg-[var(--task-accent-soft)] text-[var(--task-accent)]"
                  : "text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]",
              )}
            >
              <Rows3 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-4 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--task-text-secondary)]" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="h-9 w-full rounded-md border border-[var(--task-border)] bg-[var(--task-surface-secondary)] pr-9 pl-9 text-sm text-[var(--task-text)] outline-none placeholder:text-[var(--task-text-secondary)] focus:border-[var(--task-accent)]/40"
        />
        {searchQuery ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-[var(--task-text-secondary)] hover:bg-[var(--task-hover)]"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    </header>
  );
}

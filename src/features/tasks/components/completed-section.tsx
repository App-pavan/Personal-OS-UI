import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { TaskSummary } from "@/lib/api/types";
import { TaskRow } from "./task-row";
import { cn } from "@/lib/utils";

export function CompletedSection({
  tasks,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onDelete,
  canUpdate,
  canDelete,
  defaultCollapsed = true,
}: {
  tasks: TaskSummary[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!tasks.length) return null;

  return (
    <section className="mt-2 border-t border-[var(--task-border-subtle)] pt-4">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="mb-2 flex w-full items-center justify-between gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-[var(--task-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--task-focus-ring)]"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2">
          <ChevronRight
            className={cn(
              "size-4 text-[var(--task-text-secondary)] transition-transform duration-200",
              !collapsed && "rotate-90",
            )}
            strokeWidth={1.75}
          />
          <span className="text-[11px] font-medium tracking-wide text-[var(--task-text-secondary)]">
            Completed
          </span>
        </span>
        <span className="tabular-nums text-[11px] font-medium text-[var(--task-text-secondary)]">
          {tasks.length}
        </span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 pb-1">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                compact
                selected={selectedId === task.id}
                onOpen={() => onOpen(task.id)}
                onToggleComplete={() => onToggleComplete(task)}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(task) : undefined}
                onArchive={onArchive ? () => onArchive(task) : undefined}
                onDelete={onDelete ? () => onDelete(task) : undefined}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

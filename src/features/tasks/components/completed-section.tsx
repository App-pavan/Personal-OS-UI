import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
    <section className="mt-6 border-t border-[var(--task-border)] pt-4">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="mb-2 flex w-full items-center gap-2 text-left"
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="size-4 text-[var(--task-text-secondary)]" />
        ) : (
          <ChevronDown className="size-4 text-[var(--task-text-secondary)]" />
        )}
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--task-section-header)]">
          Completed ({tasks.length})
        </span>
      </button>

      <div className={cn(!collapsed && "space-y-0.5")}>
        {!collapsed
          ? tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                selected={selectedId === task.id}
                onOpen={() => onOpen(task.id)}
                onToggleComplete={() => onToggleComplete(task)}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(task) : undefined}
                onArchive={onArchive ? () => onArchive(task) : undefined}
                onDelete={onDelete ? () => onDelete(task) : undefined}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ))
          : null}
      </div>
    </section>
  );
}

import type { DateSection } from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CompletedSection } from "./completed-section";
import { TaskRow } from "./task-row";

function TaskSectionBlock({
  section,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onDelete,
  canUpdate,
  canDelete,
}: {
  section: DateSection;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}) {
  if (!section.tasks.length) return null;

  return (
    <section className="mb-6">
      <header className="mb-2 px-2">
        <h3
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.14em]",
            section.isOverdueSection
              ? "text-[var(--task-overdue)]"
              : section.isToday
                ? "text-[var(--task-accent)]"
                : "text-[var(--task-section-header)]",
          )}
        >
          {section.headline}
        </h3>
        {section.subline ? (
          <p className="text-[11px] text-[var(--task-text-secondary)]">{section.subline}</p>
        ) : null}
      </header>
      <div className="divide-y divide-[var(--task-border)]/50">
        {section.tasks.map((task) => (
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
        ))}
      </div>
    </section>
  );
}

export function TaskContent({
  sections,
  completedTasks,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onDelete,
  canUpdate,
  canDelete,
  emptyTitle = "No tasks",
  emptySubtitle = "You're all caught up.",
}: {
  sections: DateSection[];
  completedTasks: TaskSummary[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}) {
  const hasActive = sections.some((s) => s.tasks.length > 0);

  if (!hasActive && !completedTasks.length) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-[var(--task-text)]">{emptyTitle}</p>
        <p className="mt-1 text-sm text-[var(--task-text-secondary)]">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {sections.map((section) => (
        <TaskSectionBlock
          key={section.key}
          section={section}
          selectedId={selectedId}
          onOpen={onOpen}
          onToggleComplete={onToggleComplete}
          onToggleFavorite={onToggleFavorite}
          onArchive={onArchive}
          onDelete={onDelete}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      ))}

      <CompletedSection
        tasks={completedTasks}
        selectedId={selectedId}
        onOpen={onOpen}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        onArchive={onArchive}
        onDelete={onDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}

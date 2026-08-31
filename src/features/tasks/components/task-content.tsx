import type { DateSection } from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CompletedSection } from "./completed-section";
import { TaskRow } from "./task-row";

function SectionHeader({
  headline,
  count,
  isOverdue,
  isToday,
}: {
  headline: string;
  count: number;
  isOverdue?: boolean;
  isToday?: boolean;
}) {
  return (
    <header className="mb-2 flex items-center justify-between gap-3 px-1 pt-1">
      <h3
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.16em]",
          isOverdue
            ? "text-[var(--task-overdue)]"
            : isToday
              ? "text-[var(--task-accent)]"
              : "text-[var(--task-section-header)]",
        )}
      >
        {headline}
      </h3>
      <span className="tabular-nums text-[11px] font-medium text-[var(--task-text-secondary)]">
        {count}
      </span>
    </header>
  );
}

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
    <section className="mb-5">
      <SectionHeader
        headline={section.headline}
        count={section.tasks.length}
        isOverdue={section.isOverdueSection}
        isToday={section.isToday}
      />
      <div className="mb-2 h-px bg-[var(--task-border-subtle)]" />
      <div className="space-y-0.5">
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
      <div className="rounded-xl border border-dashed border-[var(--task-border-subtle)] px-6 py-14 text-center">
        <p className="text-sm font-medium text-[var(--task-text)]">{emptyTitle}</p>
        <p className="mt-1.5 text-[13px] text-[var(--task-text-secondary)]">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="pb-4">
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

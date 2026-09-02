import type { DateSection } from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { TaskRow } from "./task-row";

function SectionHeader({
  headline,
  count,
  isOverdue,
}: {
  headline: string;
  count: number;
  isOverdue?: boolean;
}) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <h3
        className={cn(
          "text-sm font-semibold tracking-wide",
          isOverdue ? "text-[var(--task-overdue)]" : "text-[var(--task-section-header)]",
        )}
      >
        {headline}
      </h3>
      <span className="tabular-nums text-sm text-[var(--task-text-muted)]">{count}</span>
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

  const headline = section.isOverdueSection
    ? "Overdue"
    : section.isToday
      ? "Today"
      : section.key === "unscheduled"
        ? "No date"
        : section.headline === "TOMORROW"
          ? "Tomorrow"
          : section.headline.charAt(0) + section.headline.slice(1).toLowerCase();

  return (
    <section className="mb-10">
      <SectionHeader headline={headline} count={section.tasks.length} isOverdue={section.isOverdueSection} />
      <div className="space-y-2">
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

  if (!hasActive) {
    return (
      <div className="py-16 text-center">
        <p className="text-base font-medium text-[var(--task-text)]">{emptyTitle}</p>
        <p className="mt-2 text-[15px] text-[var(--task-text-secondary)]">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div>
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
    </div>
  );
}

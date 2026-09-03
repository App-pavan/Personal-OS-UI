import type { DateSection } from "@/features/tasks/lib/task-timeline";
import type { TaskSummary } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { TaskRow } from "./task-row";

function SectionHeader({
  headline,
  subline,
  count,
  isToday,
}: {
  headline: string;
  subline?: string;
  count: number;
  isToday?: boolean;
}) {
  return (
    <header className="mb-4 flex items-end justify-between gap-3">
      <div>
        {isToday ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--task-text-muted)]">
            Today
          </p>
        ) : null}
        <h3 className="text-sm font-semibold tracking-wide text-[var(--task-section-header)]">
          {headline}
        </h3>
        {subline ? (
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--task-text-muted)]">
            {subline}
          </p>
        ) : null}
      </div>
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
  onMarkNotCompleted,
  onArchive,
  onUnarchive,
  canUpdate,
  archivedView,
  completedView,
}: {
  section: DateSection;
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onMarkNotCompleted?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onUnarchive?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  archivedView?: boolean;
  completedView?: boolean;
}) {
  if (!section.tasks.length) return null;

  const headline =
    archivedView
      ? "Archived"
      : completedView
        ? section.headline
        : section.isToday
          ? section.subline || section.headline
          : section.headline.charAt(0) + section.headline.slice(1).toLowerCase();

  return (
    <section className="mb-10">
      <SectionHeader
        headline={headline}
        subline={section.isToday ? undefined : section.subline || undefined}
        count={section.tasks.length}
        isToday={section.isToday && !archivedView && !completedView}
      />
      <div className="space-y-2">
        {section.tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            selected={selectedId === task.id}
            onOpen={() => onOpen(task.id)}
            onToggleComplete={() => onToggleComplete(task)}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(task) : undefined}
            onMarkNotCompleted={onMarkNotCompleted ? () => onMarkNotCompleted(task) : undefined}
            onArchive={onArchive ? () => onArchive(task) : undefined}
            onUnarchive={onUnarchive ? () => onUnarchive(task) : undefined}
            canUpdate={canUpdate}
            archivedView={archivedView}
            completedView={completedView}
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
  onMarkNotCompleted,
  onArchive,
  onUnarchive,
  canUpdate,
  archivedView,
  completedView,
  emptyTitle = "No tasks",
  emptySubtitle = "You're all caught up.",
}: {
  sections: DateSection[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onMarkNotCompleted?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onUnarchive?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  archivedView?: boolean;
  completedView?: boolean;
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
          onMarkNotCompleted={onMarkNotCompleted}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          canUpdate={canUpdate}
          archivedView={archivedView}
          completedView={completedView}
        />
      ))}
    </div>
  );
}

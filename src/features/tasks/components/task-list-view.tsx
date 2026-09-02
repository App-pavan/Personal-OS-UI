import type { TaskSummary } from "@/lib/api/types";
import { buildDateTimeline, type TimelineFilter } from "../lib/task-timeline";
import { TaskContent } from "./task-content";

interface TaskListViewProps {
  tasks: TaskSummary[];
  filter: TimelineFilter;
  selectedId?: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onUnarchive?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function TaskListView({
  tasks,
  filter,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onUnarchive,
  onDelete,
  canUpdate,
  canDelete,
}: TaskListViewProps) {
  if (filter === "archived") {
    return (
      <TaskContent
        sections={[
          {
            key: "archived",
            date: null,
            headline: "ARCHIVED",
            subline: `${tasks.length} TASK${tasks.length === 1 ? "" : "S"}`,
            isToday: false,
            isOverdueSection: false,
            tasks,
          },
        ]}
        selectedId={selectedId ?? null}
        onOpen={onOpen}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
        archivedView
        emptyTitle="No archived tasks"
        emptySubtitle="Archived tasks will appear here."
      />
    );
  }

  const sections = buildDateTimeline(tasks, filter);

  return (
    <TaskContent
      sections={sections}
      selectedId={selectedId ?? null}
      onOpen={onOpen}
      onToggleComplete={onToggleComplete}
      onToggleFavorite={onToggleFavorite}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
      onDelete={onDelete}
      canUpdate={canUpdate}
      canDelete={canDelete}
      emptyTitle={filter === "today" ? "No tasks for today" : "No active tasks"}
      emptySubtitle="You're all caught up."
    />
  );
}

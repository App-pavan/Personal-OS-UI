import type { TaskSummary } from "@/lib/api/types";
import { buildDateTimeline, type TimelineFilter } from "../lib/task-timeline";
import { TaskContent } from "./task-content";

interface TaskListViewProps {
  tasks: TaskSummary[];
  completedTasks: TaskSummary[];
  filter: TimelineFilter;
  selectedId?: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onDelete?: (task: TaskSummary) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function TaskListView({
  tasks,
  completedTasks,
  filter,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onArchive,
  onDelete,
  canUpdate,
  canDelete,
}: TaskListViewProps) {
  const sections = buildDateTimeline(tasks, filter);

  return (
    <TaskContent
      sections={sections}
      completedTasks={completedTasks}
      selectedId={selectedId ?? null}
      onOpen={onOpen}
      onToggleComplete={onToggleComplete}
      onToggleFavorite={onToggleFavorite}
      onArchive={onArchive}
      onDelete={onDelete}
      canUpdate={canUpdate}
      canDelete={canDelete}
      emptyTitle={filter === "today" ? "No tasks for today" : "No tasks"}
      emptySubtitle="You're all caught up."
    />
  );
}

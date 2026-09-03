import type { TaskSummary } from "@/lib/api/types";
import {
  buildCreationDateGroups,
  buildCreationDateGroupsForTasks,
  type TaskWorkspaceFilter,
} from "../lib/task-timeline";
import { TaskContent } from "./task-content";

interface TaskListViewProps {
  tasks: TaskSummary[];
  filter: TaskWorkspaceFilter;
  selectedId?: string | null;
  onOpen: (id: string) => void;
  onToggleComplete: (task: TaskSummary) => void;
  onToggleFavorite?: (task: TaskSummary) => void;
  onMarkNotCompleted?: (task: TaskSummary) => void;
  onArchive?: (task: TaskSummary) => void;
  onUnarchive?: (task: TaskSummary) => void;
  canUpdate?: boolean;
}

export function TaskListView({
  tasks,
  filter,
  selectedId,
  onOpen,
  onToggleComplete,
  onToggleFavorite,
  onMarkNotCompleted,
  onArchive,
  onUnarchive,
  canUpdate,
}: TaskListViewProps) {
  if (filter === "archived") {
    return (
      <TaskContent
        sections={buildCreationDateGroupsForTasks(tasks)}
        selectedId={selectedId ?? null}
        onOpen={onOpen}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        onMarkNotCompleted={onMarkNotCompleted}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        canUpdate={canUpdate}
        archivedView
        emptyTitle="No archived tasks"
        emptySubtitle="Archived tasks will appear here."
      />
    );
  }

  if (filter === "completed") {
    return (
      <TaskContent
        sections={buildCreationDateGroupsForTasks(tasks)}
        selectedId={selectedId ?? null}
        onOpen={onOpen}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        onArchive={onArchive}
        canUpdate={canUpdate}
        completedView
        emptyTitle="No completed tasks"
        emptySubtitle="Completed tasks appear in the execution timeline."
      />
    );
  }

  const sections = buildCreationDateGroups(tasks);

  return (
    <TaskContent
      sections={sections}
      selectedId={selectedId ?? null}
      onOpen={onOpen}
      onToggleComplete={onToggleComplete}
      onToggleFavorite={onToggleFavorite}
      onMarkNotCompleted={onMarkNotCompleted}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
      canUpdate={canUpdate}
      emptyTitle="No active tasks"
      emptySubtitle="You're all caught up."
    />
  );
}

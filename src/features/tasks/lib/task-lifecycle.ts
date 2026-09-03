import type { TaskSummary } from "@/lib/api/types";

/** Task reached a successful completion. */
export function isTaskCompleted(task: TaskSummary): boolean {
  return task.status === "completed" || Boolean(task.completedAt);
}

/** Task intentionally marked as not completed (terminal, distinct from ongoing). */
export function isTaskNotCompleted(task: TaskSummary): boolean {
  return task.status === "cancelled" || Boolean(task.notCompletedAt);
}

/** Task lifecycle — whether the task is in the active workspace. */
export function isTaskArchived(task: TaskSummary): boolean {
  return task.archived || task.status === "archived";
}

export function isTaskActive(task: TaskSummary): boolean {
  return !isTaskArchived(task);
}

/** Eligible for the main active workspace (ongoing, not terminal). */
export function isActiveIncomplete(task: TaskSummary): boolean {
  return isTaskActive(task) && !isTaskCompleted(task) && !isTaskNotCompleted(task);
}

/** Completed but still active — shown in timeline, not main ongoing list. */
export function isActiveCompleted(task: TaskSummary): boolean {
  return isTaskActive(task) && isTaskCompleted(task);
}

/** Shown in execution timeline: terminal lifecycle states. */
export function isTimelineEligible(task: TaskSummary): boolean {
  return isActiveCompleted(task) || isTaskNotCompleted(task) || isTaskArchived(task);
}

export type TimelineTerminalState = "completed" | "not_completed" | "archived";

export function getTimelineTerminalState(task: TaskSummary): TimelineTerminalState | null {
  if (!isTimelineEligible(task)) return null;
  if (isTaskArchived(task) && !isTaskCompleted(task) && !isTaskNotCompleted(task)) {
    return "archived";
  }
  if (isTaskNotCompleted(task)) return "not_completed";
  if (isTaskCompleted(task)) return "completed";
  if (isTaskArchived(task)) return "archived";
  return null;
}

export function getNotCompletedTimestamp(task: TaskSummary): string | null {
  return task.notCompletedAt ?? (task.status === "cancelled" ? task.updatedAt : null);
}

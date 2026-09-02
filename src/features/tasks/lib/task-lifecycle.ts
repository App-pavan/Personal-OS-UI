import type { TaskSummary } from "@/lib/api/types";

/** Task completion status — independent of lifecycle. */
export function isTaskCompleted(task: TaskSummary): boolean {
  return (
    task.status === "completed" ||
    task.status === "cancelled" ||
    Boolean(task.completedAt)
  );
}

/** Task lifecycle — whether the task is in the active workspace. */
export function isTaskArchived(task: TaskSummary): boolean {
  return task.archived || task.status === "archived";
}

export function isTaskActive(task: TaskSummary): boolean {
  return !isTaskArchived(task);
}

/** Eligible for the main active workspace (incomplete, not archived). */
export function isActiveIncomplete(task: TaskSummary): boolean {
  return isTaskActive(task) && !isTaskCompleted(task);
}

/** Completed but still active — shown in timeline, not main list. */
export function isActiveCompleted(task: TaskSummary): boolean {
  return isTaskActive(task) && isTaskCompleted(task);
}

/** Shown in execution timeline: completed active work + all archived tasks. */
export function isTimelineEligible(task: TaskSummary): boolean {
  return isActiveCompleted(task) || isTaskArchived(task);
}

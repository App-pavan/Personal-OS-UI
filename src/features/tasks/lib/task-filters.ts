import type { TaskSummary } from "@/lib/api/types";
import { localDateKey } from "./task-dates";
import {
  isActiveCompleted,
  isActiveIncomplete,
  isTaskArchived,
  isTaskCompleted,
  isTaskNotCompleted,
  isTimelineEligible,
} from "./task-lifecycle";

export type TaskListNav = "all" | "starred" | `list:${string}`;

export const TASK_CUSTOM_LISTS_KEY = "personal-os-tasks-custom-lists";
export const TASK_VIEW_MODE_KEY = "personal-os-tasks-view-mode";

export {
  isTaskCompleted,
  isTaskArchived,
  isTaskNotCompleted,
  isActiveIncomplete,
  isTimelineEligible,
} from "./task-lifecycle";

export function partitionTasks(tasks: TaskSummary[]) {
  const active: TaskSummary[] = [];
  const completed: TaskSummary[] = [];
  const notCompleted: TaskSummary[] = [];
  const archived: TaskSummary[] = [];

  for (const task of tasks) {
    if (isTaskArchived(task)) archived.push(task);
    else if (isTaskCompleted(task)) completed.push(task);
    else if (isTaskNotCompleted(task)) notCompleted.push(task);
    else active.push(task);
  }

  return { active, completed, notCompleted, archived };
}

/** Ongoing tasks for the main workspace. */
export function filterActiveWorkspace(tasks: TaskSummary[]): TaskSummary[] {
  return tasks.filter(isActiveIncomplete);
}

/** Completed tasks (not archived) for the Completed filter tab. */
export function filterCompletedWorkspace(tasks: TaskSummary[]): TaskSummary[] {
  return tasks.filter(isActiveCompleted);
}

/** Not-completed terminal tasks. */
export function filterNotCompletedTasks(tasks: TaskSummary[]): TaskSummary[] {
  return tasks.filter((t) => isTaskNotCompleted(t) && !isTaskArchived(t));
}

/** Archived tasks for the archived filter view. */
export function filterArchivedTasks(tasks: TaskSummary[]): TaskSummary[] {
  return tasks.filter(isTaskArchived);
}

/** Tasks eligible for the execution timeline. */
export function filterTimelineTasks(tasks: TaskSummary[]): TaskSummary[] {
  return tasks.filter(isTimelineEligible);
}

export type TaskWorkspaceFilter = "all" | "active" | "completed" | "archived";

/** Main workspace list by filter tab. */
export function filterWorkspaceTasks(
  tasks: TaskSummary[],
  filter: TaskWorkspaceFilter,
): TaskSummary[] {
  switch (filter) {
    case "archived":
      return filterArchivedTasks(tasks);
    case "completed":
      return filterCompletedWorkspace(tasks);
    case "active":
      return filterActiveWorkspace(tasks);
    case "all":
    default:
      return filterActiveWorkspace(tasks);
  }
}

export function filterByListNav(tasks: TaskSummary[], nav: TaskListNav): TaskSummary[] {
  if (nav === "all") return tasks;
  if (nav === "starred") return tasks.filter((t) => t.favorite);
  if (nav.startsWith("list:")) {
    const name = nav.slice(5);
    return tasks.filter(
      (t) => t.projectName === name || (t.labels ?? []).includes(name),
    );
  }
  return tasks;
}

export function filterBySearch(tasks: TaskSummary[], query: string): TaskSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter((t) => t.title.toLowerCase().includes(q));
}

export function deriveTaskLists(tasks: TaskSummary[], customLists: string[]): string[] {
  const names = new Set<string>();
  for (const task of tasks) {
    if (task.projectName) names.add(task.projectName);
    for (const label of task.labels ?? []) names.add(label);
  }
  for (const custom of customLists) names.add(custom);
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function loadCustomLists(): string[] {
  try {
    const raw = window.localStorage.getItem(TASK_CUSTOM_LISTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function saveCustomLists(lists: string[]) {
  window.localStorage.setItem(TASK_CUSTOM_LISTS_KEY, JSON.stringify(lists));
}

export function listNavLabel(nav: TaskListNav): string {
  if (nav === "all") return "All tasks";
  if (nav === "starred") return "Starred";
  return nav.slice(5);
}

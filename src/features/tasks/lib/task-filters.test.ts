import { describe, expect, it } from "vitest";
import {
  filterActiveWorkspace,
  filterArchivedTasks,
  filterByListNav,
  filterBySearch,
  filterTimelineTasks,
  isTaskCompleted,
  partitionTasks,
} from "./task-filters";
import type { TaskSummary } from "@/lib/api/types";

function task(partial: Partial<TaskSummary> & Pick<TaskSummary, "id" | "title">): TaskSummary {
  return {
    type: "personal",
    status: "inbox",
    priority: "normal",
    progress: 0,
    pinned: false,
    favorite: false,
    archived: false,
    tags: [],
    labels: [],
    subtaskCount: 0,
    subtaskCompletedCount: 0,
    checklistItemCount: 0,
    commentCount: 0,
    attachmentCount: 0,
    dependencyCount: 0,
    hasReminder: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

describe("task-filters", () => {
  it("partitions active, completed, and archived tasks", () => {
    const tasks = [
      task({ id: "1", title: "Open" }),
      task({ id: "2", title: "Done", status: "completed" }),
      task({ id: "3", title: "Old", archived: true }),
    ];
    const { active, completed, archived } = partitionTasks(tasks);
    expect(active).toHaveLength(1);
    expect(completed).toHaveLength(1);
    expect(archived).toHaveLength(1);
    expect(isTaskCompleted(completed[0]!)).toBe(true);
  });

  it("excludes archived tasks from active workspace", () => {
    const tasks = [
      task({ id: "1", title: "Open" }),
      task({ id: "2", title: "Archived open", archived: true }),
      task({ id: "3", title: "Done", status: "completed" }),
    ];
    expect(filterActiveWorkspace(tasks)).toHaveLength(1);
    expect(filterActiveWorkspace(tasks)[0]?.id).toBe("1");
  });

  it("includes completed and archived in timeline filter", () => {
    const tasks = [
      task({ id: "1", title: "Open" }),
      task({ id: "2", title: "Done", status: "completed", completedAt: "2026-09-01T10:00:00.000Z" }),
      task({ id: "3", title: "Archived", archived: true, archivedAt: "2026-09-01T12:00:00.000Z" }),
    ];
    const timeline = filterTimelineTasks(tasks);
    expect(timeline).toHaveLength(2);
    expect(filterArchivedTasks(tasks)).toHaveLength(1);
  });

  it("filters starred and list nav", () => {
    const tasks = [
      task({ id: "1", title: "A", favorite: true }),
      task({ id: "2", title: "B", projectName: "Work" }),
    ];
    expect(filterByListNav(tasks, "starred")).toHaveLength(1);
    expect(filterByListNav(tasks, "list:Work")).toHaveLength(1);
  });

  it("filters by search query", () => {
    const tasks = [task({ id: "1", title: "Railway form" }), task({ id: "2", title: "Other" })];
    expect(filterBySearch(tasks, "rail")).toHaveLength(1);
  });
});

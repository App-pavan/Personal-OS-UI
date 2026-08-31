import { describe, expect, it } from "vitest";
import {
  filterByListNav,
  filterBySearch,
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
  it("partitions completed tasks", () => {
    const tasks = [
      task({ id: "1", title: "Open" }),
      task({ id: "2", title: "Done", status: "completed" }),
    ];
    const { active, completed } = partitionTasks(tasks);
    expect(active).toHaveLength(1);
    expect(completed).toHaveLength(1);
    expect(isTaskCompleted(completed[0]!)).toBe(true);
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

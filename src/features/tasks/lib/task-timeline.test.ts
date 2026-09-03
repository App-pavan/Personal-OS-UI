import { describe, expect, it } from "vitest";
import type { TaskSummary } from "@/lib/api/types";
import { localDateKey, startOfLocalDay } from "./task-dates";
import { buildCreationDateGroups } from "./task-timeline";

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

const now = startOfLocalDay(new Date(2026, 8, 3, 12, 0, 0));

describe("buildCreationDateGroups", () => {
  it("groups ongoing tasks by creation date, newest groups first", () => {
    const todayKey = localDateKey(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateKey(yesterday);

    const tasks = [
      task({
        id: "older",
        title: "Older",
        createdAt: `${yesterdayKey}T10:00:00.000Z`,
      }),
      task({
        id: "newer",
        title: "Newer",
        createdAt: `${todayKey}T14:00:00.000Z`,
      }),
      task({
        id: "mid",
        title: "Mid",
        createdAt: `${todayKey}T09:00:00.000Z`,
      }),
      task({
        id: "done",
        title: "Done",
        status: "completed",
        createdAt: `${todayKey}T08:00:00.000Z`,
      }),
    ];

    const sections = buildCreationDateGroups(tasks, now);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.key).toBe(todayKey);
    expect(sections[0]?.tasks.map((t) => t.id)).toEqual(["newer", "mid"]);
    expect(sections[1]?.key).toBe(yesterdayKey);
  });
});

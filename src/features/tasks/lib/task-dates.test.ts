import { describe, expect, it } from "vitest";
import type { TaskSummary } from "@/lib/api/types";
import {
  defaultDueForDate,
  dueDateKey,
  formatTaskTime,
  hasExplicitDueTime,
  isDueToday,
  isOverdue,
  isUpcoming,
  localDateKey,
  startOfLocalDay,
} from "./task-dates";
import { buildCreationDateGroups } from "./task-timeline";
import { localDateKey, startOfLocalDay } from "./task-dates";

const now = new Date(2026, 7, 18, 12, 0, 0); // Aug 18 2026 local

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
    createdAt: "2026-08-18T06:00:00.000Z",
    updatedAt: "2026-08-18T06:00:00.000Z",
    ...partial,
  };
}

describe("localDateKey / dueDateKey", () => {
  it("groups IST midnight local as the same calendar day", () => {
    const istMidnightAug18 = startOfLocalDay(new Date(2026, 7, 18));
    expect(localDateKey(istMidnightAug18)).toBe("2026-08-18");
    expect(dueDateKey(istMidnightAug18.toISOString())).toBe("2026-08-18");
  });

  it("groups by local calendar date, not UTC ISO date prefix", () => {
    const localMidnight = new Date(2026, 7, 18, 0, 0, 0);
    const iso = localMidnight.toISOString();
    const utcPrefix = iso.slice(0, 10);
    if (utcPrefix !== localDateKey(localMidnight)) {
      expect(dueDateKey(iso)).toBe(localDateKey(localMidnight));
      expect(dueDateKey(iso)).not.toBe(utcPrefix);
    } else {
      expect(dueDateKey(iso)).toBe("2026-08-18");
    }
  });
});

describe("due classification", () => {
  it("today pending → TODAY", () => {
    const t = task({
      id: "1",
      title: "Today",
      dueAt: startOfLocalDay(now).toISOString(),
      status: "inbox",
    });
    expect(isDueToday(t, now)).toBe(true);
    expect(isOverdue(t, now)).toBe(false);
    expect(isUpcoming(t, now)).toBe(false);
  });

  it("yesterday pending → OVERDUE", () => {
    const t = task({
      id: "2",
      title: "Late",
      dueAt: startOfLocalDay(new Date(2026, 7, 17)).toISOString(),
      status: "inbox",
    });
    expect(isOverdue(t, now)).toBe(true);
  });

  it("tomorrow pending → UPCOMING", () => {
    const t = task({
      id: "3",
      title: "Future",
      dueAt: startOfLocalDay(new Date(2026, 7, 19)).toISOString(),
      status: "inbox",
    });
    expect(isUpcoming(t, now)).toBe(true);
  });

  it("yesterday completed → not overdue", () => {
    const t = task({
      id: "4",
      title: "Done",
      dueAt: startOfLocalDay(new Date(2026, 7, 17)).toISOString(),
      status: "completed",
    });
    expect(isOverdue(t, now)).toBe(false);
  });

  it("created Aug 17 but due Aug 18 → TODAY", () => {
    const t = task({
      id: "5",
      title: "Scheduled today",
      createdAt: "2026-08-17T10:00:00.000Z",
      dueAt: startOfLocalDay(now).toISOString(),
      status: "inbox",
    });
    expect(isDueToday(t, now)).toBe(true);
  });
});

describe("time display", () => {
  it("date-only due does not show fake 09:00 AM", () => {
    const due = defaultDueForDate(now);
    expect(hasExplicitDueTime(due)).toBe(false);
    expect(formatTaskTime(due)).toBeNull();
  });

  it("legacy 09:00 date-only default hides time", () => {
    const d = new Date(2026, 7, 18, 9, 0, 0);
    expect(formatTaskTime(d.toISOString())).toBeNull();
  });

  it("explicit 14:30 shows local time", () => {
    const d = new Date(2026, 7, 18, 14, 30, 0);
    expect(formatTaskTime(d.toISOString())).toMatch(/2:30 PM|14:30/);
  });
});

describe("buildCreationDateGroups ordering", () => {
  it("orders creation date groups newest first", () => {
    const todayKey = localDateKey(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateKey(yesterday);

    const tasks = [
      task({
        id: "yesterday",
        title: "Yesterday task",
        createdAt: `${yesterdayKey}T10:00:00.000Z`,
      }),
      task({
        id: "today",
        title: "Today task",
        createdAt: `${todayKey}T10:00:00.000Z`,
      }),
    ];

    const sections = buildCreationDateGroups(tasks, now);
    expect(sections[0]?.key).toBe(todayKey);
    expect(sections[1]?.key).toBe(yesterdayKey);
  });
});

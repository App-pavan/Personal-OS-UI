import { describe, expect, it } from "vitest";
import {
  formatTagDisplayName,
  GENERAL_TAG_ID,
  getTaskTagId,
  getVisibleTaskTagId,
  isGeneralTag,
  normalizeTagId,
  tagsPayloadForAssignment,
} from "./task-tags";

describe("task-tags", () => {
  it("normalizes tag names for uniqueness", () => {
    expect(normalizeTagId("  Work  ")).toBe("work");
    expect(normalizeTagId("Travel Plans")).toBe("travel plans");
  });

  it("formats display names", () => {
    expect(formatTagDisplayName("finance")).toBe("Finance");
    expect(formatTagDisplayName("travel plans")).toBe("Travel Plans");
  });

  it("treats missing tags as general internally", () => {
    expect(getTaskTagId({ tags: [] })).toBe(GENERAL_TAG_ID);
    expect(getVisibleTaskTagId({ tags: [] })).toBeNull();
    expect(isGeneralTag(GENERAL_TAG_ID)).toBe(true);
  });

  it("hides general tag from visible UI", () => {
    expect(getVisibleTaskTagId({ tags: ["general"] })).toBeNull();
    expect(getVisibleTaskTagId({ tags: ["Finance"] })).toBe("finance");
  });

  it("builds assignment payload", () => {
    expect(tagsPayloadForAssignment("finance")).toEqual(["finance"]);
    expect(tagsPayloadForAssignment(GENERAL_TAG_ID)).toEqual(["general"]);
  });
});

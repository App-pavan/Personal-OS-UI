import { describe, expect, it } from "vitest";
import {
  DEFAULT_TASK_THEME_ID,
  LEGACY_TASK_THEME_IDS,
  TASK_THEMES,
  TASK_THEME_IDS,
  resolveTaskThemeId,
  themeToCssVars,
} from "./task-theme";

describe("task-theme", () => {
  it("defines ten premium productivity themes", () => {
    expect(TASK_THEME_IDS).toHaveLength(10);
    expect(TASK_THEMES["deep-ocean"].name).toBe("Deep Ocean");
    expect(TASK_THEMES["light-minimal"].background).toMatch(/^#/);
  });

  it("defaults to Deep Ocean", () => {
    expect(DEFAULT_TASK_THEME_ID).toBe("deep-ocean");
    expect(resolveTaskThemeId(null)).toBe("deep-ocean");
  });

  it("resolves legacy theme ids", () => {
    for (const [legacy, next] of Object.entries(LEGACY_TASK_THEME_IDS)) {
      expect(resolveTaskThemeId(legacy)).toBe(next);
    }
    expect(resolveTaskThemeId("unknown")).toBe(DEFAULT_TASK_THEME_ID);
  });

  it("maps semantic tokens to CSS variables", () => {
    const vars = themeToCssVars(TASK_THEMES["deep-ocean"]);
    expect(vars["--task-accent"]).toBe(TASK_THEMES["deep-ocean"].accent);
    expect(vars["--task-progress-fill"]).toBeDefined();
    expect(vars["--task-timeline"]).toBeDefined();
    expect(vars["--task-panel-bg"]).toBe(TASK_THEMES["deep-ocean"].surfaceElevated);
    expect(vars["--task-panel-overlay"]).toBeDefined();
  });
});

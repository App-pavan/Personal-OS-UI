import { describe, expect, it } from "vitest";
import {
  LEGACY_TASK_THEME_IDS,
  TASK_THEMES,
  TASK_THEME_IDS,
  resolveTaskThemeId,
  themeToCssVars,
} from "./task-theme";

describe("task-theme", () => {
  it("defines ten productivity themes", () => {
    expect(TASK_THEME_IDS).toHaveLength(10);
    expect(TASK_THEMES["personal-os-dark"].name).toBe("Personal OS Dark");
    expect(TASK_THEMES["arctic-blue"].background).toMatch(/^#/);
  });

  it("resolves legacy theme ids", () => {
    for (const [legacy, next] of Object.entries(LEGACY_TASK_THEME_IDS)) {
      expect(resolveTaskThemeId(legacy)).toBe(next);
    }
    expect(resolveTaskThemeId("unknown")).toBe("personal-os-dark");
  });

  it("maps tokens to CSS variables", () => {
    const vars = themeToCssVars(TASK_THEMES["deep-ocean"]);
    expect(vars["--task-accent"]).toBe(TASK_THEMES["deep-ocean"].accent);
    expect(vars["--task-bg"]).toBeDefined();
    expect(vars["--task-surface-selected"]).toBeDefined();
  });
});

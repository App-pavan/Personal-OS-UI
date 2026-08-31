import { describe, expect, it } from "vitest";
import { TASK_THEMES, TASK_THEME_IDS, themeToCssVars } from "./task-theme";

describe("task-theme", () => {
  it("defines seven presets", () => {
    expect(TASK_THEME_IDS).toHaveLength(7);
    expect(TASK_THEMES["personal-os"].name).toBe("Personal OS");
    expect(TASK_THEMES["light-minimal"].background).toMatch(/^#/);
  });

  it("maps tokens to CSS variables", () => {
    const vars = themeToCssVars(TASK_THEMES.ocean);
    expect(vars["--task-accent"]).toBe(TASK_THEMES.ocean.accent);
    expect(vars["--task-bg"]).toBeDefined();
  });
});

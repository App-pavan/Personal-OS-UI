import { describe, expect, it } from "vitest";
import { summarizeFromRoles } from "./user-access-summary";

describe("summarizeFromRoles", () => {
  it("marks owner as protected with all modules", () => {
    const summary = summarizeFromRoles(["owner"], []);
    expect(summary.protected).toBe(true);
    expect(summary.moduleLabel).toBe("All modules");
  });

  it("counts modules and permissions for custom roles", () => {
    const summary = summarizeFromRoles(
      ["viewer"],
      [
        {
          id: "1",
          key: "viewer",
          name: "Viewer",
          isSystem: false,
          permissions: ["device_awareness.devices.view", "device_awareness.call_status.view"],
        },
      ],
    );
    expect(summary.moduleLabel).toBe("Device Awareness");
    expect(summary.permissionCount).toBe(2);
    expect(summary.protected).toBe(false);
  });
});

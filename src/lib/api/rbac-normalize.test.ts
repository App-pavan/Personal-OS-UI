import { describe, expect, it } from "vitest";
import {
  grantedPermissions,
  normalizeCapabilities,
  normalizePermissionList,
} from "@/lib/api/rbac-normalize";

describe("rbac-normalize", () => {
  it("normalizes legacy PascalCase permission metadata", () => {
    const items = normalizePermissionList([
      {
        Key: "tasks.view",
        Module: "tasks",
        Feature: "tasks",
        Action: "view",
        Description: "View tasks",
      },
    ]);
    expect(items[0]?.key).toBe("tasks.view");
    expect(items[0]?.module).toBe("tasks");
  });

  it("normalizes capabilities with missing permissions to an empty list", () => {
    const caps = normalizeCapabilities({ user: { id: "u1", roleSummary: ["owner"] } });
    expect(grantedPermissions(caps)).toEqual([]);
  });

  it("reads permissions from legacy PascalCase capabilities payloads", () => {
    const caps = normalizeCapabilities({
      User: { ID: "u1", RoleSummary: ["owner"] },
      Permissions: ["settings.users.view"],
      Modules: {},
    });
    expect(grantedPermissions(caps)).toEqual(["settings.users.view"]);
  });
});

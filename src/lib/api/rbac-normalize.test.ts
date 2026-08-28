import { describe, expect, it } from "vitest";
import {
  grantedPermissions,
  normalizeCapabilities,
  normalizePermissionList,
  normalizeUserAccess,
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

  it("normalizes user access payloads", () => {
    const view = normalizeUserAccess({
      id: "u1",
      email: "maa@example.com",
      displayName: "Maa",
      isActive: true,
      roles: ["viewer"],
      isProtectedOwner: false,
      isSelf: false,
      permissions: ["device_awareness.devices.view"],
      modules: { device_awareness: { visible: true, permissions: ["device_awareness.devices.view"] } },
    });
    expect(view.isSelf).toBe(false);
    expect(view.permissions).toHaveLength(1);
    expect(view.modules.device_awareness?.visible).toBe(true);
  });
});

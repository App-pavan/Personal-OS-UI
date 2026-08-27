import { describe, expect, it } from "vitest";
import {
  canManageRoles,
  canManageUsers,
  canViewAccessControl,
  hasPermission,
} from "@/features/access/lib/access-permissions";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";

const ownerCaps: CapabilitiesResponse = {
  user: { id: "1", roleSummary: ["owner"] },
  permissions: [
    "settings.users.view",
    "settings.users.manage",
    "settings.roles.view",
    "settings.roles.manage",
  ],
  modules: {},
};

const memberCaps: CapabilitiesResponse = {
  user: { id: "2", roleSummary: ["family_member"] },
  permissions: ["tasks.view"],
  modules: { tasks: { visible: true, permissions: ["tasks.view"] } },
};

describe("access-permissions", () => {
  it("allows access control for users with settings.users.view", () => {
    expect(canViewAccessControl(ownerCaps)).toBe(true);
  });

  it("denies access control for users without admin permissions", () => {
    expect(canViewAccessControl(memberCaps)).toBe(false);
    expect(canViewAccessControl(undefined)).toBe(false);
  });

  it("checks manage permissions", () => {
    expect(canManageUsers(ownerCaps)).toBe(true);
    expect(canManageRoles(ownerCaps)).toBe(true);
    expect(canManageUsers(memberCaps)).toBe(false);
  });

  it("checks individual permission keys", () => {
    expect(hasPermission(ownerCaps, "settings.roles.manage")).toBe(true);
    expect(hasPermission(memberCaps, "settings.roles.manage")).toBe(false);
  });
});

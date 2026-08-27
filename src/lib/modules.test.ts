import { describe, expect, it } from "vitest";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { PERM } from "@/lib/permissions";
import { visibleModules, canAccessRoute } from "@/lib/modules";

const ownerCaps: CapabilitiesResponse = {
  user: { id: "1", roleSummary: ["owner"] },
  permissions: [
    PERM.TASKS_VIEW,
    PERM.EXPENSES_TRANSACTIONS_VIEW,
    PERM.WEALTH_PORTFOLIO_VIEW,
    PERM.SYSTEM_RUNTIME_VIEW,
  ],
  modules: {},
};

const familyCaps: CapabilitiesResponse = {
  user: { id: "2", roleSummary: ["family_member"] },
  permissions: [PERM.DEVICE_AWARENESS_DEVICES_VIEW],
  modules: {},
};

describe("modules registry", () => {
  it("shows home and settings for all signed-in users", () => {
    const nav = visibleModules(familyCaps);
    expect(nav.some((m) => m.to === "/")).toBe(true);
    expect(nav.some((m) => m.to === "/settings")).toBe(true);
  });

  it("hides wealth for family member without portfolio permission", () => {
    const nav = visibleModules(familyCaps);
    expect(nav.some((m) => m.to === "/wealth")).toBe(false);
    expect(nav.some((m) => m.to === "/tasks")).toBe(false);
  });

  it("shows authorized modules for owner", () => {
    const nav = visibleModules(ownerCaps);
    expect(nav.some((m) => m.to === "/tasks")).toBe(true);
    expect(nav.some((m) => m.to === "/wealth")).toBe(true);
    expect(nav.some((m) => m.to === "/system/activity")).toBe(true);
  });

  it("blocks direct wealth route for family member", () => {
    expect(canAccessRoute(familyCaps, "/wealth")).toBe(false);
    expect(canAccessRoute(familyCaps, "/")).toBe(true);
  });

  it("allows wealth route for owner", () => {
    expect(canAccessRoute(ownerCaps, "/wealth")).toBe(true);
  });
});

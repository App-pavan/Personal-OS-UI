import { describe, expect, it } from "vitest";
import {
  buildPermissionTree,
  moduleHasAccess,
  unionPermissions,
} from "@/features/access/lib/permission-tree";
import type { PermissionDefinition } from "@/lib/api/rbac-types";

const sample: PermissionDefinition[] = [
  {
    key: "tasks.view",
    module: "tasks",
    feature: "tasks",
    action: "view",
    description: "View tasks",
  },
  {
    key: "tasks.create",
    module: "tasks",
    feature: "tasks",
    action: "create",
    description: "Create tasks",
  },
  {
    key: "device_awareness.devices.view",
    module: "device_awareness",
    feature: "devices",
    action: "view",
    description: "View family devices",
  },
];

describe("permission-tree", () => {
  it("builds hierarchical tree from definitions", () => {
    const tree = buildPermissionTree(sample);
    expect(tree).toHaveLength(2);
    expect(tree[0]?.key).toBe("device_awareness");
    expect(tree[1]?.features[0]?.actions).toHaveLength(2);
  });

  it("unions permission sets from multiple roles", () => {
    const result = unionPermissions(["tasks.view"], ["tasks.create", "wealth.portfolio.view"]);
    expect(result.sort()).toEqual(["tasks.view", "tasks.create", "wealth.portfolio.view"].sort());
  });

  it("detects module access from granted permissions", () => {
    const granted = new Set(["device_awareness.devices.view"]);
    expect(moduleHasAccess("device_awareness", granted)).toBe(true);
    expect(moduleHasAccess("wealth", granted)).toBe(false);
  });
});

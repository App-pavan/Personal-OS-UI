import { moduleLabel } from "@/features/access/lib/permission-tree";
import type { AdminRole, UserAccessView } from "@/lib/api/rbac-types";

export type UserAccessSummary = {
  moduleLabel: string;
  permissionCount: number;
  protected: boolean;
};

export function summarizeFromRoles(
  roles: string[],
  roleCatalog: AdminRole[],
  isProtectedOwner?: boolean,
): UserAccessSummary {
  if (isProtectedOwner || roles.includes("owner")) {
    return { moduleLabel: "All modules", permissionCount: 0, protected: true };
  }
  const granted = new Set<string>();
  for (const roleKey of roles) {
    const role = roleCatalog.find((r) => r.key === roleKey);
    for (const p of role?.permissions ?? []) granted.add(p);
  }
  const modules = new Set<string>();
  for (const key of granted) {
    const mod = key.split(".")[0];
    if (mod) modules.add(mod);
  }
  if (modules.size === 0) {
    return { moduleLabel: "No modules", permissionCount: granted.size, protected: false };
  }
  if (modules.size <= 2) {
    return {
      moduleLabel: [...modules].map(moduleLabel).join(", "),
      permissionCount: granted.size,
      protected: false,
    };
  }
  return {
    moduleLabel: `${modules.size} modules`,
    permissionCount: granted.size,
    protected: false,
  };
}

export function summarizeFromAccess(access: UserAccessView): UserAccessSummary {
  if (access.isProtectedOwner) {
    return { moduleLabel: "All modules", permissionCount: access.permissions.length, protected: true };
  }
  const visibleModules = Object.entries(access.modules ?? {}).filter(([, m]) => m.visible);
  if (visibleModules.length === 0) {
    return { moduleLabel: "No modules", permissionCount: access.permissions.length, protected: false };
  }
  if (visibleModules.length <= 2) {
    return {
      moduleLabel: visibleModules.map(([key]) => moduleLabel(key)).join(", "),
      permissionCount: access.permissions.length,
      protected: false,
    };
  }
  return {
    moduleLabel: `${visibleModules.length} modules`,
    permissionCount: access.permissions.length,
    protected: false,
  };
}

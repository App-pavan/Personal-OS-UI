import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { PERM_ROLES_VIEW, PERM_USERS_VIEW } from "@/lib/api/rbac-types";

export function canViewAccessControl(caps: CapabilitiesResponse | undefined): boolean {
  if (!caps) return false;
  const perms = new Set(caps.permissions);
  return perms.has(PERM_USERS_VIEW) || perms.has(PERM_ROLES_VIEW);
}

export function hasPermission(caps: CapabilitiesResponse | undefined, permission: string): boolean {
  if (!caps) return false;
  return caps.permissions.includes(permission);
}

export function canManageUsers(caps: CapabilitiesResponse | undefined): boolean {
  return hasPermission(caps, "settings.users.manage");
}

export function canManageRoles(caps: CapabilitiesResponse | undefined): boolean {
  return hasPermission(caps, "settings.roles.manage");
}

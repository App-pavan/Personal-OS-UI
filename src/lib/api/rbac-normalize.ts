import type {
  AdminRole,
  AdminUser,
  CapabilitiesResponse,
  ModuleCapability,
  PermissionDefinition,
  UserAccessView,
} from "./rbac-types";

const str = (value: unknown): string =>
  typeof value === "string" && value.trim().length ? value.trim() : "";

const strList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function normalizePermissionDefinition(raw: unknown): PermissionDefinition {
  const source = readRecord(raw) ?? {};
  return {
    key: str(source.key ?? source.Key),
    module: str(source.module ?? source.Module),
    feature: str(source.feature ?? source.Feature),
    action: str(source.action ?? source.Action),
    description: str(source.description ?? source.Description),
  };
}

export function normalizePermissionList(value: unknown): PermissionDefinition[] {
  return asArray<unknown>(value)
    .map(normalizePermissionDefinition)
    .filter((item) => item.key.length > 0);
}

export function normalizeCapabilities(raw: unknown): CapabilitiesResponse {
  const source = readRecord(raw) ?? {};
  const userRaw = readRecord(source.user ?? source.User) ?? {};
  const modulesRaw = readRecord(source.modules ?? source.Modules) ?? {};
  const modules: Record<string, ModuleCapability> = {};

  for (const [key, value] of Object.entries(modulesRaw)) {
    const mod = readRecord(value);
    if (!mod) continue;
    modules[key] = {
      visible: Boolean(mod.visible ?? mod.Visible),
      permissions: strList(mod.permissions ?? mod.Permissions),
    };
  }

  const roleSummary = strList(userRaw.roleSummary ?? userRaw.RoleSummary);

  return {
    user: {
      id: str(userRaw.id ?? userRaw.ID ?? source.userId ?? source.UserID),
      roleSummary,
    },
    permissions: strList(source.permissions ?? source.Permissions),
    modules,
  };
}

export function normalizeAdminUser(raw: unknown): AdminUser {
  const source = readRecord(raw) ?? {};
  const roles = strList(source.roles ?? source.Roles);
  const isProtectedOwner = Boolean(
    source.isProtectedOwner ?? source.IsProtectedOwner ?? roles.includes("owner"),
  );
  return {
    id: str(source.id ?? source.ID),
    email: str(source.email ?? source.Email),
    displayName: str(source.displayName ?? source.DisplayName),
    isActive: Boolean(source.isActive ?? source.IsActive ?? true),
    roles,
    isProtectedOwner,
  };
}

export function normalizeAdminUsers(value: unknown): AdminUser[] {
  return asArray<unknown>(value).map(normalizeAdminUser).filter((user) => user.id.length > 0);
}

export function normalizeAdminRole(raw: unknown): AdminRole {
  const source = readRecord(raw) ?? {};
  return {
    id: str(source.id ?? source.ID),
    key: str(source.key ?? source.Key),
    name: str(source.name ?? source.Name),
    ...(str(source.description ?? source.Description)
      ? { description: str(source.description ?? source.Description) }
      : {}),
    isSystem: Boolean(source.isSystem ?? source.IsSystem),
    permissions: strList(source.permissions ?? source.Permissions),
  };
}

export function normalizeAdminRoles(value: unknown): AdminRole[] {
  return asArray<unknown>(value).map(normalizeAdminRole).filter((role) => role.key.length > 0);
}

export function normalizeUserAccess(raw: unknown): UserAccessView {
  const source = readRecord(raw) ?? {};
  const user = normalizeAdminUser(source);
  const modulesRaw = readRecord(source.modules ?? source.Modules) ?? {};
  const modules: Record<string, ModuleCapability> = {};
  for (const [key, value] of Object.entries(modulesRaw)) {
    const mod = readRecord(value);
    if (!mod) continue;
    modules[key] = {
      visible: Boolean(mod.visible ?? mod.Visible),
      permissions: strList(mod.permissions ?? mod.Permissions),
    };
  }
  return {
    ...user,
    permissions: strList(source.permissions ?? source.Permissions),
    modules,
    isSelf: Boolean(source.isSelf ?? source.IsSelf),
  };
}

export function grantedPermissions(caps: CapabilitiesResponse | undefined): string[] {
  return caps?.permissions ?? [];
}

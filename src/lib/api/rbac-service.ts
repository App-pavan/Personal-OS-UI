import { api, ApiRequestError } from "./client";
import {
  normalizeAdminRole,
  normalizeAdminRoles,
  normalizeAdminUser,
  normalizeAdminUsers,
  normalizeCapabilities,
  normalizePermissionList,
  normalizeUserAccess,
} from "./rbac-normalize";
import type {
  AdminRole,
  AdminUser,
  CapabilitiesResponse,
  CreateRoleInput,
  CreateUserInput,
  PermissionDefinition,
  UpdateRoleInput,
  UpdateUserAccessInput,
  UpdateUserInput,
  UserAccessView,
} from "./rbac-types";

/** Production exposes /identity/auth/capabilities; Phase 2 also adds /identity/me/capabilities. */
async function getCapabilities(): Promise<CapabilitiesResponse> {
  const paths = ["/identity/auth/capabilities", "/identity/me/capabilities"] as const;
  let lastError: unknown;
  for (const path of paths) {
    try {
      const data = (await api.get<CapabilitiesResponse>(path)).data;
      return normalizeCapabilities(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 404) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("Capabilities endpoint unavailable");
}

export const rbacApi = {
  capabilities: () => getCapabilities().then((data) => ({ data })),

  permissions: {
    list: async () => ({
      data: normalizePermissionList((await api.get<PermissionDefinition[]>("/admin/permissions")).data),
    }),
  },

  users: {
    list: async (params?: { limit?: number; offset?: number }) => ({
      data: normalizeAdminUsers((await api.get<AdminUser[]>("/admin/users", params)).data),
    }),
    get: async (id: string) => ({
      data: normalizeAdminUser((await api.get<AdminUser>(`/admin/users/${id}`)).data),
    }),
    update: async (id: string, input: UpdateUserInput) => ({
      data: normalizeAdminUser((await api.patch<AdminUser>(`/admin/users/${id}`, input)).data),
    }),
    create: async (input: CreateUserInput) => ({
      data: normalizeAdminUser((await api.post<AdminUser>("/admin/users", input)).data),
    }),
    getAccess: async (id: string) => ({
      data: normalizeUserAccess((await api.get<UserAccessView>(`/admin/users/${id}/access`)).data),
    }),
    updateAccess: async (id: string, input: UpdateUserAccessInput) => ({
      data: normalizeUserAccess((await api.patch<UserAccessView>(`/admin/users/${id}/access`, input)).data),
    }),
    listRoles: (id: string) => api.get<string[]>(`/admin/users/${id}/roles`),
    assignRole: (id: string, roleKey: string) =>
      api.post<null>(`/admin/users/${id}/roles`, { roleKey }),
    removeRole: (id: string, roleKey: string) =>
      api.delete<null>(`/admin/users/${id}/roles/${roleKey}`),
  },

  roles: {
    list: async () => ({
      data: normalizeAdminRoles((await api.get<AdminRole[]>("/admin/roles")).data),
    }),
    get: async (roleKey: string) => ({
      data: normalizeAdminRole((await api.get<AdminRole>(`/admin/roles/${roleKey}`)).data),
    }),
    create: async (input: CreateRoleInput) => ({
      data: normalizeAdminRole((await api.post<AdminRole>("/admin/roles", input)).data),
    }),
    update: async (roleKey: string, input: UpdateRoleInput) => ({
      data: normalizeAdminRole((await api.patch<AdminRole>(`/admin/roles/${roleKey}`, input)).data),
    }),
    delete: (roleKey: string) => api.delete<null>(`/admin/roles/${roleKey}`),
    listPermissions: (roleKey: string) => api.get<string[]>(`/admin/roles/${roleKey}/permissions`),
    replacePermissions: (roleKey: string, permissions: string[]) =>
      api.put<null>(`/admin/roles/${roleKey}/permissions`, { permissions }),
    addPermission: (roleKey: string, permission: string) =>
      api.post<null>(`/admin/roles/${roleKey}/permissions`, { permission }),
    removePermission: (roleKey: string, permission: string) =>
      api.delete<null>(`/admin/roles/${roleKey}/permissions/${encodeURIComponent(permission)}`),
  },
};

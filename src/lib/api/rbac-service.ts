import { api, ApiRequestError } from "./client";
import type {
  AdminRole,
  AdminUser,
  CapabilitiesResponse,
  CreateRoleInput,
  PermissionDefinition,
  UpdateRoleInput,
  UpdateUserInput,
} from "./rbac-types";

/** Production exposes /identity/auth/capabilities; Phase 2 also adds /identity/me/capabilities. */
async function getCapabilities(): Promise<CapabilitiesResponse> {
  const paths = ["/identity/auth/capabilities", "/identity/me/capabilities"] as const;
  let lastError: unknown;
  for (const path of paths) {
    try {
      return (await api.get<CapabilitiesResponse>(path)).data;
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
    list: () => api.get<PermissionDefinition[]>("/admin/permissions"),
  },

  users: {
    list: (params?: { limit?: number; offset?: number }) =>
      api.get<AdminUser[]>("/admin/users", params),
    get: (id: string) => api.get<AdminUser>(`/admin/users/${id}`),
    update: (id: string, input: UpdateUserInput) =>
      api.patch<AdminUser>(`/admin/users/${id}`, input),
    listRoles: (id: string) => api.get<string[]>(`/admin/users/${id}/roles`),
    assignRole: (id: string, roleKey: string) =>
      api.post<null>(`/admin/users/${id}/roles`, { roleKey }),
    removeRole: (id: string, roleKey: string) =>
      api.delete<null>(`/admin/users/${id}/roles/${roleKey}`),
  },

  roles: {
    list: () => api.get<AdminRole[]>("/admin/roles"),
    get: (roleKey: string) => api.get<AdminRole>(`/admin/roles/${roleKey}`),
    create: (input: CreateRoleInput) => api.post<AdminRole>("/admin/roles", input),
    update: (roleKey: string, input: UpdateRoleInput) =>
      api.patch<AdminRole>(`/admin/roles/${roleKey}`, input),
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

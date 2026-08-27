import { api } from "./client";
import type {
  AdminRole,
  AdminUser,
  CapabilitiesResponse,
  CreateRoleInput,
  PermissionDefinition,
  UpdateRoleInput,
  UpdateUserInput,
} from "./rbac-types";

export const rbacApi = {
  capabilities: () => api.get<CapabilitiesResponse>("/identity/me/capabilities"),

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

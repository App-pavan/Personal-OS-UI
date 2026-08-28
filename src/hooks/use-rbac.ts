import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccessControlPermissions } from "@/features/capabilities/capabilities-context";
import { errorMessage } from "@/lib/api/errors";
import { rbacApi } from "@/lib/api/rbac-service";
import type { CreateRoleInput, CreateUserInput, UpdateRoleInput, UpdateUserInput } from "@/lib/api/rbac-types";
import { capabilityKeys } from "./use-capabilities";

export const rbacKeys = {
  all: ["rbac"] as const,
  adminProbe: ["rbac", "admin-probe"] as const,
  permissions: ["rbac", "permissions"] as const,
  users: ["rbac", "users"] as const,
  user: (id: string) => ["rbac", "users", id] as const,
  userRoles: (id: string) => ["rbac", "users", id, "roles"] as const,
  roles: ["rbac", "roles"] as const,
  role: (key: string) => ["rbac", "roles", key] as const,
  rolePermissions: (key: string) => ["rbac", "roles", key, "permissions"] as const,
};

const fail = (fallback: string) => (error: unknown) => toast.error(errorMessage(error, fallback));

function invalidateAccess(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: rbacKeys.all });
  void qc.invalidateQueries({ queryKey: capabilityKeys.all });
}

/** Probes whether Phase 2 admin APIs are deployed (/admin/*). */
export function useAdminApiProbe() {
  const { canViewAccessControl, isReady } = useAccessControlPermissions();
  return useQuery({
    queryKey: rbacKeys.adminProbe,
    queryFn: async () => {
      await rbacApi.permissions.list();
      return true as const;
    },
    enabled: isReady && canViewAccessControl,
    retry: false,
    staleTime: 10 * 60_000,
  });
}

export function usePermissionCatalog() {
  const { canViewAccessControl, isReady } = useAccessControlPermissions();
  return useQuery({
    queryKey: rbacKeys.permissions,
    queryFn: async () => (await rbacApi.permissions.list()).data,
    enabled: isReady && canViewAccessControl,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useAdminUsers() {
  const { canViewAccessControl, isReady } = useAccessControlPermissions();
  return useQuery({
    queryKey: rbacKeys.users,
    queryFn: async () => (await rbacApi.users.list({ limit: 100 })).data,
    enabled: isReady && canViewAccessControl,
    retry: 1,
  });
}

export function useAdminUser(id: string | null) {
  const { canViewAccessControl, isReady } = useAccessControlPermissions();
  return useQuery({
    queryKey: rbacKeys.user(id ?? "none"),
    queryFn: async () => (await rbacApi.users.get(id!)).data,
    enabled: Boolean(id) && isReady && canViewAccessControl,
    retry: 1,
  });
}

export function useAdminRoles() {
  const { canViewAccessControl, isReady } = useAccessControlPermissions();
  return useQuery({
    queryKey: rbacKeys.roles,
    queryFn: async () => (await rbacApi.roles.list()).data,
    enabled: isReady && canViewAccessControl,
    retry: 1,
  });
}

export function useAdminRole(roleKey: string | null) {
  const { canViewAccessControl, isReady } = useAccessControlPermissions();
  return useQuery({
    queryKey: rbacKeys.role(roleKey ?? "none"),
    queryFn: async () => (await rbacApi.roles.get(roleKey!)).data,
    enabled: Boolean(roleKey) && isReady && canViewAccessControl,
    retry: 1,
  });
}

export function useUserMutations() {
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      rbacApi.users.update(id, input),
    onSuccess: (_, { id }) => {
      invalidateAccess(qc);
      void qc.invalidateQueries({ queryKey: rbacKeys.user(id) });
      toast.success("User updated");
    },
    onError: fail("Unable to update user"),
  });

  const assignRole = useMutation({
    mutationFn: ({ userId, roleKey }: { userId: string; roleKey: string }) =>
      rbacApi.users.assignRole(userId, roleKey),
    onSuccess: (_, { userId }) => {
      invalidateAccess(qc);
      void qc.invalidateQueries({ queryKey: rbacKeys.user(userId) });
      void qc.invalidateQueries({ queryKey: rbacKeys.users });
      toast.success("Role assigned");
    },
    onError: fail("Unable to assign role"),
  });

  const removeRole = useMutation({
    mutationFn: ({ userId, roleKey }: { userId: string; roleKey: string }) =>
      rbacApi.users.removeRole(userId, roleKey),
    onSuccess: (_, { userId }) => {
      invalidateAccess(qc);
      void qc.invalidateQueries({ queryKey: rbacKeys.user(userId) });
      void qc.invalidateQueries({ queryKey: rbacKeys.users });
      toast.success("Role removed");
    },
    onError: fail("Unable to remove role"),
  });

  const create = useMutation({
    mutationFn: (input: CreateUserInput) => rbacApi.users.create(input),
    onSuccess: () => {
      invalidateAccess(qc);
      void qc.invalidateQueries({ queryKey: rbacKeys.users });
      toast.success("User created successfully");
    },
  });

  return { update, assignRole, removeRole, create };
}

export function useRoleMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (input: CreateRoleInput) => rbacApi.roles.create(input),
    onSuccess: () => {
      invalidateAccess(qc);
      toast.success("Role created");
    },
    onError: fail("Unable to create role"),
  });

  const update = useMutation({
    mutationFn: ({ roleKey, input }: { roleKey: string; input: UpdateRoleInput }) =>
      rbacApi.roles.update(roleKey, input),
    onSuccess: (_, { roleKey }) => {
      invalidateAccess(qc);
      void qc.invalidateQueries({ queryKey: rbacKeys.role(roleKey) });
      void qc.invalidateQueries({ queryKey: rbacKeys.roles });
      toast.success("Role updated");
    },
    onError: fail("Unable to update role"),
  });

  const remove = useMutation({
    mutationFn: (roleKey: string) => rbacApi.roles.delete(roleKey),
    onSuccess: () => {
      invalidateAccess(qc);
      toast.success("Role deleted");
    },
    onError: fail("Unable to delete role"),
  });

  const replacePermissions = useMutation({
    mutationFn: ({ roleKey, permissions }: { roleKey: string; permissions: string[] }) =>
      rbacApi.roles.replacePermissions(roleKey, permissions),
    onSuccess: (_, { roleKey }) => {
      invalidateAccess(qc);
      void qc.invalidateQueries({ queryKey: rbacKeys.role(roleKey) });
      void qc.invalidateQueries({ queryKey: rbacKeys.roles });
      toast.success("Permissions updated");
    },
    onError: fail("Unable to update permissions"),
  });

  return { create, update, remove, replacePermissions };
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import {
  canManageRoles,
  canManageUsers,
  canViewAccessControl,
  hasPermission,
} from "@/features/access/lib/access-permissions";
import { rbacApi } from "@/lib/api/rbac-service";

export const capabilityKeys = {
  all: ["capabilities"] as const,
  me: ["capabilities", "me"] as const,
};

export function useCapabilities() {
  const { status } = useAuth();
  const query = useQuery({
    queryKey: capabilityKeys.me,
    queryFn: async () => (await rbacApi.capabilities()).data,
    enabled: status === "signed_in",
    staleTime: 60_000,
    retry: 1,
  });

  const caps = query.data;

  return {
    ...query,
    caps,
    canViewAccessControl: canViewAccessControl(caps),
    canManageUsers: canManageUsers(caps),
    canManageRoles: canManageRoles(caps),
    hasPermission: (permission: string) => hasPermission(caps, permission),
  };
}

export function useInvalidateCapabilities() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: capabilityKeys.all });
}

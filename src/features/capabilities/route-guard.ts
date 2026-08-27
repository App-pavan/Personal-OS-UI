import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { capabilityKeys } from "@/features/capabilities/capabilities-context";
import { rbacApi } from "@/lib/api/rbac-service";
import type { PermissionKey } from "@/lib/permissions";

async function loadCapabilities(queryClient: QueryClient) {
  return queryClient.fetchQuery({
    queryKey: capabilityKeys.me,
    queryFn: async () => (await rbacApi.capabilities()).data,
    staleTime: 60_000,
  });
}

export function requirePermissions(permissions: PermissionKey | PermissionKey[]) {
  const keys = Array.isArray(permissions) ? permissions : [permissions];
  return async ({ context }: { context: { queryClient: QueryClient } }) => {
    try {
      const caps = await loadCapabilities(context.queryClient);
      const granted = new Set(caps.permissions);
      const allowed = keys.some((k) => granted.has(k));
      if (!allowed) {
        throw redirect({ to: "/access-restricted" });
      }
    } catch (error) {
      if (error && typeof error === "object" && "to" in error) throw error;
      throw redirect({ to: "/access-restricted" });
    }
  };
}

import type { QueryClient } from "@tanstack/react-query";
import { capabilityKeys } from "@/features/capabilities/capabilities-context";
import { getCapabilityStore } from "@/features/capabilities/capability-store";
import { rbacApi } from "@/lib/api/rbac-service";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { grantedPermissions } from "@/lib/api/rbac-normalize";
import type { PermissionKey } from "@/lib/permissions";

const CAPABILITIES_STALE_MS = 60_000;

function readQueryCache(queryClient: QueryClient): CapabilitiesResponse | undefined {
  return queryClient.getQueryData<CapabilitiesResponse>(capabilityKeys.me);
}

async function fetchCapabilities(): Promise<CapabilitiesResponse> {
  return (await rbacApi.capabilities()).data;
}

/**
 * Resolves capabilities for route guards without treating transient failures as denial.
 * Prefers in-memory caches so navigation never re-fetches stale data just to decide access.
 */
export async function resolveCapabilitiesForGuard(
  queryClient: QueryClient,
): Promise<CapabilitiesResponse> {
  const queryCached = readQueryCache(queryClient);
  if (queryCached) return queryCached;

  const storeCached = getCapabilityStore();
  if (storeCached) return storeCached;

  try {
    return await queryClient.ensureQueryData({
      queryKey: capabilityKeys.me,
      queryFn: fetchCapabilities,
      staleTime: CAPABILITIES_STALE_MS,
    });
  } catch (error) {
    const retryQuery = readQueryCache(queryClient);
    if (retryQuery) return retryQuery;

    const retryStore = getCapabilityStore();
    if (retryStore) return retryStore;

    throw error;
  }
}

export function hasRequiredPermission(
  caps: CapabilitiesResponse,
  permissions: PermissionKey | PermissionKey[],
): boolean {
  const keys = Array.isArray(permissions) ? permissions : [permissions];
  const granted = new Set(grantedPermissions(caps));
  return keys.some((key) => granted.has(key));
}

export type AuthDecisionLog = {
  route?: string | undefined;
  required: string[];
  result: "allowed" | "denied" | "error";
  authState: "ready";
  permissionsSource: "query_cache" | "sync_store" | "fetched";
  redirectReason?: string | undefined;
  errorKind?: string | undefined;
};

export function permissionsSource(
  queryClient: QueryClient,
  caps: CapabilitiesResponse,
): AuthDecisionLog["permissionsSource"] {
  if (readQueryCache(queryClient) === caps) return "query_cache";
  if (getCapabilityStore() === caps) return "sync_store";
  return "fetched";
}

export function logAuthDecision(entry: AuthDecisionLog): void {
  if (!import.meta.env.DEV) return;
  console.debug("[auth-guard]", entry);
}

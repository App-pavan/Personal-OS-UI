import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-context";
import {
  canAnySync,
  canSync,
  clearCapabilityStore,
  setCapabilityStore,
} from "@/features/capabilities/capability-store";
import { rbacApi } from "@/lib/api/rbac-service";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { setForbiddenHandler } from "@/lib/api/client";

export const capabilityKeys = {
  all: ["capabilities"] as const,
  me: ["capabilities", "me"] as const,
};

type CapabilitiesValue = {
  caps: CapabilitiesResponse | undefined;
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
  error: unknown;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  refresh: () => Promise<void>;
};

const CapabilitiesContext = createContext<CapabilitiesValue | null>(null);

async function fetchCapabilities(): Promise<CapabilitiesResponse> {
  return (await rbacApi.capabilities()).data;
}

export function CapabilitiesProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: capabilityKeys.me,
    queryFn: fetchCapabilities,
    enabled: status === "signed_in",
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (status === "signed_in" && query.data && user?.id) {
      setCapabilityStore(user.id, query.data);
    }
  }, [status, query.data, user?.id]);

  useEffect(() => {
    if (status === "signed_out") {
      clearCapabilityStore();
      queryClient.removeQueries({ queryKey: capabilityKeys.all });
      queryClient.clear();
    }
  }, [status, queryClient]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: capabilityKeys.all });
    await queryClient.refetchQueries({ queryKey: capabilityKeys.me });
  }, [queryClient]);

  useEffect(() => {
    setForbiddenHandler(() => {
      void refresh();
    });
    return () => setForbiddenHandler(() => {});
  }, [refresh]);

  const caps = query.data;

  const settled = status === "signed_in" && query.isFetched && !query.isFetching;

  const value = useMemo<CapabilitiesValue>(
    () => ({
      caps,
      isLoading: status === "signed_in" && (query.isLoading || query.isFetching),
      isReady: settled && (Boolean(caps) || query.isError),
      isError: query.isError,
      error: query.error,
      can: (permission: string) => {
        if (caps) return caps.permissions.includes(permission);
        return canSync(permission);
      },
      canAny: (permissions: string[]) => {
        if (caps) {
          const granted = new Set(caps.permissions);
          return permissions.some((p) => granted.has(p));
        }
        return canAnySync(permissions);
      },
      refresh,
    }),
    [caps, status, settled, query.isError, query.error, refresh],
  );

  return <CapabilitiesContext.Provider value={value}>{children}</CapabilitiesContext.Provider>;
}

export function useCapabilities(): CapabilitiesValue {
  const ctx = useContext(CapabilitiesContext);
  if (!ctx) throw new Error("useCapabilities must be used inside CapabilitiesProvider");
  return ctx;
}

/** Convenience helpers for Access Control (Phase 3). */
export function useAccessControlPermissions() {
  const caps = useCapabilities();
  return {
    ...caps,
    canViewAccessControl: caps.canAny(["settings.users.view", "settings.roles.view"]),
    canManageUsers: caps.can("settings.users.manage"),
    canManageRoles: caps.can("settings.roles.manage"),
    hasPermission: caps.can,
  };
}

import { isRedirect } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { capabilityKeys } from "@/features/capabilities/capabilities-context";
import { clearCapabilityStore } from "@/features/capabilities/capability-store";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { ApiRequestError } from "@/lib/api/errors";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { PERM } from "@/lib/permissions";

const ownerCaps: CapabilitiesResponse = {
  user: { id: "u1", roleSummary: ["owner"] },
  permissions: [PERM.TASKS_VIEW],
  modules: {},
};

const memberCaps: CapabilitiesResponse = {
  user: { id: "u2", roleSummary: ["family_member"] },
  permissions: [PERM.CHECKLISTS_VIEW],
  modules: {},
};

vi.mock("@/lib/api/rbac-service", () => ({
  rbacApi: {
    capabilities: vi.fn(),
  },
}));

import { rbacApi } from "@/lib/api/rbac-service";

function runGuard(permissions: string | string[], queryClient: QueryClient) {
  const guard = requirePermissions(permissions as never);
  return guard({
    context: { queryClient },
    location: { pathname: "/tasks" },
  });
}

describe("requirePermissions", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    clearCapabilityStore();
    vi.mocked(rbacApi.capabilities).mockReset();
  });

  it("allows navigation when cached permissions include the requirement", async () => {
    queryClient.setQueryData(capabilityKeys.me, ownerCaps);

    await expect(runGuard(PERM.TASKS_VIEW, queryClient)).resolves.toBeUndefined();
  });

  it("redirects only when capabilities are loaded and permission is missing", async () => {
    queryClient.setQueryData(capabilityKeys.me, memberCaps);

    await expect(runGuard(PERM.TASKS_VIEW, queryClient)).rejects.toSatisfy((error: unknown) =>
      isRedirect(error),
    );
  });

  it("propagates network errors instead of redirecting to access-restricted", async () => {
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("network", "Network unavailable"),
    );

    await expect(runGuard(PERM.TASKS_VIEW, queryClient)).rejects.toMatchObject({
      kind: "network",
    });
  });

  it("propagates 401 instead of redirecting to access-restricted", async () => {
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("unauthorized", "Session expired", 401),
    );

    await expect(runGuard(PERM.TASKS_VIEW, queryClient)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("redirects on confirmed 403 from capabilities fetch", async () => {
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("forbidden", "Forbidden", 403),
    );

    await expect(runGuard(PERM.TASKS_VIEW, queryClient)).rejects.toSatisfy((error: unknown) =>
      isRedirect(error),
    );
  });

  it("uses cached capabilities when a stale refetch would fail", async () => {
    queryClient.setQueryData(capabilityKeys.me, ownerCaps);
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("server", "Server error", 500),
    );

    await expect(runGuard(PERM.TASKS_VIEW, queryClient)).resolves.toBeUndefined();
    expect(rbacApi.capabilities).not.toHaveBeenCalled();
  });
});

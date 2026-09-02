import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { capabilityKeys } from "@/features/capabilities/capabilities-context";
import {
  clearCapabilityStore,
  setCapabilityStore,
} from "@/features/capabilities/capability-store";
import {
  hasRequiredPermission,
  resolveCapabilitiesForGuard,
} from "@/features/capabilities/resolve-capabilities";
import { ApiRequestError } from "@/lib/api/errors";
import type { CapabilitiesResponse } from "@/lib/api/rbac-types";
import { PERM } from "@/lib/permissions";

const ownerCaps: CapabilitiesResponse = {
  user: { id: "u1", roleSummary: ["owner"] },
  permissions: [PERM.TASKS_VIEW, PERM.CHECKLISTS_VIEW],
  modules: {},
};

vi.mock("@/lib/api/rbac-service", () => ({
  rbacApi: {
    capabilities: vi.fn(),
  },
}));

import { rbacApi } from "@/lib/api/rbac-service";

describe("resolveCapabilitiesForGuard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    clearCapabilityStore();
    vi.mocked(rbacApi.capabilities).mockReset();
  });

  it("uses react-query cache without refetching", async () => {
    queryClient.setQueryData(capabilityKeys.me, ownerCaps);
    const fetchSpy = vi.mocked(rbacApi.capabilities);

    const caps = await resolveCapabilitiesForGuard(queryClient);

    expect(caps).toEqual(ownerCaps);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses sync capability store when query cache is empty", async () => {
    setCapabilityStore("u1", ownerCaps);
    const fetchSpy = vi.mocked(rbacApi.capabilities);

    const caps = await resolveCapabilitiesForGuard(queryClient);

    expect(caps).toEqual(ownerCaps);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fetches when no cache exists", async () => {
    vi.mocked(rbacApi.capabilities).mockResolvedValue({ data: ownerCaps });

    const caps = await resolveCapabilitiesForGuard(queryClient);

    expect(caps).toEqual(ownerCaps);
    expect(rbacApi.capabilities).toHaveBeenCalledOnce();
  });

  it("falls back to query cache when fetch fails", async () => {
    queryClient.setQueryData(capabilityKeys.me, ownerCaps);
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("network", "Network unavailable"),
    );

    const caps = await resolveCapabilitiesForGuard(queryClient);

    expect(caps).toEqual(ownerCaps);
    expect(rbacApi.capabilities).not.toHaveBeenCalled();
  });

  it("falls back to sync store when fetch fails and query cache is empty", async () => {
    setCapabilityStore("u1", ownerCaps);
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("server", "Server error", 500),
    );

    const caps = await resolveCapabilitiesForGuard(queryClient);

    expect(caps).toEqual(ownerCaps);
    expect(rbacApi.capabilities).not.toHaveBeenCalled();
  });

  it("rethrows when fetch fails and no cache exists", async () => {
    vi.mocked(rbacApi.capabilities).mockRejectedValue(
      new ApiRequestError("network", "Network unavailable"),
    );

    await expect(resolveCapabilitiesForGuard(queryClient)).rejects.toMatchObject({
      kind: "network",
    });
  });
});

describe("hasRequiredPermission", () => {
  it("allows when any required permission is granted", () => {
    expect(hasRequiredPermission(ownerCaps, PERM.TASKS_VIEW)).toBe(true);
    expect(hasRequiredPermission(ownerCaps, [PERM.WEALTH_PORTFOLIO_VIEW, PERM.TASKS_VIEW])).toBe(
      true,
    );
  });

  it("denies when no required permission is granted", () => {
    expect(hasRequiredPermission(ownerCaps, PERM.WEALTH_PORTFOLIO_VIEW)).toBe(false);
  });
});

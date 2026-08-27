import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { buildPermissionTree, moduleLabel } from "@/features/access/lib/permission-tree";
import { useAdminRoles, useAdminUsers, usePermissionCatalog } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/api/rbac-types";

function roleDisplayName(roleKey: string, roles: { key: string; name: string }[]): string {
  return roles.find((r) => r.key === roleKey)?.name ?? roleKey.replace(/_/g, " ");
}

function userModuleSummary(user: AdminUser, roles: { key: string; permissions?: string[] }[]) {
  const granted = new Set<string>();
  for (const roleKey of user.roles) {
    const role = roles.find((r) => r.key === roleKey);
    for (const p of role?.permissions ?? []) granted.add(p);
  }
  const modules = new Set<string>();
  for (const key of granted) {
    const mod = key.split(".")[0];
    if (mod) modules.add(mod);
  }
  if (user.roles.includes("owner")) return "All modules";
  if (modules.size === 0) return "No modules";
  if (modules.size <= 2) {
    return [...modules].map(moduleLabel).join(", ");
  }
  return `${modules.size} modules`;
}

export function UsersList() {
  const users = useAdminUsers();
  const roles = useAdminRoles();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users.data ?? []).filter((u) => {
      if (filter === "active" && !u.isActive) return false;
      if (filter === "inactive" && u.isActive) return false;
      if (!q) return true;
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [users.data, search, filter]);

  if (users.isError) {
    return <ErrorState error={users.error} onRetry={() => users.refetch()} />;
  }
  if (users.isLoading || roles.isLoading) return <RowsSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-hairline p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition",
                filter === f
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No users found" line="Adjust your search or filters." />
      ) : (
        <ul className="surface-raised hairline-list divide-y divide-hairline rounded-xl">
          {filtered.map((user) => (
            <li key={user.id}>
              <Link
                to="/settings/access/users/$id"
                params={{ id: user.id }}
                className="flex items-center gap-4 px-4 py-4 transition hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{user.displayName || user.email}</p>
                    {!user.isActive && (
                      <Badge variant="secondary" className="text-[10px]">
                        Inactive
                      </Badge>
                    )}
                    {user.roles.includes("owner") && <Badge className="text-[10px]">Owner</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {user.roles.map((roleKey) => (
                      <Badge key={roleKey} variant="outline" className="text-[10px] font-normal">
                        {roleDisplayName(roleKey, roles.data ?? [])}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-muted-foreground">Module access</p>
                  <p className="mt-0.5 text-sm">{userModuleSummary(user, roles.data ?? [])}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Compute effective permissions for a user from their assigned roles. */
export function useEffectiveUserPermissions(userRoles: string[]) {
  const roles = useAdminRoles();
  const catalog = usePermissionCatalog();

  return useMemo(() => {
    const granted = new Set<string>();
    for (const roleKey of userRoles) {
      const role = roles.data?.find((r) => r.key === roleKey);
      for (const p of role?.permissions ?? []) granted.add(p);
    }
    const tree = buildPermissionTree(catalog.data ?? []);
    return { granted, tree, roles: roles.data ?? [] };
  }, [userRoles, roles.data, catalog.data]);
}

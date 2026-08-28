import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { CreateUserDialog } from "@/features/access/components/create-user-dialog";
import { summarizeFromRoles } from "@/features/access/lib/user-access-summary";
import { useAuth } from "@/features/auth/auth-context";
import { useCapabilities, useAccessControlPermissions } from "@/features/capabilities/capabilities-context";
import { useAdminRoles, useAdminUsers } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/api/rbac-types";

function roleDisplayName(roleKey: string, roles: { key: string; name: string }[]): string {
  return roles.find((r) => r.key === roleKey)?.name ?? roleKey.replace(/_/g, " ");
}

function primaryRole(user: AdminUser): string {
  return user.roles[0] ?? "";
}

export function UsersList() {
  const users = useAdminUsers();
  const roles = useAdminRoles();
  const { user: sessionUser } = useAuth();
  const { caps } = useCapabilities();
  const { canManageUsers } = useAccessControlPermissions();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [createOpen, setCreateOpen] = useState(false);

  const currentUserId = caps?.user.id || sessionUser?.id || "";

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
        {canManageUsers && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Create user
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          line={
            canManageUsers ? "Create a user or adjust your search." : "Adjust your search or filters."
          }
          action={
            canManageUsers ? (
              <Button onClick={() => setCreateOpen(true)}>Create user</Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="surface-raised hairline-list divide-y divide-hairline rounded-xl">
          {filtered.map((user) => {
            const isSelf = user.id === currentUserId;
            const summary = summarizeFromRoles(user.roles, roles.data ?? [], user.isProtectedOwner);
            const roleKey = primaryRole(user);

            return (
              <li key={user.id}>
                <Link
                  to="/settings/access/users/$id"
                  params={{ id: user.id }}
                  className="flex items-center gap-4 px-4 py-4 transition hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{user.displayName || user.email}</p>
                      {isSelf && (
                        <Badge variant="outline" className="text-[10px]">
                          YOU
                        </Badge>
                      )}
                      {!user.isActive && (
                        <Badge variant="secondary" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                      {user.isProtectedOwner && <Badge className="text-[10px]">Owner</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {roleKey && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {roleDisplayName(roleKey, roles.data ?? [])}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-muted-foreground">
                      {summary.protected ? "Protected" : "Module access"}
                    </p>
                    <p className="mt-0.5 text-sm">{summary.moduleLabel}</p>
                    {!summary.protected && summary.permissionCount > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {summary.permissionCount} permissions
                      </p>
                    )}
                  </div>
                  <div className="hidden shrink-0 text-right md:block">
                    <p className="text-xs text-primary">
                      {isSelf && summary.protected
                        ? "Protected"
                        : canManageUsers && !isSelf && !user.isProtectedOwner
                          ? "Manage access →"
                          : "View →"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

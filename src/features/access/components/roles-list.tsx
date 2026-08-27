import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { buildPermissionTree, moduleHasAccess } from "@/features/access/lib/permission-tree";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useAdminRoles, usePermissionCatalog } from "@/hooks/use-rbac";
import { CreateRoleDialog } from "./create-role-dialog";

export function RolesList() {
  const roles = useAdminRoles();
  const catalog = usePermissionCatalog();
  const { canManageRoles } = useCapabilities();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const tree = useMemo(() => buildPermissionTree(catalog.data ?? []), [catalog.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (roles.data ?? []).filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.key.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [roles.data, search]);

  if (roles.isError) {
    return <ErrorState error={roles.error} onRetry={() => roles.refetch()} />;
  }
  if (roles.isLoading) return <RowsSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {canManageRoles && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Create role
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No roles found"
          line={canManageRoles ? "Create a role to define reusable access." : "Adjust your search."}
          action={
            canManageRoles ? (
              <Button onClick={() => setCreateOpen(true)}>Create role</Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="surface-raised hairline-list divide-y divide-hairline rounded-xl">
          {filtered.map((role) => {
            const granted = new Set(role.permissions ?? []);
            const modules = tree.filter((m) => moduleHasAccess(m.key, granted));
            return (
              <li key={role.key}>
                <Link
                  to="/settings/access/roles/$roleKey"
                  params={{ roleKey: role.key }}
                  className="flex items-center gap-4 px-4 py-4 transition hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{role.name}</p>
                      <Badge
                        variant={role.isSystem ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {role.isSystem ? "System" : "Custom"}
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{role.description}</p>
                    )}
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-muted-foreground">
                      {modules.length} modules · {(role.permissions ?? []).length} permissions
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

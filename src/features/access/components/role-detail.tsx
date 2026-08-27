import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { PermissionTreeEditor } from "@/features/access/components/permission-tree-editor";
import { buildPermissionTree, moduleHasAccess } from "@/features/access/lib/permission-tree";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useAdminRole, usePermissionCatalog, useRoleMutations } from "@/hooks/use-rbac";

type Props = { roleKey: string };

export function RoleDetail({ roleKey }: Props) {
  const role = useAdminRole(roleKey);
  const catalog = usePermissionCatalog();
  const { canManageRoles } = useCapabilities();
  const mutations = useRoleMutations();
  const [draft, setDraft] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (role.data?.permissions) setDraft(role.data.permissions);
  }, [role.data?.permissions]);

  const pendingCount = useMemo(() => {
    const original = new Set(role.data?.permissions ?? []);
    const next = new Set(draft);
    let count = 0;
    for (const k of original) if (!next.has(k)) count++;
    for (const k of next) if (!original.has(k)) count++;
    return count;
  }, [role.data?.permissions, draft]);

  const preview = useMemo(() => {
    const granted = new Set(draft);
    const tree = buildPermissionTree(catalog.data ?? []);
    const modules = tree.filter((m) => moduleHasAccess(m.key, granted));
    return { modules, count: draft.length };
  }, [draft, catalog.data]);

  if (role.isError) {
    return <ErrorState error={role.error} onRetry={() => role.refetch()} />;
  }
  if (role.isLoading || catalog.isLoading) return <RowsSkeleton rows={8} />;

  const r = role.data!;
  const readOnly = !canManageRoles || r.isSystem;
  const isOwner = r.key === "owner";

  return (
    <div className="space-y-6">
      <Link
        to="/settings/access/roles"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All roles
      </Link>

      <header>
        <p className="label-eyebrow">Role</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="display-lg">{r.name}</h2>
          <Badge variant={r.isSystem ? "secondary" : "outline"}>
            {r.isSystem ? "System" : "Custom"}
          </Badge>
        </div>
        {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
      </header>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Current role access</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Modules</p>
            <p className="mt-1 text-sm">
              {preview.modules.length ? preview.modules.map((m) => m.label).join(", ") : "None"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Permissions</p>
            <p className="mt-1 text-sm">{preview.count}</p>
          </div>
        </div>
      </section>

      <section className="surface-raised p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="label-eyebrow">Permissions</p>
          {pendingCount > 0 && canManageRoles && !readOnly && (
            <span className="text-xs font-medium text-primary">
              {pendingCount} change{pendingCount === 1 ? "" : "s"} pending
            </span>
          )}
        </div>
        {isOwner && (
          <p className="mt-2 text-sm text-muted-foreground">
            Owner has full platform access. Permissions cannot be modified.
          </p>
        )}
        {r.isSystem && !isOwner && (
          <p className="mt-2 text-sm text-muted-foreground">
            System role permissions are managed by the platform.
          </p>
        )}
        <div className="mt-4">
          {catalog.data && (
            <PermissionTreeEditor
              definitions={catalog.data}
              value={draft}
              onChange={setDraft}
              disabled={readOnly || mutations.replacePermissions.isPending}
            />
          )}
        </div>
        {canManageRoles && !readOnly && pendingCount > 0 && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDraft(role.data?.permissions ?? [])}
              disabled={mutations.replacePermissions.isPending}
            >
              Discard
            </Button>
            <Button
              onClick={() =>
                mutations.replacePermissions.mutate(
                  { roleKey, permissions: draft },
                  { onSuccess: () => role.refetch() },
                )
              }
              disabled={mutations.replacePermissions.isPending}
            >
              {mutations.replacePermissions.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </section>

      {canManageRoles && !r.isSystem && (
        <section className="surface-raised border-destructive/20 p-5">
          <p className="label-eyebrow text-destructive">Danger zone</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting a custom role removes it from all users who have it assigned.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" /> Delete role
          </Button>
        </section>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{r.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Users with this role will lose its permissions unless another
              role provides them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                mutations.remove.mutate(roleKey, {
                  onSuccess: () => {
                    window.history.back();
                  },
                })
              }
            >
              Delete role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

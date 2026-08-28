import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { ModuleAccessRow } from "@/features/access/components/access-summary";
import {
  moduleHasAccess,
  moduleLabel,
  buildPermissionTree,
} from "@/features/access/lib/permission-tree";
import { useAccessControlPermissions } from "@/features/capabilities/capabilities-context";
import {
  useAdminRoles,
  useAdminUser,
  usePermissionCatalog,
  useUserMutations,
} from "@/hooks/use-rbac";
import { AssignRoleDialog } from "./assign-role-dialog";

type Props = { userId: string };

export function UserDetail({ userId }: Props) {
  const user = useAdminUser(userId);
  const roles = useAdminRoles();
  const catalog = usePermissionCatalog();
  const { canManageUsers } = useAccessControlPermissions();
  const mutations = useUserMutations();
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeRoleKey, setRemoveRoleKey] = useState<string | null>(null);

  const effective = useMemo(() => {
    const granted = new Set<string>();
    for (const roleKey of user.data?.roles ?? []) {
      const role = roles.data?.find((r) => r.key === roleKey);
      for (const p of role?.permissions ?? []) granted.add(p);
    }
    const tree = buildPermissionTree(catalog.data ?? []);
    return { granted, tree };
  }, [user.data?.roles, roles.data, catalog.data]);

  const removePreview = useMemo(() => {
    if (!removeRoleKey) return null;
    const role = roles.data?.find((r) => r.key === removeRoleKey);
    const modules = new Set<string>();
    for (const p of role?.permissions ?? []) {
      modules.add(p.split(".")[0] ?? p);
    }
    return {
      name: role?.name ?? removeRoleKey,
      modules: [...modules].map(moduleLabel),
      permissions: role?.permissions ?? [],
    };
  }, [removeRoleKey, roles.data]);

  if (user.isError) {
    return <ErrorState error={user.error} onRetry={() => user.refetch()} />;
  }
  if (user.isLoading || roles.isLoading) return <RowsSkeleton rows={8} />;

  const u = user.data!;
  const isOwner = u.roles.includes("owner");

  return (
    <div className="space-y-6">
      <Link
        to="/settings/access/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All users
      </Link>

      <header>
        <p className="label-eyebrow">User</p>
        <h2 className="display-lg mt-2">{u.displayName || u.email}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{u.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={u.isActive ? "default" : "secondary"}>
            {u.isActive ? "Active" : "Inactive"}
          </Badge>
          {isOwner && <Badge>Owner</Badge>}
        </div>
      </header>

      <section className="surface-raised p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="label-eyebrow">Roles</p>
          {canManageUsers && !isOwner && (
            <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
              <Plus className="size-3.5" /> Assign role
            </Button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {u.roles.map((roleKey) => {
            const role = roles.data?.find((r) => r.key === roleKey);
            const canRemove =
              canManageUsers && roleKey !== "owner" && !(isOwner && u.roles.length === 1);
            return (
              <div
                key={roleKey}
                className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{role?.name ?? roleKey}</p>
                  {role?.isSystem && (
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      System role
                    </p>
                  )}
                </div>
                {canRemove && (
                  <button
                    type="button"
                    aria-label={`Remove ${role?.name ?? roleKey}`}
                    onClick={() => setRemoveRoleKey(roleKey)}
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Module access</p>
        <div className="mt-3 hairline-list">
          {effective.tree.map((mod) => (
            <ModuleAccessRow
              key={mod.key}
              label={mod.label}
              granted={moduleHasAccess(mod.key, effective.granted)}
            />
          ))}
        </div>
      </section>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Effective access</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Combined permissions from all assigned roles.
        </p>
        <div className="mt-4 space-y-4">
          {effective.tree
            .filter((mod) => moduleHasAccess(mod.key, effective.granted))
            .map((mod) => (
              <div key={mod.key}>
                <p className="text-sm font-medium">{mod.label}</p>
                <ul className="mt-2 space-y-1 pl-1">
                  {mod.features.flatMap((feat) =>
                    feat.actions
                      .filter((action) => effective.granted.has(action.key))
                      .map((action) => (
                        <li key={action.key} className="flex items-center gap-2 text-sm">
                          <span className="text-success">✓</span>
                          {action.description}
                        </li>
                      )),
                  )}
                </ul>
              </div>
            ))}
          {effective.granted.size === 0 && (
            <p className="text-sm text-muted-foreground">No permissions granted.</p>
          )}
        </div>
      </section>

      <AssignRoleDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        userId={userId}
        userName={u.displayName || u.email}
        currentRoles={u.roles}
      />

      <AlertDialog open={Boolean(removeRoleKey)} onOpenChange={() => setRemoveRoleKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &ldquo;{removePreview?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>This will remove the following access unless another role provides it:</p>
                {removePreview?.modules.length ? (
                  <ul className="list-inside list-disc">
                    {removePreview.modules.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No module permissions from this role.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!removeRoleKey) return;
                mutations.removeRole.mutate(
                  { userId, roleKey: removeRoleKey },
                  { onSuccess: () => setRemoveRoleKey(null) },
                );
              }}
            >
              Remove role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

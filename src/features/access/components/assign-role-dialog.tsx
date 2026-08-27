import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildPermissionTree, moduleHasAccess } from "@/features/access/lib/permission-tree";
import { useAdminRoles, usePermissionCatalog, useUserMutations } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentRoles: string[];
};

export function AssignRoleDialog({ open, onOpenChange, userId, userName, currentRoles }: Props) {
  const roles = useAdminRoles();
  const catalog = usePermissionCatalog();
  const mutations = useUserMutations();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const available = useMemo(
    () => (roles.data ?? []).filter((r) => !currentRoles.includes(r.key)),
    [roles.data, currentRoles],
  );

  const preview = useMemo(() => {
    if (!selected) return null;
    const role = roles.data?.find((r) => r.key === selected);
    const granted = new Set(role?.permissions ?? []);
    const tree = buildPermissionTree(catalog.data ?? []);
    return { role, tree, granted };
  }, [selected, roles.data, catalog.data]);

  const handleClose = () => {
    setSelected(null);
    setConfirm(false);
    onOpenChange(false);
  };

  const handleAssign = () => {
    if (!selected) return;
    mutations.assignRole.mutate({ userId, roleKey: selected }, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign role</DialogTitle>
          <DialogDescription>Choose a role to assign to {userName}.</DialogDescription>
        </DialogHeader>

        {!confirm ? (
          <div className="space-y-2">
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">No additional roles available.</p>
            ) : (
              available.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelected(role.key)}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition",
                    selected === role.key
                      ? "border-primary bg-primary-soft"
                      : "border-hairline hover:bg-muted/40",
                  )}
                >
                  <p className="text-sm font-medium">{role.name}</p>
                  {role.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{role.description}</p>
                  )}
                  {role.isSystem && (
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      System role
                    </p>
                  )}
                </button>
              ))
            )}

            {preview && (
              <div className="mt-4 rounded-lg border border-hairline bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  This role provides
                </p>
                <div className="mt-2 space-y-2">
                  {preview.tree
                    .filter((mod) => moduleHasAccess(mod.key, preview.granted))
                    .map((mod) => (
                      <div key={mod.key}>
                        <p className="text-sm font-medium">{mod.label}</p>
                        <ul className="mt-1 space-y-0.5 pl-2 text-xs text-muted-foreground">
                          {mod.features.flatMap((f) =>
                            f.actions
                              .filter((a) => preview.granted.has(a.key))
                              .map((a) => <li key={a.key}>✓ {a.description}</li>),
                          )}
                        </ul>
                      </div>
                    ))}
                  {preview.granted.size === 0 && (
                    <p className="text-xs text-muted-foreground">No permissions</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p>
              You are granting <strong>{preview?.role?.name}</strong> to <strong>{userName}</strong>
              .
            </p>
            {preview && (
              <div className="rounded-lg border border-hairline p-3">
                <p className="text-xs text-muted-foreground">This provides:</p>
                <ul className="mt-2 space-y-1">
                  {preview.tree
                    .filter((mod) => moduleHasAccess(mod.key, preview.granted))
                    .map((mod) => (
                      <li key={mod.key}>✓ {mod.label}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!confirm ? (
            <Button disabled={!selected} onClick={() => setConfirm(true)}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleAssign} disabled={mutations.assignRole.isPending}>
              {mutations.assignRole.isPending ? "Assigning…" : "Confirm"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

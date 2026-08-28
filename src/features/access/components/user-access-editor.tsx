import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ModuleAccessRow } from "@/features/access/components/access-summary";
import {
  buildPermissionTree,
  moduleHasAccess,
} from "@/features/access/lib/permission-tree";
import { useAdminRoles, usePermissionCatalog, useUserMutations } from "@/hooks/use-rbac";
import { ApiRequestError } from "@/lib/api/errors";
import type { UserAccessView } from "@/lib/api/rbac-types";
import { cn } from "@/lib/utils";

type Props = {
  access: UserAccessView;
};

function accessErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 403) return "You don't have permission to make this change.";
    return error.message;
  }
  return "Couldn't save access changes. Try again.";
}

function primaryRoleKey(roles: string[]): string {
  return roles[0] ?? "";
}

export function UserAccessEditor({ access }: Props) {
  const roles = useAdminRoles();
  const catalog = usePermissionCatalog();
  const mutations = useUserMutations();

  const savedRoleKey = primaryRoleKey(access.roles);
  const [draftRoleKey, setDraftRoleKey] = useState(savedRoleKey);
  const [draftActive, setDraftActive] = useState(access.isActive);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    setDraftRoleKey(savedRoleKey);
    setDraftActive(access.isActive);
    setFormError(null);
  }, [access.id, savedRoleKey, access.isActive]);

  const isDirty = draftRoleKey !== savedRoleKey || draftActive !== access.isActive;

  const previewGranted = useMemo(() => {
    const role = roles.data?.find((r) => r.key === draftRoleKey);
    return new Set(role?.permissions ?? []);
  }, [draftRoleKey, roles.data]);

  const tree = useMemo(() => buildPermissionTree(catalog.data ?? []), [catalog.data]);

  const roleOptions = useMemo(
    () => (roles.data ?? []).filter((r) => r.key !== "owner"),
    [roles.data],
  );

  const handleCancel = () => {
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    resetDraft();
  };

  const resetDraft = () => {
    setDraftRoleKey(savedRoleKey);
    setDraftActive(access.isActive);
    setFormError(null);
  };

  const handleSave = () => {
    setFormError(null);
    const input: { roleKey?: string; isActive?: boolean } = {};
    if (draftRoleKey !== savedRoleKey) input.roleKey = draftRoleKey;
    if (draftActive !== access.isActive) input.isActive = draftActive;
    if (Object.keys(input).length === 0) return;

    mutations.updateAccess.mutate(
      { id: access.id, input },
      {
        onError: (err) => setFormError(accessErrorMessage(err)),
      },
    );
  };

  const changesSummary = useMemo(() => {
    const lines: string[] = [];
    if (draftRoleKey !== savedRoleKey) {
      const from = roles.data?.find((r) => r.key === savedRoleKey)?.name ?? savedRoleKey;
      const to = roles.data?.find((r) => r.key === draftRoleKey)?.name ?? draftRoleKey;
      lines.push(`Role: ${from} → ${to}`);
    }
    if (draftActive !== access.isActive) {
      lines.push(`Status: ${access.isActive ? "Active" : "Inactive"} → ${draftActive ? "Active" : "Inactive"}`);
    }
    return lines;
  }, [draftRoleKey, savedRoleKey, draftActive, access.isActive, roles.data]);

  return (
    <div className="space-y-6">
      <section className="surface-raised p-5">
        <p className="label-eyebrow">Role</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Access is determined by the assigned role. Permissions and modules below reflect the
          selected role.
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="access-role">Assigned role</Label>
          <Select value={draftRoleKey} onValueChange={setDraftRoleKey}>
            <SelectTrigger id="access-role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.key} value={role.key}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Module access</p>
        <p className="mt-1 text-xs text-muted-foreground">Inherited from role</p>
        <div className="mt-3 hairline-list">
          {tree.map((mod) => (
            <ModuleAccessRow
              key={mod.key}
              label={mod.label}
              granted={moduleHasAccess(mod.key, previewGranted)}
            />
          ))}
        </div>
      </section>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Permissions</p>
        <p className="mt-1 text-xs text-muted-foreground">Inherited from role — read only</p>
        <div className="mt-4 space-y-4">
          {tree.map((mod) => {
            const modPerms = mod.features.flatMap((f) => f.actions);
            const anyGranted = modPerms.some((a) => previewGranted.has(a.key));
            if (!anyGranted) return null;
            return (
              <div key={mod.key}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {mod.label}
                </p>
                <ul className="mt-2 space-y-2">
                  {mod.features.flatMap((feat) =>
                    feat.actions.map((action) => {
                      const granted = previewGranted.has(action.key);
                      return (
                        <li
                          key={action.key}
                          className={cn(
                            "flex items-start justify-between gap-3 rounded-md border border-hairline px-3 py-2",
                            granted ? "bg-primary-soft/20" : "opacity-60",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm">{action.description}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                              {action.key}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-xs font-medium",
                              granted ? "text-primary" : "text-muted-foreground",
                            )}
                          >
                            {granted ? "✓" : "—"}
                          </span>
                        </li>
                      );
                    }),
                  )}
                </ul>
              </div>
            );
          })}
          {previewGranted.size === 0 && (
            <p className="text-sm text-muted-foreground">No permissions from this role.</p>
          )}
        </div>
      </section>

      <section className="surface-raised border-destructive/20 p-5">
        <p className="label-eyebrow text-destructive">Account status</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{draftActive ? "Active" : "Inactive"}</p>
            <p className="text-xs text-muted-foreground">
              {draftActive ? "User can sign in." : "User cannot sign in."}
            </p>
          </div>
          <Switch
            checked={draftActive}
            onCheckedChange={setDraftActive}
            aria-label="Account active"
          />
        </div>
      </section>

      {isDirty && changesSummary.length > 0 && (
        <div className="rounded-lg border border-hairline bg-muted/20 p-4 text-sm">
          <p className="font-medium">Pending changes</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {changesSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={mutations.updateAccess.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isDirty || mutations.updateAccess.isPending}>
          {mutations.updateAccess.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved access changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved access changes. Discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetDraft();
                setConfirmDiscard(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ProtectedOwnerAccessPanel({
  access,
  isSelf = false,
}: {
  access: UserAccessView;
  isSelf?: boolean;
}) {
  const catalog = usePermissionCatalog();
  const granted = useMemo(() => new Set(access.permissions), [access.permissions]);
  const tree = useMemo(() => buildPermissionTree(catalog.data ?? []), [catalog.data]);
  const moduleCount = tree.filter((mod) => moduleHasAccess(mod.key, granted)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Read only</Badge>
        {isSelf && <Badge variant="outline">YOU</Badge>}
        <Badge variant="secondary">Protected account</Badge>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary-soft/10 p-4">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">
            {isSelf ? "Protected owner account" : "Owner access is protected"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isSelf
              ? "This account has full platform access and cannot be modified here."
              : "This owner's role and permissions cannot be changed from Access Control."}
          </p>
        </div>
      </div>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Access summary</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {moduleCount} modules · {access.permissions.length} permissions
        </p>
      </section>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Module access</p>
        <div className="mt-3 hairline-list">
          {tree.map((mod) => (
            <ModuleAccessRow
              key={mod.key}
              label={mod.label}
              granted={moduleHasAccess(mod.key, granted)}
            />
          ))}
        </div>
      </section>

      <section className="surface-raised p-5">
        <p className="label-eyebrow">Permissions</p>
        <div className="mt-4 space-y-4">
          {tree
            .filter((mod) => moduleHasAccess(mod.key, granted))
            .map((mod) => (
              <div key={mod.key}>
                <p className="text-sm font-medium">{mod.label}</p>
                <ul className="mt-2 space-y-1 pl-1">
                  {mod.features.flatMap((feat) =>
                    feat.actions
                      .filter((action) => granted.has(action.key))
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
        </div>
      </section>
    </div>
  );
}

export function UserAccessBadges({
  access,
  showYou,
}: {
  access: Pick<UserAccessView, "roles" | "isActive" | "isProtectedOwner">;
  showYou?: boolean;
}) {
  const roles = useAdminRoles();
  const primary = primaryRoleKey(access.roles);
  const roleName = roles.data?.find((r) => r.key === primary)?.name ?? primary.replace(/_/g, " ");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={access.isActive ? "default" : "secondary"}>
        {access.isActive ? "Active" : "Inactive"}
      </Badge>
      {access.isProtectedOwner && <Badge>Owner</Badge>}
      {showYou && <Badge variant="outline">YOU</Badge>}
      {roleName && !access.isProtectedOwner && (
        <Badge variant="outline" className="font-normal">
          {roleName}
        </Badge>
      )}
    </div>
  );
}

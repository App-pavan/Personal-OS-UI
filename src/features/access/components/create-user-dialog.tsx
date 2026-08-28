import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { buildPermissionTree, moduleHasAccess } from "@/features/access/lib/permission-tree";
import { useAdminRoles, usePermissionCatalog, useUserMutations } from "@/hooks/use-rbac";
import { ApiRequestError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function createUserErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 403) return "You don't have permission to create users.";
    if (error.status === 409) return "An account with this email already exists.";
    if (error.kind === "validation") {
      return error.message.includes("password")
        ? "Password does not meet the required security policy."
        : error.message;
    }
    return error.message;
  }
  return "Unable to create user.";
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function CreateUserDialog({ open, onOpenChange }: Props) {
  const roles = useAdminRoles();
  const catalog = usePermissionCatalog();
  const mutations = useUserMutations();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [roleKey, setRoleKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const preview = useMemo(() => {
    if (!roleKey) return null;
    const role = roles.data?.find((r) => r.key === roleKey);
    const granted = new Set(role?.permissions ?? []);
    const tree = buildPermissionTree(catalog.data ?? []);
    const modules = tree.filter((mod) => moduleHasAccess(mod.key, granted));
    return { role, modules, permissionCount: granted.size };
  }, [roleKey, roles.data, catalog.data]);

  const clearSecrets = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const reset = () => {
    setDisplayName("");
    setEmail("");
    setRoleKey("");
    clearSecrets();
    setIsActive(true);
    setFormError(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const canSubmit =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    roleKey.length > 0 &&
    passwordLongEnough &&
    passwordsMatch &&
    !mutations.create.isPending;

  const handleCreate = () => {
    setFormError(null);
    if (!passwordsMatch) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!passwordLongEnough) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    mutations.create.mutate(
      {
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        roleKey,
        isActive,
      },
      {
        onSuccess: (res) => {
          clearSecrets();
          handleClose();
          void navigate({
            to: "/settings/access/users/$id",
            params: { id: res.data.id },
          });
        },
        onError: (err) => setFormError(createUserErrorMessage(err)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : handleClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Create a Personal OS account and assign its initial access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Identity
            </p>
            <div className="space-y-2">
              <Label htmlFor="user-name">Full name</Label>
              <Input
                id="user-name"
                placeholder="Mummy"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email address</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="mummy@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Access
            </p>
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select value={roleKey} onValueChange={setRoleKey}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles.data ?? []).map((role) => (
                    <SelectItem key={role.key} value={role.key}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {preview && (
              <div className="rounded-lg border border-hairline bg-muted/20 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Access
                </p>
                {preview.modules.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">No module access</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {preview.modules.map((mod) => (
                      <li key={mod.key} className="text-sm">
                        {mod.label}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ·{" "}
                          {mod.features.reduce(
                            (n, f) =>
                              n +
                              f.actions.filter((a) => preview.role?.permissions?.includes(a.key))
                                .length,
                            0,
                          )}{" "}
                          permissions
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Password
            </p>
            <PasswordField
              id="user-password"
              label="Initial password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
            />
            <PasswordField
              id="user-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
            />

            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Password requirements</p>
              <p className={cn("flex items-center gap-1.5", passwordLongEnough && "text-primary")}>
                <Check className="size-3" />
                At least {MIN_PASSWORD_LENGTH} characters
              </p>
            </div>

            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
          </section>

          <section className="flex items-center justify-between rounded-lg border border-hairline px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">User can sign in when active.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Account active" />
          </section>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canSubmit}>
            {mutations.create.isPending ? "Creating…" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Check, Minus, Users, Shield, Layers, KeyRound } from "lucide-react";
import { StatCard } from "@/components/os/primitives";
import { buildPermissionTree } from "@/features/access/lib/permission-tree";
import { useAdminRoles, useAdminUsers, usePermissionCatalog } from "@/hooks/use-rbac";

export function AccessSummary() {
  const users = useAdminUsers();
  const roles = useAdminRoles();
  const permissions = usePermissionCatalog();

  const userCount = users.data?.length ?? 0;
  const roleCount = roles.data?.length ?? 0;
  const permCount = permissions.data?.length ?? 0;
  const moduleCount = permissions.data ? buildPermissionTree(permissions.data).length : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Users" value={String(userCount)} icon={Users} delay={0} />
      <StatCard label="Roles" value={String(roleCount)} icon={Shield} tone="accent" delay={40} />
      <StatCard label="Modules" value={String(moduleCount)} icon={Layers} tone="info" delay={80} />
      <StatCard
        label="Permissions"
        value={String(permCount)}
        icon={KeyRound}
        tone="success"
        delay={120}
      />
    </div>
  );
}

export function ModuleAccessRow({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm">{label}</span>
      <span
        className={
          granted
            ? "inline-flex items-center gap-1 text-xs font-medium text-success"
            : "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"
        }
      >
        {granted ? <Check className="size-3.5" /> : <Minus className="size-3.5" />}
        {granted ? "Access" : "No access"}
      </span>
    </div>
  );
}

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import {
  ProtectedOwnerAccessPanel,
  UserAccessBadges,
  UserAccessEditor,
} from "@/features/access/components/user-access-editor";
import { summarizeFromAccess } from "@/features/access/lib/user-access-summary";
import { useAuth } from "@/features/auth/auth-context";
import { useCapabilities, useAccessControlPermissions } from "@/features/capabilities/capabilities-context";
import { useAdminUserAccess } from "@/hooks/use-rbac";

type Props = { userId: string };

export function UserDetail({ userId }: Props) {
  const access = useAdminUserAccess(userId);
  const { user: sessionUser } = useAuth();
  const { caps } = useCapabilities();
  const { canManageUsers } = useAccessControlPermissions();

  const currentUserId = caps?.user.id || sessionUser?.id || "";
  const isSelf = access.data?.isSelf ?? userId === currentUserId;
  const isProtected = access.data?.isProtectedOwner ?? false;
  const canEdit = canManageUsers && !isSelf && !isProtected;

  const summary = useMemo(
    () => (access.data ? summarizeFromAccess(access.data) : null),
    [access.data],
  );

  if (access.isError) {
    return (
      <ErrorState
        error={access.error}
        title="Unable to load access settings"
        onRetry={() => access.refetch()}
      />
    );
  }
  if (access.isLoading) return <RowsSkeleton rows={8} />;

  const a = access.data!;

  return (
    <div className="space-y-6">
      <Link
        to="/settings/access/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All users
      </Link>

      <header>
        <p className="label-eyebrow">
          {isSelf ? "My access" : canEdit ? "Manage access" : "View access"}
        </p>
        <h2 className="display-lg mt-2">{a.displayName || a.email}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{a.email}</p>
        <div className="mt-3">
          <UserAccessBadges access={a} showYou={isSelf} />
        </div>
        {summary && (
          <p className="mt-2 text-sm text-muted-foreground">
            {summary.moduleLabel}
            {summary.protected
              ? " · Protected"
              : summary.permissionCount > 0
                ? ` · ${summary.permissionCount} permissions`
                : ""}
          </p>
        )}
      </header>

      {isSelf && isProtected ? (
        <ProtectedOwnerAccessPanel access={a} isSelf />
      ) : canEdit ? (
        <UserAccessEditor access={a} />
      ) : (
        <ProtectedOwnerAccessPanel access={a} isSelf={isSelf} />
      )}
    </div>
  );
}

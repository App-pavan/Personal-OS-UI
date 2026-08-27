import { createFileRoute } from "@tanstack/react-router";
import { PermissionsCatalog } from "@/features/access/components/permissions-catalog";

export const Route = createFileRoute("/settings/access/permissions")({
  component: PermissionsPage,
});

function PermissionsPage() {
  return <PermissionsCatalog />;
}

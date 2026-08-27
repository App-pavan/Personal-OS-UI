import { createFileRoute } from "@tanstack/react-router";
import { RolesList } from "@/features/access/components/roles-list";

export const Route = createFileRoute("/settings/access/roles")({
  component: RolesPage,
});

function RolesPage() {
  return <RolesList />;
}

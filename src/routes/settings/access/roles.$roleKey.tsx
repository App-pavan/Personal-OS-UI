import { createFileRoute } from "@tanstack/react-router";
import { RoleDetail } from "@/features/access/components/role-detail";

export const Route = createFileRoute("/settings/access/roles/$roleKey")({
  component: RoleDetailPage,
});

function RoleDetailPage() {
  const { roleKey } = Route.useParams();
  return <RoleDetail roleKey={roleKey} />;
}

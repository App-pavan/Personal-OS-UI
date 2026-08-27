import { createFileRoute } from "@tanstack/react-router";
import { UserDetail } from "@/features/access/components/user-detail";

export const Route = createFileRoute("/settings/access/users/$id")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = Route.useParams();
  return <UserDetail userId={id} />;
}

import { createFileRoute } from "@tanstack/react-router";
import { UsersList } from "@/features/access/components/users-list";

export const Route = createFileRoute("/settings/access/users")({
  component: UsersPage,
});

function UsersPage() {
  return <UsersList />;
}

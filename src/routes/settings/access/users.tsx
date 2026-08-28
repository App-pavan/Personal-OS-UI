import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/access/users")({
  component: UsersLayout,
});

function UsersLayout() {
  return <Outlet />;
}

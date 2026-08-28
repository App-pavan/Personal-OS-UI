import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/access/roles")({
  component: RolesLayout,
});

function RolesLayout() {
  return <Outlet />;
}

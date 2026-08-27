import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AccessGuard } from "@/features/access/components/access-guard";
import { AccessNav } from "@/features/access/components/access-nav";
import { ModuleHeader } from "@/components/os/primitives";

export const Route = createFileRoute("/settings/access")({
  head: () => ({
    meta: [
      { title: "Access Control — Personal OS" },
      {
        name: "description",
        content: "Manage users, roles, and permissions across Personal OS.",
      },
    ],
  }),
  component: AccessLayout,
});

function AccessLayout() {
  return (
    <AccessGuard>
      <div className="space-y-6">
        <ModuleHeader
          eyebrow="Settings"
          title="Access Control"
          description="Manage users, roles, and what each person can access across Personal OS."
        />
        <AccessNav />
        <Outlet />
      </div>
    </AccessGuard>
  );
}

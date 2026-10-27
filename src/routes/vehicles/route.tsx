import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { PERM } from "@/lib/permissions";

export const Route = createFileRoute("/vehicles")({
  beforeLoad: requirePermissions(PERM.VEHICLES_VIEW),
  component: VehiclesLayout,
});

function VehiclesLayout() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">
      <Outlet />
    </div>
  );
}

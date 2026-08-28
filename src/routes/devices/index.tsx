import { createFileRoute } from "@tanstack/react-router";
import { requirePermissions } from "@/features/capabilities/route-guard";
import { DeviceFamilyDashboard } from "@/features/device-awareness/components/device-family-dashboard";
import { PERM } from "@/lib/permissions";

export const Route = createFileRoute("/devices/")({
  beforeLoad: requirePermissions(PERM.DEVICE_AWARENESS_DEVICES_VIEW),
  head: () => ({
    meta: [
      { title: "Family Device Awareness — Personal OS" },
      {
        name: "description",
        content: "See the current availability of your family devices.",
      },
    ],
  }),
  component: DeviceAwarenessPage,
});

function DeviceAwarenessPage() {
  return <DeviceFamilyDashboard />;
}

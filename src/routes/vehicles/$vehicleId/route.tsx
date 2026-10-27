import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { VehicleNav } from "@/features/vehicles/components/vehicle-nav";
import { useVehicle } from "@/hooks/use-vehicles";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  component: VehicleDetailLayout,
});

function VehicleDetailLayout() {
  const { vehicleId } = Route.useParams();
  const vehicle = useVehicle(vehicleId);

  if (vehicle.isLoading) return <RowsSkeleton rows={3} />;
  if (vehicle.isError || !vehicle.data) {
    return <ErrorState error={vehicle.error} onRetry={() => vehicle.refetch()} title="Vehicle unavailable" />;
  }

  const v = vehicle.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/vehicles" className="mb-2 inline-flex items-center gap-1 text-xs text-primary hover:text-accent">
            <ArrowLeft className="size-3" /> All vehicles
          </Link>
          <h1 className="display-lg">{v.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {v.make} {v.model} · {v.vehicleType}
          </p>
        </div>
      </div>
      <VehicleNav />
      <Outlet />
    </div>
  );
}

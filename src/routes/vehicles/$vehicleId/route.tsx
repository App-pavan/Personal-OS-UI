import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { Can } from "@/features/capabilities/can";
import { VehicleFormSheet } from "@/features/vehicles/components/vehicle-form-sheet";
import { VehicleNav } from "@/features/vehicles/components/vehicle-nav";
import { GlassButton } from "@/features/expenses/components/glass";
import { useVehicle, useVehicleMutations } from "@/hooks/use-vehicles";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { PERM } from "@/lib/permissions";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  component: VehicleDetailLayout,
});

function VehicleDetailLayout() {
  const { vehicleId } = Route.useParams();
  const vehicle = useVehicle(vehicleId);
  const m = useVehicleMutations();
  const [editOpen, setEditOpen] = useState(false);

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
        <Can permission={PERM.VEHICLES_MANAGE}>
          <GlassButton onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit vehicle
          </GlassButton>
        </Can>
      </div>
      <VehicleNav />
      <Outlet />

      <VehicleFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initial={v}
        pending={m.update.isPending}
        onSubmit={(input) =>
          m.update.mutate({ id: v.id, input }, { onSuccess: () => setEditOpen(false) })
        }
      />
    </div>
  );
}

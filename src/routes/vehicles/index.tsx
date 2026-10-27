import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Plus } from "lucide-react";
import { SectionHeader } from "@/components/future";
import { Can } from "@/features/capabilities/can";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { MaintenanceBadge } from "@/features/vehicles/components/maintenance-badge";
import { VehicleFormSheet } from "@/features/vehicles/components/vehicle-form-sheet";
import { GlassButton } from "@/features/expenses/components/glass";
import { useVehicleMutations, useVehicles } from "@/hooks/use-vehicles";
import { PERM } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vehicles/")({
  head: () => ({ meta: [{ title: "Vehicles — Personal OS" }] }),
  component: VehiclesListPage,
});

function VehiclesListPage() {
  const list = useVehicles();
  const m = useVehicleMutations();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <SectionHeader
        system="Vehicle system"
        module="Fleet overview"
        title="Vehicles"
        subtitle="Track service, fuel, documents, and ownership costs."
        actions={
          <Can permission={PERM.VEHICLES_MANAGE}>
            <GlassButton onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Add vehicle
            </GlassButton>
          </Can>
        }
      />

      {list.isLoading ? (
        <RowsSkeleton rows={4} />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} title="Could not load vehicles" />
      ) : !list.data?.length ? (
        <EmptyState
          title="No vehicles yet"
          line="Add your first vehicle to start tracking service and fuel."
          icon={<Car className="size-5" />}
          action={
            <Can permission={PERM.VEHICLES_MANAGE}>
              <GlassButton onClick={() => setFormOpen(true)}>Add vehicle</GlassButton>
            </Can>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.data.map((item) => (
            <Link
              key={item.vehicle.id}
              to="/vehicles/$vehicleId"
              params={{ vehicleId: item.vehicle.id }}
              className={cn(
                "hud-panel angular-clip block p-4 transition hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              )}
            >
              <div className="flex gap-3">
                <div className="grid size-14 shrink-0 place-items-center angular-clip-sm border border-hairline/60 bg-surface/40">
                  <Car className="size-6 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.vehicle.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.vehicle.vehicleType} · {item.vehicle.make} {item.vehicle.model}
                  </p>
                  {item.vehicle.registrationNumber ? (
                    <p className="mt-1 font-mono text-xs tabular-nums">{item.vehicle.registrationNumber}</p>
                  ) : null}
                  <p className="mt-2 font-mono text-sm tabular-nums">
                    {item.vehicle.currentOdometerKm.toLocaleString()} km
                  </p>
                  <div className="mt-2">
                    <MaintenanceBadge status={item.maintenanceStatus} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <VehicleFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        pending={m.create.isPending}
        onSubmit={(input) =>
          m.create.mutate(input, { onSuccess: () => setFormOpen(false) })
        }
      />
    </>
  );
}

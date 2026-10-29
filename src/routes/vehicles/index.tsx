import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Plus } from "lucide-react";
import { SectionHeader } from "@/components/future";
import { Can } from "@/features/capabilities/can";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { VehicleFormSheet } from "@/features/vehicles/components/vehicle-form-sheet";
import { VehicleListCard } from "@/features/vehicles/components/vehicle-list-card";
import { GlassButton } from "@/features/expenses/components/glass";
import { useVehicleMutations, useVehicles } from "@/hooks/use-vehicles";
import { PERM } from "@/lib/permissions";
import type { Vehicle } from "@/lib/api/vehicle-types";

export const Route = createFileRoute("/vehicles/")({
  head: () => ({ meta: [{ title: "Vehicles — Personal OS" }] }),
  component: VehiclesListPage,
});

function VehiclesListPage() {
  const list = useVehicles();
  const m = useVehicleMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setFormOpen(true);
  };

  const closeForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditing(null);
  };

  return (
    <>
      <SectionHeader
        system="Vehicle system"
        module="Fleet overview"
        title="Vehicles"
        subtitle="Track service, fuel, documents, and ownership costs."
        actions={
          <Can permission={PERM.VEHICLES_MANAGE}>
            <GlassButton onClick={openCreate}>
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
              <GlassButton onClick={openCreate}>Add vehicle</GlassButton>
            </Can>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.data.map((item) => (
            <VehicleListCard key={item.vehicle.id} item={item} onEdit={openEdit} />
          ))}
        </div>
      )}

      <VehicleFormSheet
        open={formOpen}
        onOpenChange={closeForm}
        mode={editing ? "edit" : "create"}
        initial={editing}
        pending={m.create.isPending || m.update.isPending}
        onSubmit={(input) => {
          if (editing) {
            m.update.mutate(
              { id: editing.id, input },
              { onSuccess: () => closeForm(false) },
            );
          } else {
            m.create.mutate(input, { onSuccess: () => closeForm(false) });
          }
        }}
      />
    </>
  );
}

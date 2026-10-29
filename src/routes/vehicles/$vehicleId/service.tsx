import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Can } from "@/features/capabilities/can";
import { DataPanel } from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useVehicleRecordMutations, useVehicleServices } from "@/hooks/use-vehicles";
import { PERM } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";
import type { ServiceType } from "@/lib/api/vehicle-types";

export const Route = createFileRoute("/vehicles/$vehicleId/service")({
  component: VehicleServicePage,
});

function VehicleServicePage() {
  const { vehicleId } = Route.useParams();
  const services = useVehicleServices(vehicleId);
  const m = useVehicleRecordMutations(vehicleId);
  const [open, setOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [odometerKm, setOdometerKm] = useState("");
  const [serviceCenter, setServiceCenter] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("periodic");
  const [amountMinor, setAmountMinor] = useState("");
  const [syncExpense, setSyncExpense] = useState(false);

  if (services.isLoading) return <RowsSkeleton rows={4} />;
  if (services.isError) {
    return <ErrorState error={services.error} onRetry={() => services.refetch()} />;
  }

  const submit = () => {
    const km = Number(odometerKm);
    const amt = Number(amountMinor);
    if (!serviceCenter.trim() || !Number.isFinite(km) || !Number.isFinite(amt)) return;
    m.createService.mutate(
      {
        serviceDate: new Date(serviceDate).toISOString(),
        odometerKm: Math.trunc(km),
        serviceCenter: serviceCenter.trim(),
        serviceType,
        amountMinor: Math.trunc(amt * 100),
        currency: "INR",
        syncExpense,
        allowOdometerCorrection: true,
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <>
      <DataPanel
        title="Service history"
        accent="aqua"
        action={
          <Can permission={PERM.VEHICLES_MANAGE}>
            <GlassButton onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Add service
            </GlassButton>
          </Can>
        }
      >
        {!services.data?.length ? (
          <EmptyState title="No service records" line="Log your first service visit." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Odometer</th>
                  <th>Center</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {services.data.map((r) => (
                  <tr key={r.id} className="border-t border-hairline/40">
                    <td className="py-2">{new Date(r.serviceDate).toLocaleDateString()}</td>
                    <td className="font-mono tabular-nums">{r.odometerKm.toLocaleString()} km</td>
                    <td>{r.serviceCenter}</td>
                    <td className="capitalize">{r.serviceType}</td>
                    <td className="font-mono tabular-nums">{formatMoney(r.amountMinor, r.currency)}</td>
                    <td className="text-right">
                      <Can permission={PERM.VEHICLES_MANAGE}>
                        <button
                          type="button"
                          aria-label="Delete service record"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (window.confirm("Delete this service record?")) {
                              m.deleteService.mutate(r.id);
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Add service</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Service date *</span>
              <GlassInput type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Odometer (km) *</span>
              <GlassInput value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Service center *</span>
              <GlassInput value={serviceCenter} onChange={(e) => setServiceCenter(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Type *</span>
              <select
                className="h-10 w-full rounded-md border border-hairline bg-transparent px-2 text-sm"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
              >
                {(["periodic", "repair", "inspection", "tyre", "other"] as const).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Amount (₹) *</span>
              <GlassInput value={amountMinor} onChange={(e) => setAmountMinor(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2 text-xs">
              <input type="checkbox" checked={syncExpense} onChange={(e) => setSyncExpense(e.target.checked)} />
              Sync to Expenses module (no duplicate if already linked)
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <GlassButton onClick={submit} disabled={m.createService.isPending}>
              Save
            </GlassButton>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

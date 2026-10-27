import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Can } from "@/features/capabilities/can";
import { DataPanel, MetricPanel } from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useVehicleFuel, useVehicleOverview, useVehicleRecordMutations } from "@/hooks/use-vehicles";
import { PERM } from "@/lib/permissions";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/vehicles/$vehicleId/fuel")({
  component: VehicleFuelPage,
});

function VehicleFuelPage() {
  const { vehicleId } = Route.useParams();
  const fuel = useVehicleFuel(vehicleId);
  const overview = useVehicleOverview(vehicleId);
  const m = useVehicleRecordMutations(vehicleId);
  const [open, setOpen] = useState(false);
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [odometerKm, setOdometerKm] = useState("");
  const [liters, setLiters] = useState("");
  const [amount, setAmount] = useState("");
  const [fullTank, setFullTank] = useState(true);
  const [syncExpense, setSyncExpense] = useState(false);

  const pricePerLiter = useMemo(() => {
    const l = Number(liters);
    const a = Number(amount);
    if (!Number.isFinite(l) || l <= 0 || !Number.isFinite(a)) return null;
    return a / l;
  }, [liters, amount]);

  if (fuel.isLoading) return <RowsSkeleton rows={4} />;
  if (fuel.isError) {
    return <ErrorState error={fuel.error} onRetry={() => fuel.refetch()} />;
  }

  const submit = () => {
    const km = Number(odometerKm);
    const l = Number(liters);
    const a = Number(amount);
    if (!Number.isFinite(km) || !Number.isFinite(l) || !Number.isFinite(a)) return;
    m.createFuel.mutate(
      {
        occurredAt: new Date(occurredAt).toISOString(),
        odometerKm: Math.trunc(km),
        liters: l,
        amountMinor: Math.trunc(a * 100),
        currency: "INR",
        fullTank,
        syncExpense,
      },
      { onSuccess: () => setOpen(false) },
    );
  };

  const economy = overview.data?.fuelEconomyKmPerL;

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricPanel accent="orange">
          <p className="label-eyebrow">Fuel economy</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">
            {economy != null ? `${economy.toFixed(1)} km/L` : "—"}
          </p>
        </MetricPanel>
        <MetricPanel accent="aqua">
          <p className="label-eyebrow">Fill-ups logged</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">{fuel.data?.length ?? 0}</p>
        </MetricPanel>
      </div>

      <DataPanel
        title="Fuel history"
        accent="orange"
        action={
          <Can permission={PERM.VEHICLES_MANAGE}>
            <GlassButton onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Add fuel reading
            </GlassButton>
          </Can>
        }
      >
        {!fuel.data?.length ? (
          <EmptyState title="No fuel records" line="Log fill-ups to track economy." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2">When</th>
                  <th>Odometer</th>
                  <th>Liters</th>
                  <th>Amount</th>
                  <th>₹/L</th>
                  <th>Full tank</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {fuel.data.map((r) => (
                  <tr key={r.id} className="border-t border-hairline/40">
                    <td className="py-2">{new Date(r.occurredAt).toLocaleString()}</td>
                    <td className="font-mono tabular-nums">{r.odometerKm.toLocaleString()} km</td>
                    <td className="font-mono tabular-nums">{r.liters.toFixed(2)} L</td>
                    <td className="font-mono tabular-nums">{formatMoney(r.amountMinor, r.currency)}</td>
                    <td className="font-mono tabular-nums">
                      {r.liters > 0 ? (r.amountMinor / 100 / r.liters).toFixed(2) : "—"}
                    </td>
                    <td>{r.fullTank ? "Yes" : "No"}</td>
                    <td className="text-right">
                      <Can permission={PERM.VEHICLES_MANAGE}>
                        <button
                          type="button"
                          aria-label="Delete fuel record"
                          onClick={() => {
                            if (window.confirm("Delete this fuel record?")) m.deleteFuel.mutate(r.id);
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
            <SheetTitle>Add fuel reading</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Date & time *</span>
              <GlassInput type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Odometer (km) *</span>
              <GlassInput value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Liters *</span>
              <GlassInput value={liters} onChange={(e) => setLiters(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Total paid (₹) *</span>
              <GlassInput value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">Price per liter</span>
              <GlassInput readOnly value={pricePerLiter != null ? pricePerLiter.toFixed(2) : "—"} />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={fullTank} onChange={(e) => setFullTank(e.target.checked)} />
              Full tank *
            </label>
            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input type="checkbox" checked={syncExpense} onChange={(e) => setSyncExpense(e.target.checked)} />
              Sync to Expenses module
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <GlassButton onClick={submit} disabled={m.createFuel.isPending}>
              Save
            </GlassButton>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

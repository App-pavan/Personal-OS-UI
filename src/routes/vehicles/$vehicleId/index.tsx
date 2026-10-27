import { createFileRoute, Link } from "@tanstack/react-router";
import { MetricPanel, DataPanel } from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { MaintenanceBadge } from "@/features/vehicles/components/maintenance-badge";
import { useVehicleOverview } from "@/hooks/use-vehicles";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/vehicles/$vehicleId/")({
  component: VehicleOverviewPage,
});

function VehicleOverviewPage() {
  const { vehicleId } = Route.useParams();
  const overview = useVehicleOverview(vehicleId);

  if (overview.isLoading) return <RowsSkeleton rows={4} />;
  if (overview.isError || !overview.data) {
    return <ErrorState error={overview.error} onRetry={() => overview.refetch()} />;
  }

  const o = overview.data;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
        <MetricPanel accent="primary">
          <p className="label-eyebrow">Odometer</p>
          <p className="mt-2 font-mono text-3xl tabular-nums">{o.currentOdometerKm.toLocaleString()} km</p>
        </MetricPanel>
        <MetricPanel accent="aqua">
          <p className="label-eyebrow">Fuel economy</p>
          <p className="mt-2 font-mono text-3xl tabular-nums">
            {o.fuelEconomyKmPerL != null ? `${o.fuelEconomyKmPerL.toFixed(1)} km/L` : "—"}
          </p>
          {o.fuelEconomyKmPerL == null ? (
            <p className="mt-1 text-xs text-muted-foreground">Needs consecutive full-tank readings</p>
          ) : null}
        </MetricPanel>
        <MetricPanel accent="secondary">
          <p className="label-eyebrow">This month</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">
            {formatMoney(o.expenses.monthMinor, o.expenses.currency)}
          </p>
        </MetricPanel>
        <MetricPanel accent="purple">
          <p className="label-eyebrow">Total ownership cost</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">
            {formatMoney(o.expenses.totalMinor, o.expenses.currency)}
          </p>
        </MetricPanel>
      </div>

      <div className="space-y-4 lg:col-span-4">
        <DataPanel title="Service status" accent="info">
          <MaintenanceBadge status={o.maintenanceStatus} />
          {o.lastService ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Last service {new Date(o.lastService.serviceDate).toLocaleDateString()} at{" "}
              {o.lastService.odometerKm.toLocaleString()} km
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No service records yet.</p>
          )}
          {o.nextServiceDate ? (
            <p className="mt-1 text-xs">Next due {new Date(o.nextServiceDate).toLocaleDateString()}</p>
          ) : null}
          {o.nextServiceOdometerKm ? (
            <p className="text-xs">Or at {o.nextServiceOdometerKm.toLocaleString()} km</p>
          ) : null}
          <Link to="/vehicles/$vehicleId/service" params={{ vehicleId }} className="mt-3 inline-block text-xs text-primary">
            Open service tab →
          </Link>
        </DataPanel>

        <DataPanel title="Document reminders" accent="warning">
          {!o.documentReminders.length ? (
            <p className="text-sm text-muted-foreground">No upcoming expiries.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {o.documentReminders.map((d) => (
                <li key={d.documentId}>
                  {d.name} · {new Date(d.expiryDate).toLocaleDateString()} ·{" "}
                  <span className={d.status === "expired" ? "text-destructive" : "text-warning"}>{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </DataPanel>
      </div>

      <div className="lg:col-span-12">
        <DataPanel title="Recent activity" accent="aqua">
          {!o.recentActivity.length ? (
            <EmptyState title="No activity yet" line="Service and fuel entries will appear here." />
          ) : (
            <ul className="divide-y divide-hairline/40">
              {o.recentActivity.map((a, i) => (
                <li key={`${a.kind}-${i}`} className="flex justify-between gap-3 py-3 text-sm">
                  <span>
                    {a.title} · {new Date(a.timestamp).toLocaleString()}
                  </span>
                  {a.amountMinor != null ? (
                    <span className="font-mono tabular-nums">{formatMoney(a.amountMinor, a.currency ?? "INR")}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </DataPanel>
      </div>
    </div>
  );
}

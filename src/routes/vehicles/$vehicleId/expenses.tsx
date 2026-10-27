import { createFileRoute } from "@tanstack/react-router";
import { DataPanel, MetricPanel } from "@/components/future";
import { ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { CategoryBreakdown } from "@/features/expenses/components/category-breakdown";
import { useVehicleOverview } from "@/hooks/use-vehicles";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/vehicles/$vehicleId/expenses")({
  component: VehicleExpensesPage,
});

function VehicleExpensesPage() {
  const { vehicleId } = Route.useParams();
  const overview = useVehicleOverview(vehicleId);

  if (overview.isLoading) return <RowsSkeleton rows={3} />;
  if (overview.isError || !overview.data) {
    return <ErrorState error={overview.error} onRetry={() => overview.refetch()} />;
  }

  const e = overview.data.expenses;
  const breakdown = [
    { id: "fuel", name: "Fuel", amountMinor: e.fuelMinor, percentage: e.totalMinor ? (e.fuelMinor / e.totalMinor) * 100 : 0 },
    { id: "service", name: "Service & repairs", amountMinor: e.serviceMinor, percentage: e.totalMinor ? (e.serviceMinor / e.totalMinor) * 100 : 0 },
  ].filter((b) => b.amountMinor > 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricPanel accent="purple">
          <p className="label-eyebrow">This month</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">{formatMoney(e.monthMinor, e.currency)}</p>
        </MetricPanel>
        <MetricPanel accent="secondary">
          <p className="label-eyebrow">This year</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">{formatMoney(e.yearMinor, e.currency)}</p>
        </MetricPanel>
        <MetricPanel accent="primary">
          <p className="label-eyebrow">All-time (logged)</p>
          <p className="mt-2 font-mono text-2xl tabular-nums">{formatMoney(e.totalMinor, e.currency)}</p>
        </MetricPanel>
      </div>

      <DataPanel title="Category breakdown" accent="aqua">
        {breakdown.length ? (
          <CategoryBreakdown items={breakdown} total={e.totalMinor} currency={e.currency} />
        ) : (
          <p className="text-sm text-muted-foreground">No vehicle costs recorded yet.</p>
        )}
      </DataPanel>

      <p className="text-xs text-muted-foreground">
        Totals aggregate fuel and service records on this vehicle. Optional expense sync uses idempotent references
        (`vehicle:service:*`, `vehicle:fuel:*`) to avoid duplicate transactions in Expenses.
      </p>
    </div>
  );
}

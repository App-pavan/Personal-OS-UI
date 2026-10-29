import { Link } from "@tanstack/react-router";
import { Car, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Can } from "@/features/capabilities/can";
import { MaintenanceBadge } from "@/features/vehicles/components/maintenance-badge";
import { PERM } from "@/lib/permissions";
import type { VehicleListItem } from "@/lib/api/vehicle-types";
import { cn } from "@/lib/utils";

export function VehicleListCard({
  item,
  onEdit,
}: {
  item: VehicleListItem;
  onEdit: (vehicle: VehicleListItem["vehicle"]) => void;
}) {
  const { vehicle } = item;

  return (
    <div className={cn("hud-panel angular-clip relative transition hover:border-primary/30")}>
      <Can permission={PERM.VEHICLES_MANAGE}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${vehicle.name}`}
              className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted/70"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl border-hairline">
            <DropdownMenuItem onSelect={() => onEdit(vehicle)}>
              <Pencil className="size-3.5" /> Edit vehicle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Can>

      <Link
        to="/vehicles/$vehicleId"
        params={{ vehicleId: vehicle.id }}
        className="block p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="flex gap-3">
          <div className="grid size-14 shrink-0 place-items-center angular-clip-sm border border-hairline/60 bg-surface/40">
            <Car className="size-6 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="truncate font-medium">{vehicle.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {vehicle.vehicleType} · {vehicle.make} {vehicle.model}
            </p>
            {vehicle.registrationNumber ? (
              <p className="mt-1 font-mono text-xs tabular-nums">{vehicle.registrationNumber}</p>
            ) : null}
            <p className="mt-2 font-mono text-sm tabular-nums">
              {vehicle.currentOdometerKm.toLocaleString()} km
            </p>
            <div className="mt-2">
              <MaintenanceBadge status={item.maintenanceStatus} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

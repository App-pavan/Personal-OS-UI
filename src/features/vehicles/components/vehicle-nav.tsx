import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { FileText, Fuel, LayoutGrid, Receipt, Wrench } from "lucide-react";
import { vehicleTabAccent, navAccentStyle, semanticTextClasses } from "@/lib/design/semantic";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/vehicles/$vehicleId/" as const, label: "Overview", icon: LayoutGrid, key: "overview", exact: true },
  { to: "/vehicles/$vehicleId/service" as const, label: "Service", icon: Wrench, key: "service" },
  { to: "/vehicles/$vehicleId/fuel" as const, label: "Fuel", icon: Fuel, key: "fuel" },
  { to: "/vehicles/$vehicleId/expenses" as const, label: "Expenses", icon: Receipt, key: "expenses" },
  { to: "/vehicles/$vehicleId/documents" as const, label: "Documents", icon: FileText, key: "documents" },
] as const;

export function VehicleNav() {
  const { vehicleId } = useParams({ strict: false }) as { vehicleId?: string };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!vehicleId) return null;

  return (
    <nav className="hud-panel angular-clip p-1.5">
      <div className="relative z-[1] flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === `/vehicles/${vehicleId}` || pathname === `/vehicles/${vehicleId}/`
            : pathname.startsWith(`/vehicles/${vehicleId}${tab.to.split("$vehicleId")[1]}`);
          const accent = vehicleTabAccent[tab.key] ?? "primary";
          return (
            <Link
              key={tab.key}
              to={tab.to}
              params={{ vehicleId }}
              className={cn(
                "flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 angular-clip-sm",
                active
                  ? cn("font-medium nav-active-glow", semanticTextClasses(accent))
                  : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
              )}
              style={active ? navAccentStyle(accent) : undefined}
            >
              <tab.icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

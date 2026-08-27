import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useCapabilities } from "@/hooks/use-capabilities";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/settings", label: "General", exact: true, requiresAccess: false },
  { to: "/settings/access", label: "Access Control", exact: false, requiresAccess: true },
] as const;

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { canViewAccessControl } = useCapabilities();
  const visibleTabs = tabs.filter((t) => !t.requiresAccess || canViewAccessControl);

  return (
    <div className="mx-auto w-full max-w-[900px] space-y-6">
      <nav className="flex flex-wrap gap-1 border-b border-hairline pb-3">
        {visibleTabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.to
            : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {tab.to === "/settings/access" && <ShieldCheck className="size-4" />}
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}

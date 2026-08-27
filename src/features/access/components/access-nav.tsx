import { Link, useRouterState } from "@tanstack/react-router";
import { KeyRound, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/settings/access", label: "Overview", icon: Shield, exact: true },
  { to: "/settings/access/users", label: "Users", icon: Users, exact: false },
  { to: "/settings/access/roles", label: "Roles", icon: Shield, exact: false },
  { to: "/settings/access/permissions", label: "Permissions", icon: KeyRound, exact: false },
] as const;

export function AccessNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-wrap gap-1 border-b border-hairline pb-3">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.to
          : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
        const Icon = tab.icon;
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
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

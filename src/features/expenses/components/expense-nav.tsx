import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, LayoutGrid, List, PiggyBank, Tags, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/expenses", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/expenses/transactions", label: "Transactions", icon: List, exact: false },
  { to: "/expenses/budgets", label: "Budgets", icon: PiggyBank, exact: false },
  { to: "/expenses/insights", label: "Insights", icon: BarChart3, exact: false },
  { to: "/expenses/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/expenses/members", label: "Members", icon: Users, exact: false },
] as const;

export function ExpenseNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="glass-panel flex gap-1 overflow-x-auto rounded-xl p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
              active
                ? "bg-primary/15 font-medium text-primary shadow-soft"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <tab.icon className="size-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, LayoutGrid, List, PiggyBank, Tags, Users } from "lucide-react";
import { useExpenseMonth } from "@/features/expenses/expense-month-context";
import { expenseTabAccent, navAccentStyle, semanticTextClasses } from "@/lib/design/semantic";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/expenses", label: "Overview", icon: LayoutGrid, exact: true, code: "01" },
  { to: "/expenses/transactions", label: "Transactions", icon: List, exact: false, code: "02" },
  { to: "/expenses/budgets", label: "Budgets", icon: PiggyBank, exact: false, code: "03" },
  { to: "/expenses/insights", label: "Insights", icon: BarChart3, exact: false, code: "04" },
  { to: "/expenses/categories", label: "Categories", icon: Tags, exact: false, code: "05" },
  { to: "/expenses/members", label: "Members", icon: Users, exact: false, code: "06" },
] as const;

export function ExpenseNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { month } = useExpenseMonth();

  return (
    <nav className="hud-panel angular-clip p-1.5">
      <div className="relative z-[1] flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="sr-only">Expense module navigation</p>
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
          const accent = expenseTabAccent[tab.to] ?? "primary";
          return (
            <Link
              key={tab.to}
              to={tab.to}
              search={{ month }}
              className={cn(
                "group relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 angular-clip-sm",
                active
                  ? cn("font-medium nav-active-glow", semanticTextClasses(accent))
                  : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
              )}
              style={active ? navAccentStyle(accent) : undefined}
            >
              {active ? (
                <span
                  className="absolute bottom-0 left-2 right-2 h-px opacity-60"
                  style={{
                    background: `linear-gradient(90deg, transparent, var(--nav-accent), transparent)`,
                  }}
                />
              ) : null}
              <tab.icon
                className={cn(
                  "size-4 shrink-0 transition",
                  active ? semanticTextClasses(accent) : "opacity-65 group-hover:opacity-100",
                )}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="hidden text-[9px] tracking-widest text-muted-foreground/60 lg:inline">
                {tab.code}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

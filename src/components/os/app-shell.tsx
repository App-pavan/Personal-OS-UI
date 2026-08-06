import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { modules, primaryNav, user, activity } from "@/lib/os-data";
import { useTheme } from "./theme-provider";
import { CommandPalette, useCommandPalette } from "./command-palette";

const groups: { key: "core" | "life" | "system"; label: string }[] = [
  { key: "core", label: "Core" },
  { key: "life", label: "Life" },
  { key: "system", label: "System" },
];

function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5">
      <span className="gradient-primary grid size-9 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-float">
        <Sparkles className="size-4" />
      </span>
      {!compact ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">Personal OS</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            Your life, organized
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavList({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="space-y-5">
      {groups.map((g) => (
        <div key={g.key} className="space-y-1">
          {!compact ? (
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {g.label}
            </p>
          ) : null}
          {modules
            .filter((m) => m.group === g.key)
            .map((m) => {
              const active = pathname === m.to;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  onClick={onNavigate}
                  aria-label={m.label}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                    compact && "justify-center px-0",
                    active
                      ? "bg-primary-soft text-primary shadow-soft"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <m.icon className={cn("size-[18px] shrink-0 transition-transform duration-300", active && "scale-110")} />
                  {!compact ? <span className="truncate">{m.label}</span> : null}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );
}

function NotificationsButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative size-11 rounded-2xl md:size-10"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-3xl border-hairline p-2">
        <p className="px-3 py-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Recent activity
        </p>
        <div className="space-y-1">
          {activity.map((a) => (
            <div key={a.id} className="rounded-2xl px-3 py-2 transition-colors hover:bg-muted/70">
              <p className="text-sm font-medium">{a.what}</p>
              <p className="text-xs text-muted-foreground">
                {a.module} · {a.when}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { open, setOpen } = useCommandPalette();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="ambient-canvas min-h-screen">
      <CommandPalette open={open} onOpenChange={setOpen} />

      <div className="flex min-h-screen w-full">
        {/* Tablet rail + desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col gap-6 border-r border-hairline bg-sidebar/70 px-3 py-5 backdrop-blur-xl transition-[width] duration-500 md:flex",
            collapsed ? "w-[84px]" : "w-[84px] lg:w-[268px]",
          )}
        >
          <div className={cn("px-1", collapsed ? "flex justify-center" : "lg:px-2")}>
            <span className={cn(collapsed ? "block" : "hidden lg:block")}>
              <Wordmark compact={collapsed} />
            </span>
            <span className={cn(collapsed ? "hidden" : "block lg:hidden")}>
              <Wordmark compact />
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className={cn(collapsed ? "block" : "hidden lg:block")}>
              <NavList compact={collapsed} />
            </span>
            <span className={cn(collapsed ? "hidden" : "block lg:hidden")}>
              <NavList compact />
            </span>
          </div>

          <div className="hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((c) => !c)}
              className="w-full justify-start gap-2 rounded-2xl text-muted-foreground"
            >
              {collapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <>
                  <ChevronsLeft className="size-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="glass-panel sticky top-0 z-30 border-x-0 border-t-0 px-4 py-3 md:px-6">
            <div className="mx-auto grid w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="md:hidden">
                  <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                      <button aria-label="Open modules" className="flex items-center">
                        <Wordmark compact />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] border-hairline bg-sidebar p-5">
                      <SheetTitle className="sr-only">Modules</SheetTitle>
                      <div className="mb-6 flex items-center justify-between">
                        <Wordmark />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Close"
                          className="size-9 rounded-xl"
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="max-h-[calc(100vh-140px)] overflow-y-auto pb-6">
                        <NavList onNavigate={() => setMobileNavOpen(false)} />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <button
                  onClick={() => setOpen(true)}
                  className="hidden h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-hairline bg-surface/70 px-4 text-sm text-muted-foreground transition-all duration-300 hover:shadow-soft md:flex md:max-w-md"
                >
                  <Search className="size-4 shrink-0" />
                  <span className="truncate">Search everything…</span>
                  <kbd className="ml-auto shrink-0 rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold">
                    ⌘K
                  </kbd>
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search"
                  onClick={() => setOpen(true)}
                  className="size-11 rounded-2xl md:hidden"
                >
                  <Search className="size-[18px]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                  onClick={toggle}
                  className="size-11 rounded-2xl md:size-10"
                >
                  {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                </Button>
                <NotificationsButton />
                <Link
                  to="/settings"
                  aria-label="Account settings"
                  className="gradient-accent ml-1 grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-semibold text-accent-foreground shadow-soft transition-transform duration-300 hover:scale-105"
                >
                  {user.initials}
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pt-6 pb-32 md:px-6 md:pt-8 md:pb-12">{children}</main>
        </div>
      </div>

      {/* Mobile bottom navigation + floating quick action */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="pointer-events-auto mx-auto mb-4 flex max-w-md items-center gap-2 px-4">
          <nav className="glass-panel flex flex-1 items-center justify-between rounded-3xl px-2 py-2">
            {primaryNav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-label={n.label}
                  className={cn(
                    "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-2xl px-3 transition-all duration-300",
                    active ? "bg-primary-soft text-primary" : "text-muted-foreground",
                  )}
                >
                  <n.icon className={cn("size-[18px] transition-transform", active && "scale-110")} />
                  <span className="text-[10px] font-semibold">{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <Link
            to="/assistant"
            aria-label="Quick action"
            className="gradient-primary grid size-14 shrink-0 place-items-center rounded-3xl text-primary-foreground shadow-lifted transition-transform duration-300 active:scale-95"
          >
            <Plus className="size-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}

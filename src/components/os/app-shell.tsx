import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Command,
  Lock,
  Mic,
  NotebookPen,
  Plus,
  ScanLine,
  Search,
  Sparkles,
  Sun,
  Moon,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { modules, primaryNav, user, activity } from "@/lib/os-data";
import { session, useOS, intents, docs } from "@/lib/os-store";
import { useTheme } from "./theme-provider";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { LockScreen } from "./lock-screen";
import { toast } from "sonner";

const groups: { key: "core" | "life" | "system"; label: string }[] = [
  { key: "core", label: "Work" },
  { key: "life", label: "Life" },
  { key: "system", label: "System" },
];

/* ---------- adaptive rail (Arc / visionOS flavored) ---------- */

function Rail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [pinned, setPinned] = useState(false);

  return (
    <aside
      onMouseEnter={() => setPinned(true)}
      onMouseLeave={() => setPinned(false)}
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col gap-4 px-2.5 py-4 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
        pinned ? "w-[236px]" : "w-[68px]",
      )}
    >
      <Link to="/" className="flex items-center gap-2.5 px-1.5 py-1">
        <span className="gradient-primary grid size-9 shrink-0 place-items-center rounded-lg text-primary-foreground shadow-soft">
          <Sparkles className="size-4" />
        </span>
        <span
          className={cn(
            "min-w-0 transition-opacity duration-300",
            pinned ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <span className="block truncate text-sm font-semibold tracking-tight">Personal OS</span>
          <span className="block truncate text-[11px] text-muted-foreground">{user.name}'s system</span>
        </span>
      </Link>

      <div className="flex-1 space-y-4 overflow-y-auto pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((g) => (
          <div key={g.key} className="space-y-0.5">
            <p
              className={cn(
                "label-eyebrow px-2.5 pb-1 transition-opacity duration-300",
                pinned ? "opacity-100" : "opacity-0",
              )}
            >
              {g.label}
            </p>
            {modules
              .filter((m) => m.group === g.key)
              .map((m) => {
                const active = pathname === m.to;
                return (
                  <Tooltip key={m.to}>
                    <TooltipTrigger asChild>
                      <Link
                        to={m.to}
                        aria-label={m.label}
                        className={cn(
                          "rail-item group relative flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm",
                          active
                            ? "bg-primary-soft font-semibold text-primary"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        {active ? (
                          <span className="absolute top-1/2 -left-1.5 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
                        ) : null}
                        <m.icon className="size-[17px] shrink-0" />
                        <span
                          className={cn(
                            "truncate transition-opacity duration-300",
                            pinned ? "opacity-100" : "pointer-events-none opacity-0",
                          )}
                        >
                          {m.label}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    {!pinned ? (
                      <TooltipContent side="right" className="rounded-md">
                        {m.label}
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                );
              })}
          </div>
        ))}
      </div>

      <button
        onClick={() => session.lock()}
        className="rail-item flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      >
        <Lock className="size-[17px] shrink-0" />
        <span
          className={cn(
            "truncate transition-opacity duration-300",
            pinned ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          Lock OS
        </span>
      </button>
    </aside>
  );
}

/* ---------- global quick actions ---------- */

const quickActions = [
  { label: "Quick note", icon: NotebookPen, run: () => docs.add("Quick note") },
  { label: "Quick task", icon: Plus, run: () => intents.add("New intent") },
  { label: "Ask AI", icon: Sparkles, run: () => null },
  { label: "Voice capture", icon: Mic, run: () => null },
  { label: "Scan document", icon: ScanLine, run: () => null },
  { label: "Upload file", icon: Upload, run: () => null },
  { label: "Start timer", icon: Timer, run: () => null },
];

function QuickActions({ trigger }: { trigger: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-64 rounded-xl border-hairline p-1.5">
        <p className="label-eyebrow px-2.5 py-2">Quick actions</p>
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => {
              a.run();
              toast.success(a.label, { description: "Captured into your OS" });
            }}
            className="row-quiet flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm"
          >
            <a.icon className="size-4 text-muted-foreground" />
            <span>{a.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Recent activity"
          className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
        >
          <Bell className="size-[17px]" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-accent" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-xl border-hairline p-1.5">
        <p className="label-eyebrow px-2.5 py-2">Context changes</p>
        <div className="hairline-list">
          {activity.map((a) => (
            <div key={a.id} className="px-2.5 py-2.5">
              <p className="text-sm">{a.what}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {a.module} · {a.when}
              </p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------- shell ---------- */

export function AppShell({ children }: { children: ReactNode }) {
  const { unlocked, hydrated } = useOS();
  const { theme, toggle } = useTheme();
  const { open, setOpen } = useCommandPalette();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    session.hydrate();
  }, []);

  const current = modules.find((m) => m.to === pathname);

  if (!hydrated) {
    return (
      <div className="ambient-canvas grid min-h-screen place-items-center">
        <span className="gradient-primary animate-breathe grid size-11 place-items-center rounded-lg text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
      </div>
    );
  }

  if (!unlocked) return <LockScreen />;

  return (
    <div className="ambient-canvas min-h-screen">
      <CommandPalette open={open} onOpenChange={setOpen} />

      <div className="flex min-h-screen w-full">
        <Rail />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-hairline bg-background/70 px-4 py-2.5 backdrop-blur-xl md:px-8">
            <div className="mx-auto grid w-full max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="md:hidden">
                  <Sheet open={mobileNav} onOpenChange={setMobileNav}>
                    <SheetTrigger asChild>
                      <button aria-label="Open modules" className="flex items-center gap-2">
                        <span className="gradient-primary grid size-8 place-items-center rounded-lg text-primary-foreground">
                          <Sparkles className="size-4" />
                        </span>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] border-hairline bg-sidebar p-4">
                      <SheetTitle className="sr-only">Modules</SheetTitle>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm font-semibold">Personal OS</span>
                        <button
                          aria-label="Close"
                          onClick={() => setMobileNav(false)}
                          className="grid size-8 place-items-center rounded-md text-muted-foreground"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="max-h-[calc(100vh-120px)] space-y-4 overflow-y-auto pb-6">
                        {groups.map((g) => (
                          <div key={g.key} className="space-y-0.5">
                            <p className="label-eyebrow px-2 pb-1">{g.label}</p>
                            {modules
                              .filter((m) => m.group === g.key)
                              .map((m) => (
                                <Link
                                  key={m.to}
                                  to={m.to}
                                  onClick={() => setMobileNav(false)}
                                  className={cn(
                                    "flex h-11 items-center gap-3 rounded-lg px-2.5 text-sm",
                                    pathname === m.to
                                      ? "bg-primary-soft font-semibold text-primary"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  <m.icon className="size-[17px]" />
                                  {m.label}
                                </Link>
                              ))}
                          </div>
                        ))}
                        <button
                          onClick={() => session.lock()}
                          className="flex h-11 w-full items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground"
                        >
                          <Lock className="size-[17px]" /> Lock OS
                        </button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <button
                  onClick={() => setOpen(true)}
                  className="group flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition hover:bg-muted/70 md:max-w-sm"
                >
                  <Search className="size-4 shrink-0" />
                  <span className="truncate">
                    {current ? `Search ${current.label.toLowerCase()} and everything else…` : "Search everything…"}
                  </span>
                  <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded-md border border-hairline px-1.5 py-0.5 text-[10px] font-medium md:flex">
                    <Command className="size-2.5" />K
                  </kbd>
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <QuickActions
                  trigger={
                    <button
                      aria-label="Quick actions"
                      className="hidden size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/70 hover:text-foreground md:grid"
                    >
                      <Plus className="size-[17px]" />
                    </button>
                  }
                />
                <button
                  aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
                  onClick={toggle}
                  className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
                >
                  {theme === "dark" ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
                </button>
                <Notifications />
                <Link
                  to="/settings"
                  aria-label="Account"
                  className="gradient-accent ml-1 grid size-8 place-items-center rounded-lg text-xs font-semibold text-accent-foreground"
                >
                  {user.initials}
                </Link>
              </div>
            </div>
          </header>

          <main key={pathname} className="animate-soft-in flex-1 px-4 pt-6 pb-32 md:px-8 md:pt-9 md:pb-14">
            {children}
          </main>
        </div>
      </div>

      {/* mobile: floating glass bar + quick capture */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="pointer-events-auto mx-auto mb-3 flex max-w-md items-center gap-2 px-3">
          <nav className="glass-panel flex flex-1 items-center justify-between rounded-xl px-1.5 py-1.5">
            {primaryNav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-label={n.label}
                  className={cn(
                    "rail-item flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2.5",
                    active ? "bg-primary-soft text-primary" : "text-muted-foreground",
                  )}
                >
                  <n.icon className="size-[17px]" />
                  <span className="text-[10px] font-medium">{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <QuickActions
            trigger={
              <button
                aria-label="Quick actions"
                className="gradient-primary grid size-12 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-float transition active:scale-95"
              >
                <Plus className="size-5" />
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}

export function ContinueStrip() {
  return (
    <Link
      to="/notes"
      className="row-quiet flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground"
    >
      Continue where you left off <ArrowRight className="size-3.5" />
    </Link>
  );
}

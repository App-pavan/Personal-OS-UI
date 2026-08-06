import { type ReactNode } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ---------- Layout primitives ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 md:space-y-8">{children}</div>;
}

export function ModuleHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-rise grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 truncate text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  title,
  action,
  children,
  className,
  delay = 0,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={cn("animate-rise space-y-4", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {title ? (
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ---------- Cards ---------- */

export function Card({
  children,
  className,
  interactive,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface-card",
        padded && "p-5 md:p-6",
        interactive && "hover-lift cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "accent" | "info" | "success";
  delay?: number;
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    info: "bg-primary-soft text-info",
    success: "bg-primary-soft text-success",
  } as const;

  return (
    <div
      className="surface-card hover-lift animate-rise relative overflow-hidden p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-4" />
        </span>
        <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "accent" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    success: "bg-primary-soft text-success",
    warning: "bg-accent-soft text-warning",
    danger: "bg-accent-soft text-destructive",
    info: "bg-primary-soft text-info",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Meter({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    primary: "gradient-primary",
    accent: "gradient-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  } as const;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
        onClick && "hover:bg-muted/70",
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
    </Comp>
  );
}

/* ---------- AI ---------- */

export function AIBar({
  placeholder = "Ask AI anything about this module…",
  suggestions = [],
  onAsk,
}: {
  placeholder?: string;
  suggestions?: string[];
  onAsk?: (q: string) => void;
}) {
  return (
    <div className="surface-card glow-primary p-4 md:p-5">
      <div className="flex items-center gap-3">
        <span className="gradient-primary grid size-9 shrink-0 place-items-center rounded-2xl text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <form
          className="flex min-w-0 flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement | null;
            if (input?.value.trim()) {
              onAsk?.(input.value.trim());
              input.value = "";
            }
          }}
        >
          <Input
            name="q"
            placeholder={placeholder}
            className="h-11 min-w-0 flex-1 rounded-2xl border-transparent bg-muted/60 text-sm shadow-none focus-visible:ring-1"
          />
          <Button type="submit" size="icon" aria-label="Ask AI" className="size-11 rounded-2xl">
            <ArrowUpRight className="size-4" />
          </Button>
        </form>
      </div>
      {suggestions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onAsk?.(s)}
              className="rounded-full bg-muted/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  secondary,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  action?: ReactNode;
  secondary?: string;
}) {
  return (
    <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
      <div className="relative">
        <span className="bg-primary-soft absolute inset-0 animate-breathe rounded-full blur-xl" />
        <span className="relative grid size-16 place-items-center rounded-3xl bg-primary-soft text-primary">
          <Icon className="size-7" />
        </span>
      </div>
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
      {secondary ? <p className="mt-3 text-xs text-muted-foreground">{secondary}</p> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-2xl bg-muted", className)} />;
}

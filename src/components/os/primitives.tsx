import { type ReactNode } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ---------- Layout primitives ---------- */

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1500px] space-y-8 md:space-y-10">{children}</div>;
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
        {eyebrow ? <p className="label-eyebrow">{eyebrow}</p> : null}
        <h1 className="display-lg mt-2 truncate">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
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
      className={cn("animate-rise space-y-3", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {title ? (
        <div className="flex items-center justify-between gap-4">
          <h2 className="label-eyebrow">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ---------- Containers ---------- */

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
        padded && "p-4 md:p-5",
        interactive && "hover-lift cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A quiet metric that reads as a sentence, not a KPI tile. */
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
    primary: "text-primary",
    accent: "text-accent",
    info: "text-info",
    success: "text-success",
  } as const;

  return (
    <div
      className="animate-rise border-l border-hairline pl-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("size-3.5 shrink-0", tones[tone])} />
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl leading-none font-medium tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
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
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
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
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  } as const;
  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}>
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
        "flex w-full items-center gap-3 rounded-md px-2 py-3 text-left",
        onClick && "row-quiet",
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{title}</p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
    </Comp>
  );
}

/* ---------- Context intelligence ---------- */

/** A sentence the OS says to you. Context, never analytics. */
export function ContextLine({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "accent" | "muted";
}) {
  const tones = {
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  } as const;
  return (
    <p className="flex items-start gap-2.5 text-sm leading-relaxed">
      <Sparkles className={cn("mt-0.5 size-3.5 shrink-0", tones[tone])} />
      <span className="text-foreground/90">{children}</span>
    </p>
  );
}

export function AIBar({
  placeholder = "Ask about anything in this space…",
  suggestions = [],
  onAsk,
}: {
  placeholder?: string;
  suggestions?: string[];
  onAsk?: (q: string) => void;
}) {
  return (
    <div className="surface-quiet p-3">
      <form
        className="flex min-w-0 items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement | null;
          if (input?.value.trim()) {
            onAsk?.(input.value.trim());
            input.value = "";
          }
        }}
      >
        <Sparkles className="ml-1 size-4 shrink-0 text-primary" />
        <Input
          name="q"
          placeholder={placeholder}
          className="h-9 min-w-0 flex-1 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="icon" variant="ghost" aria-label="Ask AI" className="size-9 rounded-md">
          <ArrowUpRight className="size-4" />
        </Button>
      </form>
      {suggestions.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onAsk?.(s)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
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
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-base font-medium">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
      {secondary ? <p className="mt-3 text-xs text-muted-foreground">{secondary}</p> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-shimmer rounded-md bg-muted", className)} />;
}

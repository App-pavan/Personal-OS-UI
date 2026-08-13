import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Labels & dividers ---------- */

export function SectionLabel({
  children,
  module,
  className,
}: {
  children: ReactNode;
  module?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {module ? (
        <p className="text-[10px] font-medium tracking-[0.2em] text-primary/80 uppercase">
          {module}
        </p>
      ) : null}
      <p className="label-eyebrow">{children}</p>
      <hr className="tech-divider mt-2 border-0" />
    </div>
  );
}

export function TechnicalDivider({ className }: { className?: string }) {
  return <hr className={cn("tech-divider border-0", className)} />;
}

/* ---------- Panels ---------- */

export function HudPanel({
  children,
  className,
  glow,
  corners,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  corners?: boolean;
}) {
  return (
    <div
      className={cn(
        "hud-panel angular-clip p-4 md:p-5",
        glow && "hud-panel-glow",
        corners && "hud-corners",
        className,
      )}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/* ---------- Metrics ---------- */

export function MetricDisplay({
  label,
  value,
  hint,
  large,
  warn,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  large?: boolean;
  warn?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "font-mono font-semibold tabular-nums tracking-tight",
          large ? "text-4xl md:text-5xl metric-glow" : "text-xl md:text-2xl",
          warn && "text-accent",
        )}
      >
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* ---------- Buttons ---------- */

export function FuturisticButton({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      className={cn(variant === "primary" ? "btn-future" : "btn-future-ghost", className)}
      {...props}
    />
  );
}

/* ---------- Status ---------- */

export function StatusIndicator({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "active" | "alert";
}) {
  const tones = {
    neutral: "bg-muted-foreground/40",
    active: "bg-primary shadow-[0_0_8px_rgb(65_174_169/50%)]",
    alert: "bg-accent shadow-[0_0_8px_rgb(166_246_241/40%)]",
  };
  return (
    <span className="inline-flex items-center gap-2 text-[11px] tracking-wide text-muted-foreground uppercase">
      <span className={cn("size-1.5 rounded-full", tones[tone])} />
      {label}
    </span>
  );
}

/* ---------- Progress ---------- */

export function ProgressIndicator({ percent, className }: { percent: number; className?: string }) {
  const width = Math.min(Math.max(percent, 0), 100);
  return (
    <div className={cn("h-1.5 overflow-hidden bg-muted/40 angular-clip-sm", className)}>
      <div
        className="h-full bg-primary transition-all duration-500 angular-clip-sm"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ---------- Empty / loading ---------- */

export function FuturisticEmpty({
  title,
  line,
  action,
  icon,
}: {
  title: string;
  line: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="animate-hud-in flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center angular-clip-sm border border-primary/25 bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="mt-6 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </p>
      <hr className="tech-divider mt-3 w-24 border-0" />
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{line}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function ScanSkeleton({ className }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("scan-skeleton angular-clip-sm", className)} />;
}

/* ---------- Modal shell ---------- */

export function FuturisticModalShell({
  children,
  className,
  onBackdropClick,
}: {
  children: ReactNode;
  className?: string;
  onBackdropClick?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/90 p-0 backdrop-blur-md sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdropClick?.();
      }}
    >
      <div
        className={cn(
          "animate-hud-in hud-panel hud-corners w-full max-w-lg angular-clip border border-primary/20",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Command center headers ---------- */

export function SectionHeader({
  system,
  module,
  title,
  subtitle,
  actions,
}: {
  system?: string;
  module?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="animate-hud-in flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {system ? (
          <p className="text-[10px] font-medium tracking-[0.22em] text-primary/80 uppercase">
            {system}
          </p>
        ) : null}
        {module ? (
          <p className="mt-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {module}
          </p>
        ) : null}
        <h1 className="display-lg mt-2 truncate">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        <hr className="tech-divider mt-4 max-w-lg border-0" />
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function MetricPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("metric-panel p-5 md:p-6", className)}>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function DataPanel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("data-panel overflow-hidden", className)}>
      {title ? (
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3 md:px-5">
          <p className="label-eyebrow">{title}</p>
          {action}
        </div>
      ) : null}
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

export function InsightPanel({
  signal,
  children,
  className,
}: {
  signal: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("insight-panel p-4 md:p-5", className)}>
      <p className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">{signal}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export function ActivityItem({
  title,
  meta,
  amount,
  onClick,
  active,
}: {
  title: string;
  meta: string;
  amount: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 border-b border-hairline/40 py-3.5 text-left transition",
        onClick && "hover:bg-primary/6",
        active && "bg-primary/8",
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          active ? "bg-primary shadow-[0_0_8px_rgb(65_174_169/60%)]" : "bg-primary/50",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <span className="shrink-0 font-mono text-sm tabular-nums">{amount}</span>
    </Comp>
  );
}

export function PeriodChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs transition angular-clip-sm",
        active
          ? "bg-primary/15 font-medium text-primary shadow-[0_0_16px_rgb(65_174_169/15%)]"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

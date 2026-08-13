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
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-0 backdrop-blur-md sm:items-center sm:p-4"
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

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl border border-hairline/80 p-4 md:p-5",
        glow && "shadow-[0_0_40px_-12px_hsl(var(--primary)/0.25)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("glass-panel rounded-xl border border-hairline/60 p-3 md:p-4", className)}>
      {children}
    </div>
  );
}

export function GlassButton({
  children,
  className,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "accent" | "ghost";
}) {
  const variants = {
    default: "bg-primary/90 text-primary-foreground hover:bg-primary shadow-soft",
    accent: "bg-accent/90 text-accent-foreground hover:bg-accent",
    ghost: "bg-transparent text-foreground hover:bg-muted/60 border border-hairline/60",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlassInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "glass-panel w-full rounded-lg border border-hairline/70 bg-background/40 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export function GlassBadge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "accent" | "warning" | "success" | "muted" | "info" | "danger";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary/15 text-primary border-primary/25",
    accent: "bg-primary/12 text-primary border-primary/20",
    warning: "bg-primary/15 text-primary border-primary/25",
    success: "bg-[rgb(238_238_238/0.08)] text-muted-foreground border-hairline",
    muted: "bg-[rgb(238_238_238/0.06)] text-muted-foreground border-hairline",
    info: "bg-[rgb(238_238_238/0.08)] text-muted-foreground border-hairline",
    danger: "bg-destructive/12 text-destructive border-destructive/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

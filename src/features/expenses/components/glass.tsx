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
    <div className={cn("hud-panel angular-clip p-4 md:p-5", glow && "hud-panel-glow", className)}>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hud-panel angular-clip-sm p-3 md:p-4", className)}>
      <div className="relative z-[1]">{children}</div>
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
    default: "btn-future",
    accent: "btn-future bg-accent text-accent-foreground hover:bg-accent/90",
    ghost: "btn-future-ghost",
  };
  return (
    <button className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function GlassInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "hud-panel w-full angular-clip-sm border border-hairline bg-background/30 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
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
    primary: "bg-primary/15 text-primary border-primary/30",
    accent: "bg-accent/15 text-accent border-accent/25",
    warning: "bg-primary/15 text-primary border-primary/30",
    success: "bg-muted/50 text-muted-foreground border-hairline",
    muted: "bg-muted/40 text-muted-foreground border-hairline",
    info: "bg-muted/40 text-muted-foreground border-hairline",
    danger: "bg-destructive/15 text-accent border-destructive/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[11px] font-medium angular-clip-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

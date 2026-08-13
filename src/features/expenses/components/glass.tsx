import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import type { SemanticTone } from "@/lib/design/semantic";
import { navAccentStyle } from "@/lib/design/semantic";
import { SemanticBadge } from "@/components/future";
import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  glow,
  accent,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  accent?: SemanticTone;
}) {
  return (
    <div
      className={cn(
        "hud-panel angular-clip p-4 md:p-5 card-accent-top",
        glow && "hud-panel-glow",
        className,
      )}
      style={accent ? navAccentStyle(accent) : undefined}
    >
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
  variant?: "default" | "accent" | "ghost" | "secondary" | "danger" | "ai";
}) {
  const variants = {
    default: "btn-future",
    accent: "btn-future bg-accent text-accent-foreground hover:bg-accent/90",
    ghost: "btn-future-ghost",
    secondary: "btn-future-secondary",
    danger: "btn-future-danger",
    ai: "btn-future-ai",
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
  dot,
  className,
}: {
  children: ReactNode;
  tone?: SemanticTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <SemanticBadge tone={tone} dot={dot} className={className}>
      {children}
    </SemanticBadge>
  );
}

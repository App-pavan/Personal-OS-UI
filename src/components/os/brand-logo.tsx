import { cn } from "@/lib/utils";

export const BRAND = {
  name: "Personal OS",
  tagline: "Your life, organized",
  logo: "/logo.png",
  logoIcon: "/logo-icon.png",
} as const;

type BrandLogoProps = {
  /** Icon-only mark (hexagon P) or full wordmark image */
  variant?: "icon" | "full";
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
};

export function BrandLogo({
  variant = "icon",
  className,
  iconClassName,
  showWordmark = false,
}: BrandLogoProps) {
  if (variant === "full") {
    return (
      <img
        src={BRAND.logo}
        alt={BRAND.name}
        className={cn("h-auto w-full max-w-[280px] object-contain", className)}
        decoding="async"
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={BRAND.logoIcon}
        alt=""
        aria-hidden
        className={cn("size-9 shrink-0 object-contain", iconClassName)}
        decoding="async"
      />
      {showWordmark ? (
        <span className="truncate text-sm font-semibold tracking-tight">{BRAND.name}</span>
      ) : null}
    </span>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={BRAND.logoIcon}
      alt={BRAND.name}
      className={cn("object-contain", className)}
      decoding="async"
    />
  );
}

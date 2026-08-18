import type { ReactNode } from "react";
import { FuturisticButton } from "@/components/future";
import { EmptyState } from "@/components/os/state-views";
import { Link2, PenLine, TrendingUp } from "lucide-react";

export function WealthEmptyState({
  onConnectZerodha,
  onConnectGroww,
  onAddManual,
  connecting,
}: {
  onConnectZerodha: () => void;
  onConnectGroww: () => void;
  onAddManual: () => void;
  connecting?: boolean;
}) {
  return (
    <EmptyState
      tone="secondary"
      icon={<TrendingUp className="size-5" />}
      title="Connect your investments"
      line="Connect Zerodha or Groww to automatically track your portfolio and returns, or add investments manually."
      action={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <FuturisticButton onClick={onConnectZerodha} disabled={connecting}>
            <Link2 className="size-3.5" /> Connect Zerodha
          </FuturisticButton>
          <FuturisticButton variant="ghost" onClick={onConnectGroww} disabled={connecting}>
            <Link2 className="size-3.5" /> Connect Groww
          </FuturisticButton>
          <FuturisticButton variant="ghost" onClick={onAddManual}>
            <PenLine className="size-3.5" /> Add manually
          </FuturisticButton>
        </div>
      }
    />
  );
}

export function WealthSectionError({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-hairline/60 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">Unable to load this section.</p>
      {onRetry ? (
        <FuturisticButton variant="ghost" className="mt-3 text-xs" onClick={onRetry}>
          Try again
        </FuturisticButton>
      ) : null}
    </div>
  );
}

export function WealthInlineMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

import { RowsSkeleton } from "@/components/os/state-views";
import type { WealthHolding } from "@/lib/api/wealth-types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { holdingDisplayPnl, holdingDisplayValue, holdingPnlPercent } from "../lib/allocation";
import { formatPnlMinor, formatPnlPercent, pnlTextClass } from "../lib/format";
import { WealthPanel } from "./wealth-summary";

function HoldingIcon({ name, symbol }: { name: string; symbol: string }) {
  const initial = (name || symbol || "?").charAt(0).toUpperCase();
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-md border border-hairline/60 bg-muted/30 text-sm font-medium">
      {initial}
    </span>
  );
}

function HoldingRow({ holding, currency }: { holding: WealthHolding; currency: string }) {
  const inst = holding.instrument;
  const name = inst?.name || inst?.symbol || "Unknown";
  const symbol = inst?.symbol ?? "—";
  const exchange = inst?.exchange;
  const value = holdingDisplayValue(holding);
  const pnl = holdingDisplayPnl(holding);

  return (
    <div className="flex items-center gap-3 border-b border-hairline/40 py-3 last:border-0">
      <HoldingIcon name={name} symbol={symbol} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[exchange, symbol].filter(Boolean).join(" · ") || symbol}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm tabular-nums">{formatMoney(value, currency)}</p>
        <p className={cn("font-mono text-xs tabular-nums", pnlTextClass(pnl))}>
          {formatPnlMinor(pnl, currency)} · {formatPnlPercent(holdingPnlPercent(holding))}
        </p>
      </div>
    </div>
  );
}

export function HoldingsPreview({
  holdings,
  currency,
  loading,
  limit = 7,
}: {
  holdings: WealthHolding[];
  currency: string;
  loading?: boolean;
  limit?: number;
}) {
  const top = [...holdings]
    .sort((a, b) => holdingDisplayValue(b) - holdingDisplayValue(a))
    .slice(0, limit);

  return (
    <WealthPanel
      title="Top holdings"
      accent="aqua"
      action={
        holdings.length > 0 ? (
          <span className="text-xs text-muted-foreground">Full portfolio — Phase 2</span>
        ) : null
      }
    >
      {loading ? (
        <RowsSkeleton rows={5} />
      ) : !top.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No holdings yet. Connect a broker or add an investment manually.
        </p>
      ) : (
        <div>
          <div className="hidden grid-cols-[minmax(0,1fr)_auto] gap-3 px-1 pb-2 text-[10px] tracking-wide text-muted-foreground uppercase md:grid">
            <span>Instrument</span>
            <span className="text-right">Value · P&L</span>
          </div>
          {top.map((h) => (
            <HoldingRow key={h.id} holding={h} currency={currency} />
          ))}
        </div>
      )}
    </WealthPanel>
  );
}

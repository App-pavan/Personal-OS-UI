import type { CSSProperties } from "react";
import { navAccentStyle, semanticTextClasses, type SemanticTone } from "@/lib/design/semantic";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { formatPnlMinor, formatPnlPercent, pnlTextClass, pnlTone } from "../lib/format";

function SummaryTile({
  label,
  value,
  hint,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: SemanticTone;
}) {
  return (
    <div className="hud-panel angular-clip p-4 card-accent-top" style={navAccentStyle(tone)}>
      <p className="label-eyebrow">{label}</p>
      <p className={cn("mt-2 font-mono text-xl tabular-nums", semanticTextClasses(tone))}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function WealthSummaryCards({
  currency,
  currentValueMinor,
  investedMinor,
  pnlMinor,
  pnlPercent,
  monthlyExpensesMinor,
  expensesLoading,
}: {
  currency: string;
  currentValueMinor: number;
  investedMinor: number;
  pnlMinor: number;
  pnlPercent: number;
  monthlyExpensesMinor?: number;
  expensesLoading?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryTile
        label="Total portfolio"
        value={formatMoney(currentValueMinor, currency)}
        tone="primary"
      />
      <SummaryTile label="Invested" value={formatMoney(investedMinor, currency)} tone="secondary" />
      <SummaryTile
        label="Total P&L"
        value={formatPnlMinor(pnlMinor, currency)}
        hint={formatPnlPercent(pnlPercent)}
        tone={pnlTone(pnlMinor)}
      />
      <SummaryTile
        label="Monthly expenses"
        value={
          expensesLoading
            ? "—"
            : monthlyExpensesMinor != null
              ? formatMoney(monthlyExpensesMinor, currency)
              : "—"
        }
        hint="From Expenses module"
        tone="aqua"
      />
    </div>
  );
}

export function PortfolioValueCard({
  currency,
  currentValueMinor,
  pnlMinor,
  pnlPercent,
}: {
  currency: string;
  currentValueMinor: number;
  pnlMinor: number;
  pnlPercent: number;
}) {
  return (
    <div className="surface-card p-5 md:p-6">
      <p className="label-eyebrow">Total portfolio</p>
      <p className="display-lg mt-2 font-mono tabular-nums">
        {formatMoney(currentValueMinor, currency)}
      </p>
      <p className={cn("mt-2 font-mono text-sm tabular-nums", pnlTextClass(pnlMinor))}>
        {formatPnlMinor(pnlMinor, currency)} · {formatPnlPercent(pnlPercent)}
      </p>
    </div>
  );
}

export function WealthPanel({
  title,
  action,
  children,
  accent = "primary",
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  accent?: SemanticTone;
  className?: string;
}) {
  return (
    <div
      className={cn("hud-panel angular-clip overflow-hidden card-accent-top", className)}
      style={navAccentStyle(accent) as CSSProperties}
    >
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 md:px-5">
        <p className="label-eyebrow">{title}</p>
        {action}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

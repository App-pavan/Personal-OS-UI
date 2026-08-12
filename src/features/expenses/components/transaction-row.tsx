import { ChevronRight } from "lucide-react";
import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { formatWhen, ownershipLabel, statusLabel, statusTone } from "../lib/labels";
import { GlassBadge } from "./glass";

export function TransactionRow({
  transaction,
  onClick,
  compact,
}: {
  transaction: ExpenseTransaction;
  onClick?: () => void;
  compact?: boolean;
}) {
  const tone = statusTone[transaction.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 border-b border-hairline/50 py-3.5 text-left transition hover:bg-muted/30",
        compact && "py-3",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.merchant}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {transaction.categoryName ?? "Uncategorised"} · {formatWhen(transaction.occurredAt)}
        </p>
      </div>
      {!compact && (
        <GlassBadge tone={tone} className="hidden sm:inline-flex">
          {statusLabel[transaction.status]}
        </GlassBadge>
      )}
      {!compact && (
        <span className="hidden text-xs text-muted-foreground md:inline">
          {ownershipLabel[transaction.ownership]}
        </span>
      )}
      <span className="font-mono text-sm tabular-nums">
        {formatMoney(transaction.amountMinor, transaction.currency)}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

export function TransactionCard({
  transaction,
  onClick,
}: {
  transaction: ExpenseTransaction;
  onClick?: () => void;
}) {
  const tone = statusTone[transaction.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel w-full rounded-xl border border-hairline/60 p-4 text-left transition hover:border-primary/25"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{transaction.merchant}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {transaction.categoryName ?? "Uncategorised"}
          </p>
        </div>
        <p className="font-mono text-sm tabular-nums">
          {formatMoney(transaction.amountMinor, transaction.currency)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <GlassBadge tone={tone}>{statusLabel[transaction.status]}</GlassBadge>
        <GlassBadge tone="muted">{ownershipLabel[transaction.ownership]}</GlassBadge>
        <span className="text-xs text-muted-foreground">{formatWhen(transaction.occurredAt)}</span>
      </div>
    </button>
  );
}

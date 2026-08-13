import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { ActivityItem, DataPanel } from "@/components/future";
import { formatMoney } from "@/lib/money";
import { formatWhen, sourceLabel } from "../lib/labels";

export function RecentTransactions({
  transactions,
  onSelect,
  loading,
}: {
  transactions: ExpenseTransaction[];
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <DataPanel title="Recent activity">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="scan-skeleton h-12 angular-clip-sm" />
          ))}
        </div>
      </DataPanel>
    );
  }

  return (
    <DataPanel
      title="Recent activity"
      action={
        <Link
          to="/expenses/transactions"
          className="flex items-center gap-1 text-xs text-primary hover:text-accent"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      }
    >
      {transactions.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground md:px-5">
          No activity recorded yet.
        </p>
      ) : (
        <div className="px-2 md:px-3">
          {transactions.map((tx) => (
            <ActivityItem
              key={tx.id}
              title={tx.merchant}
              meta={`${tx.categoryName ?? "Uncategorised"} · ${formatWhen(tx.occurredAt)} · ${sourceLabel[tx.source] ?? tx.source}`}
              amount={formatMoney(tx.amountMinor, tx.currency)}
              onClick={() => onSelect(tx.id)}
            />
          ))}
        </div>
      )}
    </DataPanel>
  );
}

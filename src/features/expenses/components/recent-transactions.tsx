import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { GlassCard } from "./glass";
import { TransactionCard, TransactionRow } from "./transaction-row";

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
      <GlassCard>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0 md:p-0">
      <div className="flex items-center justify-between border-b border-hairline/60 px-4 py-3 md:px-5">
        <p className="label-eyebrow">Recent transactions</p>
        <Link
          to="/expenses/transactions"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground md:px-5">
          No transactions yet.
        </p>
      ) : (
        <>
          <div className="hidden md:block px-4 md:px-5">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} onClick={() => onSelect(tx.id)} compact />
            ))}
          </div>
          <div className="space-y-2 p-4 md:hidden">
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} onClick={() => onSelect(tx.id)} />
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}

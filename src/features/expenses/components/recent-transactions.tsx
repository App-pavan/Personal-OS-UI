import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ActivityItem, DataPanel, IconBadge } from "@/components/future";
import type { ExpenseCategory, ExpenseTransaction } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { displayCategoryLabel } from "../lib/category-resolve";
import { getCategoryMeta } from "../lib/category-meta";
import { formatWhenDetailed, sourceLabel } from "../lib/labels";

export function RecentTransactions({
  transactions,
  categories,
  onSelect,
  loading,
}: {
  transactions: ExpenseTransaction[];
  categories: ExpenseCategory[];
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <DataPanel title="Recent activity" accent="aqua">
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
      accent="aqua"
      action={
        <Link
          to="/expenses/transactions"
          className="flex items-center gap-1 text-xs tone-aqua-text hover:opacity-80"
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
          {transactions.map((tx) => {
            const label = displayCategoryLabel(tx, categories);
            const cat = getCategoryMeta(label, tx.categoryId ?? tx.suggestedCategoryId);
            return (
              <ActivityItem
                key={tx.id}
                title={tx.merchant}
                meta={`${label} · ${formatWhenDetailed(tx.occurredAt)} · ${sourceLabel[tx.source] ?? tx.source}`}
                amount={formatMoney(tx.amountMinor, tx.currency)}
                onClick={() => onSelect(tx.id)}
                tone={cat.tone}
                leading={<IconBadge icon={cat.icon} tone={cat.tone} size="sm" />}
              />
            );
          })}
        </div>
      )}
    </DataPanel>
  );
}

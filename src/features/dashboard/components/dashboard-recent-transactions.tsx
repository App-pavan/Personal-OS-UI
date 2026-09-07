import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ActivityItem, DataPanel, IconBadge } from "@/components/future";
import type { ExpenseCategory, ExpenseTransaction } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { displayCategoryLabel } from "@/features/expenses/lib/category-resolve";
import { getCategoryMeta } from "@/features/expenses/lib/category-meta";
import { formatWhenDetailed } from "@/features/expenses/lib/labels";
import { transactionDisplayTitle } from "@/features/expenses/lib/sms-duplicate-matcher";
import { DashboardWidget } from "./dashboard-widget";
import { EmptyState } from "@/components/os/state-views";

export function DashboardRecentTransactions({
  transactions,
  categories,
  month,
  loading,
  error,
  onRetry,
  onSelect,
}: {
  transactions: ExpenseTransaction[];
  categories: ExpenseCategory[];
  month: string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onSelect: (id: string) => void;
}) {
  if (loading) {
    return (
      <DashboardWidget loading skeletonRows={5} className="h-full" />
    );
  }

  if (error) {
    return (
      <DashboardWidget error={error} onRetry={onRetry} errorTitle="Transactions unavailable" />
    );
  }

  return (
    <DataPanel
      title="Recent transactions"
      accent="aqua"
      className="h-full"
      action={
        <Link
          to="/expenses"
          search={{ month }}
          className="flex items-center gap-1 text-xs tone-aqua-text hover:opacity-80"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      }
    >
      {transactions.length === 0 ? (
        <EmptyState
          title="No recent transactions"
          line="Add an expense to see activity here."
          tone="aqua"
        />
      ) : (
        <div className="px-2 md:px-3">
          {transactions.map((tx) => {
            const label = displayCategoryLabel(tx, categories);
            const cat = getCategoryMeta(label, tx.categoryId ?? tx.suggestedCategoryId);
            const title = transactionDisplayTitle(tx) || tx.merchant;
            const sign = tx.direction === "credit" ? "+" : "-";
            return (
              <ActivityItem
                key={tx.id}
                title={title}
                meta={`${label} · ${formatWhenDetailed(tx.occurredAt)}`}
                amount={`${sign}${formatMoney(tx.amountMinor, tx.currency)}`}
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

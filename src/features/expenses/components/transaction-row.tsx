import { ChevronRight } from "lucide-react";
import type {
  ExpenseCategory,
  ExpenseTransaction,
  TransactionPatchInput,
} from "@/lib/api/expense-types";
import { IconBadge } from "@/components/future";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { displayCategoryLabel } from "../lib/category-resolve";
import { getCategoryMeta } from "../lib/category-meta";
import { formatWhenDetailed, sourceLabel, sourceTone } from "../lib/labels";
import { GlassBadge } from "./glass";
import {
  DirectionArrow,
  OwnershipChip,
  StatusChip,
  TransactionCategoryChip,
} from "./transaction-chips";

type RowProps = {
  transaction: ExpenseTransaction;
  categories: ExpenseCategory[];
  onClick?: () => void;
  onQuickUpdate?: (input: TransactionPatchInput) => void;
  onOpenEditor?: (intent?: "split") => void;
};

function useRowHandlers(
  onQuickUpdate?: (input: TransactionPatchInput) => void,
  onOpenEditor?: (intent?: "split") => void,
) {
  const canEdit = Boolean(onQuickUpdate);

  const handleCategory = (categoryId: string) => {
    onQuickUpdate?.({ categoryId });
  };

  const handleOwnership = (ownership: ExpenseTransaction["ownership"]) => {
    if (!onQuickUpdate) return;
    if (ownership === "split") {
      onOpenEditor?.("split");
      return;
    }
    onQuickUpdate({ ownership });
  };

  const handleStatus = (status: ExpenseTransaction["status"]) => {
    if (!onQuickUpdate) return;
    if (status === "managed") {
      onOpenEditor?.();
      return;
    }
    onQuickUpdate({ status });
  };

  return { canEdit, handleCategory, handleOwnership, handleStatus };
}

export function TransactionRow({
  transaction,
  categories,
  onClick,
  onQuickUpdate,
  onOpenEditor,
}: RowProps) {
  const categoryLabel = displayCategoryLabel(transaction, categories);
  const cat = getCategoryMeta(
    categoryLabel,
    transaction.categoryId ?? transaction.suggestedCategoryId,
  );
  const { canEdit, handleCategory, handleOwnership, handleStatus } = useRowHandlers(
    onQuickUpdate,
    onOpenEditor,
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "group grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-hairline/40 px-1 py-4 text-left transition last:border-b-0",
        "hover:bg-primary/6 hover:shadow-[inset_0_0_0_1px_rgb(65_174_169/12%)]",
      )}
    >
      <IconBadge
        icon={cat.icon}
        tone={cat.tone}
        size="sm"
        className="transition group-hover:tone-primary-glow"
      />

      <div className="min-w-0 space-y-1.5">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium">
          <DirectionArrow direction={transaction.direction} />
          <span className="truncate">{transaction.merchant}</span>
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <div onClick={(e) => e.stopPropagation()}>
            <TransactionCategoryChip
              transaction={transaction}
              categories={categories}
              onSelect={canEdit ? handleCategory : undefined}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {formatWhenDetailed(transaction.occurredAt)}
          </span>
          <GlassBadge tone={sourceTone[transaction.source]} className="text-[10px]">
            {sourceLabel[transaction.source]}
          </GlassBadge>
        </div>
        {transaction.note ? (
          <p className="truncate text-[11px] text-muted-foreground/80">{transaction.note}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1.5 sm:flex" onClick={(e) => e.stopPropagation()}>
          <StatusChip status={transaction.status} onChange={canEdit ? handleStatus : undefined} />
          <OwnershipChip
            ownership={transaction.ownership}
            onChange={canEdit ? handleOwnership : undefined}
          />
        </div>
        <span className="min-w-[72px] text-right font-mono text-sm tabular-nums">
          {formatMoney(transaction.amountMinor, transaction.currency)}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
    </div>
  );
}

export function TransactionCard({
  transaction,
  categories,
  onClick,
  onQuickUpdate,
  onOpenEditor,
}: RowProps) {
  const categoryLabel = displayCategoryLabel(transaction, categories);
  const cat = getCategoryMeta(
    categoryLabel,
    transaction.categoryId ?? transaction.suggestedCategoryId,
  );
  const { canEdit, handleCategory, handleOwnership, handleStatus } = useRowHandlers(
    onQuickUpdate,
    onOpenEditor,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="hud-panel w-full angular-clip-sm p-3 text-left transition hover:border-primary/30 card-accent-top"
      style={{ ["--card-accent" as string]: cat.color }}
    >
      <div className="flex items-start gap-3">
        <IconBadge icon={cat.icon} tone={cat.tone} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium">
              <DirectionArrow direction={transaction.direction} />
              <span className="truncate">{transaction.merchant}</span>
            </p>
            <span className="shrink-0 font-mono text-sm tabular-nums">
              {formatMoney(transaction.amountMinor, transaction.currency)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <div onClick={(e) => e.stopPropagation()}>
              <TransactionCategoryChip
                transaction={transaction}
                categories={categories}
                onSelect={canEdit ? handleCategory : undefined}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {formatWhenDetailed(transaction.occurredAt)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
            <StatusChip status={transaction.status} onChange={canEdit ? handleStatus : undefined} />
            <OwnershipChip
              ownership={transaction.ownership}
              onChange={canEdit ? handleOwnership : undefined}
            />
            <GlassBadge tone={sourceTone[transaction.source]} className="text-[10px]">
              {sourceLabel[transaction.source]}
            </GlassBadge>
          </div>
        </div>
      </div>
    </button>
  );
}

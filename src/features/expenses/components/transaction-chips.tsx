import type {
  ExpenseCategory,
  ExpenseTransaction,
  TransactionOwnership,
} from "@/lib/api/expense-types";
import { SemanticBadge } from "@/components/future";
import type { SemanticTone } from "@/lib/design/semantic";
import { getCategoryMeta } from "../lib/category-meta";
import { displayCategoryLabel } from "../lib/category-resolve";
import { directionIcon, directionLabel, directionTone } from "../lib/labels";
import { cn } from "@/lib/utils";

export function CategoryChip({
  label,
  tone,
  onClick,
  className,
}: {
  label: string;
  tone: SemanticTone;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "semantic-badge text-[10px] font-medium",
        `tone-${tone}-bg tone-${tone}-border tone-${tone}-text`,
        onClick && "cursor-pointer transition hover:brightness-125",
        className,
      )}
    >
      {label}
    </Comp>
  );
}

export function TransactionCategoryChip({
  transaction,
  categories,
  onSelect,
}: {
  transaction: ExpenseTransaction;
  categories: ExpenseCategory[];
  onSelect?: (categoryId: string) => void;
}) {
  const label = displayCategoryLabel(transaction, categories);
  const cat = getCategoryMeta(label, transaction.categoryId ?? transaction.suggestedCategoryId);
  const isUncategorised = label === "Uncategorised";

  if (onSelect && categories.length) {
    return (
      <select
        value={transaction.categoryId ?? transaction.suggestedCategoryId ?? ""}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          if (e.target.value) onSelect(e.target.value);
        }}
        className={cn(
          "semantic-badge max-w-[120px] truncate border bg-transparent text-[10px] font-medium outline-none",
          `tone-${cat.tone}-border tone-${cat.tone}-text`,
          isUncategorised && "tone-muted-border tone-muted-text",
        )}
      >
        <option value="">Uncategorised</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    );
  }

  return <CategoryChip label={label} tone={isUncategorised ? "muted" : cat.tone} />;
}

export function OwnershipChip({
  ownership,
  onChange,
}: {
  ownership: TransactionOwnership;
  onChange?: (next: TransactionOwnership) => void;
}) {
  const tone = ownership === "split" ? "info" : "primary";
  const label = ownership === "split" ? "Split" : "Personal";

  if (onChange) {
    return (
      <select
        value={ownership}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value as TransactionOwnership);
        }}
        className={cn(
          "semantic-badge border bg-transparent text-[10px] font-medium outline-none",
          `tone-${tone}-border tone-${tone}-text`,
        )}
      >
        <option value="personal">Personal</option>
        <option value="split">Split</option>
      </select>
    );
  }

  return <SemanticBadge tone={tone}>{label}</SemanticBadge>;
}

export function StatusChip({
  status,
  onChange,
}: {
  status: ExpenseTransaction["status"];
  onChange?: (next: ExpenseTransaction["status"]) => void;
}) {
  const tones: Record<ExpenseTransaction["status"], SemanticTone> = {
    pending: "warning",
    managed: "success",
    ignored: "muted",
    archived: "secondary",
  };
  const labels: Record<ExpenseTransaction["status"], string> = {
    pending: "Pending",
    managed: "Managed",
    ignored: "Ignored",
    archived: "Archived",
  };

  if (onChange) {
    return (
      <select
        value={status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.value as ExpenseTransaction["status"]);
        }}
        className={cn(
          "semantic-badge border bg-transparent text-[10px] font-medium outline-none",
          `tone-${tones[status]}-border tone-${tones[status]}-text`,
        )}
      >
        <option value="pending">Pending</option>
        <option value="managed">Managed</option>
        <option value="ignored">Ignored</option>
      </select>
    );
  }

  return (
    <SemanticBadge tone={tones[status]} dot>
      {labels[status]}
    </SemanticBadge>
  );
}

export function DirectionChip({
  direction,
}: {
  direction?: import("@/lib/api/expense-types").TransactionDirection;
}) {
  if (!direction || direction === "unknown") return null;
  const tone = directionTone[direction];
  const label = directionLabel[direction];
  const icon = directionIcon[direction];
  return (
    <span
      className={cn(
        "semantic-badge border text-[10px] font-medium",
        `tone-${tone}-border tone-${tone}-text`,
      )}
      aria-label={label}
    >
      {icon} {label}
    </span>
  );
}

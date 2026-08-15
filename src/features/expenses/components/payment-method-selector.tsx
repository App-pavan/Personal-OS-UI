import type { PaymentMethod } from "@/lib/api/expense-types";
import { cn } from "@/lib/utils";
import { paymentMethodLabel } from "../lib/labels";

const PRIMARY: PaymentMethod[] = ["cash", "upi", "debit_card", "bank_transfer"];
const MORE: PaymentMethod[] = ["credit_card", "wallet", "other"];

type Props = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  showMore?: boolean;
  onToggleMore?: () => void;
};

function Chip({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border px-3 py-2 text-xs font-medium transition",
        selected
          ? "border-primary/50 bg-primary/10 text-foreground"
          : "border-hairline/70 text-muted-foreground hover:border-primary/30",
      )}
    >
      {paymentMethodLabel[method]}
    </button>
  );
}

export function PaymentMethodSelector({ value, onChange, showMore, onToggleMore }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRIMARY.map((method) => (
          <Chip
            key={method}
            method={method}
            selected={value === method}
            onSelect={() => onChange(method)}
          />
        ))}
        {showMore
          ? MORE.map((method) => (
              <Chip
                key={method}
                method={method}
                selected={value === method}
                onSelect={() => onChange(method)}
              />
            ))
          : null}
        {onToggleMore ? (
          <button
            type="button"
            onClick={onToggleMore}
            className="rounded-lg border border-dashed border-hairline/70 px-3 py-2 text-xs text-muted-foreground hover:border-primary/30"
          >
            {showMore ? "Less" : "More"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

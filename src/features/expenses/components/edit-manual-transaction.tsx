import { useState } from "react";
import type {
  ExpenseCategory,
  ExpenseMember,
  ExpenseTransaction,
  PaymentMethod,
  TransactionDirection,
  TransactionKind,
  TransactionPatchInput,
} from "@/lib/api/expense-types";
import { CategorySelector } from "./category-selector";
import { GlassButton, GlassInput } from "./glass";
import { MoneyInput } from "./money-input";
import { PaymentMethodSelector } from "./payment-method-selector";
import { transactionKindLabel } from "../lib/labels";
import { cn } from "@/lib/utils";

function toLocalDate(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function toLocalTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toIsoDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

export function EditManualTransaction({
  transaction,
  categories,
  onSave,
  saving,
}: {
  transaction: ExpenseTransaction;
  categories: ExpenseCategory[];
  members: ExpenseMember[];
  onSave: (input: TransactionPatchInput) => void;
  saving?: boolean;
}) {
  const [amountMinor, setAmountMinor] = useState(transaction.amountMinor);
  const [direction, setDirection] = useState<TransactionDirection>(
    transaction.direction ?? "debit",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction.paymentMethod ?? "cash",
  );
  const [transactionKind, setTransactionKind] = useState<TransactionKind>(
    transaction.transactionKind ?? "purchase",
  );
  const [payeeLabel, setPayeeLabel] = useState(
    transaction.counterparty || transaction.merchant || "",
  );
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? "");
  const [occurredDate, setOccurredDate] = useState(toLocalDate(transaction.occurredAt));
  const [occurredTime, setOccurredTime] = useState(toLocalTime(transaction.occurredAt));
  const [note, setNote] = useState(transaction.note ?? "");

  const isTransfer = transactionKind === "transfer" || transactionKind === "payment";

  const submit = () => {
    if (amountMinor <= 0) return;
    const trimmed = payeeLabel.trim();
    const patch: TransactionPatchInput = {
      amountMinor,
      direction,
      paymentMethod,
      transactionKind,
      occurredAt: toIsoDateTime(occurredDate, occurredTime),
      categoryId: categoryId || undefined,
      note,
      ...(isTransfer && trimmed
        ? { counterparty: trimmed, merchant: "" }
        : trimmed
          ? { merchant: trimmed, counterparty: "" }
          : {}),
    };
    onSave(patch);
  };

  return (
    <section className="space-y-4 rounded-lg border border-hairline/50 p-3">
      <p className="label-eyebrow">Edit manual transaction</p>
      <MoneyInput valueMinor={amountMinor} onChangeMinor={(v) => setAmountMinor(v ?? 0)} />
      <div className="grid grid-cols-2 gap-2">
        {(["debit", "credit"] as TransactionDirection[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={cn(
              "rounded-lg border py-2 text-xs font-medium",
              direction === d ? "border-primary/50 bg-primary/10" : "border-hairline/70",
            )}
          >
            {d === "debit" ? "↑ Outgoing" : "↓ Incoming"}
          </button>
        ))}
      </div>
      <GlassInput value={payeeLabel} onChange={(e) => setPayeeLabel(e.target.value)} />
      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
      <div className="flex flex-wrap gap-2">
        {(["purchase", "transfer", "payment", "other"] as TransactionKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => setTransactionKind(kind)}
            className={cn(
              "rounded-lg border px-2 py-1 text-[11px]",
              transactionKind === kind ? "border-primary/50 bg-primary/10" : "border-hairline/70",
            )}
          >
            {transactionKindLabel[kind]}
          </button>
        ))}
      </div>
      <CategorySelector categories={categories} value={categoryId} onChange={setCategoryId} />
      <div className="grid grid-cols-2 gap-2">
        <GlassInput
          type="date"
          value={occurredDate}
          onChange={(e) => setOccurredDate(e.target.value)}
        />
        <GlassInput
          type="time"
          value={occurredTime}
          onChange={(e) => setOccurredTime(e.target.value)}
        />
      </div>
      <textarea
        className="glass-panel min-h-[64px] w-full rounded-lg border border-hairline/70 p-3 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <GlassButton
        type="button"
        className="w-full"
        disabled={saving || amountMinor <= 0}
        onClick={submit}
      >
        Save changes
      </GlassButton>
    </section>
  );
}

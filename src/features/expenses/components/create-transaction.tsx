import { useEffect, useMemo, useState } from "react";
import type {
  ExpenseCategory,
  ExpenseMember,
  PaymentMethod,
  SplitMode,
  TransactionDirection,
  TransactionKind,
  TransactionOwnership,
  TransactionWriteInput,
} from "@/lib/api/expense-types";
import { expenseApi } from "@/lib/api/expense-service";
import { splitEqualMinor } from "@/lib/money";
import { cn } from "@/lib/utils";
import { CategorySelector } from "./category-selector";
import { GlassButton, GlassInput } from "./glass";
import { MemberSelector } from "./member-selector";
import { MoneyInput } from "./money-input";
import { PaymentMethodSelector } from "./payment-method-selector";
import { ReceiptField } from "./receipt-field";
import { splitIsBalanced, SplitEditor } from "./split-editor";
import { transactionKindLabel } from "../lib/labels";

type CreateInput = TransactionWriteInput;

function toIsoDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const local = new Date(year, month - 1, day, hour, minute, 0, 0);
  return local.toISOString();
}

function defaultDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function defaultTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function CreateTransactionFlow({
  categories,
  members,
  onCreate,
  creating,
  onCreateMember,
  creatingMember,
}: {
  categories: ExpenseCategory[];
  members: ExpenseMember[];
  onCreate: (input: CreateInput) => void;
  creating?: boolean;
  onCreateMember: (name: string) => void;
  creatingMember?: boolean;
}) {
  const [amountMinor, setAmountMinor] = useState<number | null>(null);
  const [direction, setDirection] = useState<TransactionDirection>("debit");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [showMoreMethods, setShowMoreMethods] = useState(false);
  const [transactionKind, setTransactionKind] = useState<TransactionKind>("purchase");
  const [payeeLabel, setPayeeLabel] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | undefined>();
  const [ownership, setOwnership] = useState<TransactionOwnership>("personal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [occurredDate, setOccurredDate] = useState(defaultDate);
  const [occurredTime, setOccurredTime] = useState(defaultTime);
  const [note, setNote] = useState("");
  const [billUrl, setBillUrl] = useState("");
  const currency = "INR";

  const isTransfer = transactionKind === "transfer" || transactionKind === "payment";
  const payeePlaceholder = isTransfer
    ? "Recipient name"
    : direction === "credit"
      ? "Received from"
      : "Merchant / person / description";

  useEffect(() => {
    const merchantHint = payeeLabel.trim();
    if (!merchantHint || merchantHint.length < 2) {
      setSuggestedCategoryId(undefined);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      expenseApi.categories.suggest(merchantHint).then((id) => {
        if (!cancelled && id) setSuggestedCategoryId(id);
      });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [payeeLabel, transactionKind]);

  const total = amountMinor ?? 0;
  const splitAmounts = useMemo(() => {
    if (ownership !== "split" || !selectedMembers.length) return [];
    if (splitMode === "equal") return splitEqualMinor(total, selectedMembers.length);
    return selectedMembers.map((id) => customAmounts[id] ?? 0);
  }, [ownership, selectedMembers, splitMode, customAmounts, total]);

  const hasContext = payeeLabel.trim() || note.trim();
  const canSubmit =
    amountMinor != null &&
    amountMinor > 0 &&
    hasContext &&
    (ownership !== "split" || (selectedMembers.length > 0 && splitIsBalanced(total, splitAmounts)));

  const submit = () => {
    if (!canSubmit || amountMinor == null) return;
    const trimmed = payeeLabel.trim();
    const payload: CreateInput = {
      amountMinor,
      currency,
      direction,
      paymentMethod,
      transactionKind,
      source: "manual",
      occurredAt: toIsoDateTime(occurredDate, occurredTime),
      ownership,
      ...(isTransfer && trimmed ? { counterparty: trimmed } : trimmed ? { merchant: trimmed } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(ownership === "split"
        ? {
            splitMode,
            splits: selectedMembers.map((memberId, i) => ({
              memberId,
              amountMinor: splitAmounts[i] ?? 0,
            })),
          }
        : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(billUrl ? { billUrl } : {}),
    };
    onCreate(payload);
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <p className="label-eyebrow">Amount</p>
        <MoneyInput
          valueMinor={amountMinor}
          onChangeMinor={setAmountMinor}
          className="text-2xl font-mono"
        />
        <div className="grid grid-cols-2 gap-2">
          {(["debit", "credit"] as TransactionDirection[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={cn(
                "rounded-lg border py-2 text-sm font-medium transition",
                direction === d
                  ? "border-primary/50 bg-primary/10"
                  : "border-hairline/70 hover:border-primary/30",
              )}
            >
              {d === "debit" ? "↑ Outgoing" : "↓ Incoming"}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="label-eyebrow">What was this?</p>
        <GlassInput
          placeholder={payeePlaceholder}
          value={payeeLabel}
          onChange={(e) => setPayeeLabel(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {(["purchase", "transfer", "payment", "other"] as TransactionKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setTransactionKind(kind)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition",
                transactionKind === kind
                  ? "border-primary/50 bg-primary/10"
                  : "border-hairline/70 text-muted-foreground hover:border-primary/30",
              )}
            >
              {transactionKindLabel[kind]}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="label-eyebrow">Payment method</p>
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={setPaymentMethod}
          showMore={showMoreMethods}
          onToggleMore={() => setShowMoreMethods((v) => !v)}
        />
      </section>

      <section className="space-y-2">
        <p className="label-eyebrow">Category</p>
        <CategorySelector
          categories={categories}
          value={categoryId}
          {...(suggestedCategoryId ? { suggestedId: suggestedCategoryId } : {})}
          onChange={setCategoryId}
        />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="label-eyebrow">Date</p>
          <GlassInput
            type="date"
            value={occurredDate}
            onChange={(e) => setOccurredDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="label-eyebrow">Time</p>
          <GlassInput
            type="time"
            value={occurredTime}
            onChange={(e) => setOccurredTime(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-2">
        <p className="label-eyebrow">Ownership</p>
        <div className="grid grid-cols-2 gap-2">
          {(["personal", "split"] as TransactionOwnership[]).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOwnership(o)}
              className={cn(
                "rounded-lg border py-3 text-sm font-medium transition",
                ownership === o
                  ? "border-primary/50 bg-primary/10"
                  : "border-hairline/70 hover:border-primary/30",
              )}
            >
              {o === "personal" ? "Personal" : "Shared"}
            </button>
          ))}
        </div>
      </section>

      {ownership === "split" ? (
        <section className="space-y-3 rounded-lg border border-hairline/50 p-3">
          <MemberSelector
            members={members}
            selected={selectedMembers}
            onToggle={(id) =>
              setSelectedMembers((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
            onCreate={onCreateMember}
            creating={creatingMember}
          />
          {selectedMembers.length > 0 ? (
            <SplitEditor
              amountMinor={total}
              currency={currency}
              members={members}
              selectedMemberIds={selectedMembers}
              mode={splitMode}
              customAmounts={customAmounts}
              onModeChange={setSplitMode}
              onCustomChange={setCustomAmounts}
            />
          ) : null}
        </section>
      ) : null}

      <section className="space-y-2">
        <p className="label-eyebrow">Notes</p>
        <textarea
          className="glass-panel min-h-[72px] w-full rounded-lg border border-hairline/70 bg-background/40 p-3 text-sm outline-none focus:border-primary/40"
          placeholder="Optional context"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <ReceiptField value={billUrl} onChange={setBillUrl} />
      </section>

      <GlassButton
        type="button"
        className="w-full"
        disabled={!canSubmit || creating}
        onClick={submit}
      >
        Save transaction
      </GlassButton>
    </div>
  );
}

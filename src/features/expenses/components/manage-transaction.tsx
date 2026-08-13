import { useMemo, useState } from "react";
import type {
  ExpenseCategory,
  ExpenseMember,
  ExpenseTransaction,
  SplitMode,
  TransactionOwnership,
} from "@/lib/api/expense-types";
import { formatMoney, splitEqualMinor } from "@/lib/money";
import { CategorySelector } from "./category-selector";
import { GlassButton } from "./glass";
import { MemberSelector } from "./member-selector";
import { ReceiptField } from "./receipt-field";
import { splitIsBalanced, SplitEditor } from "./split-editor";

type Step = "category" | "ownership" | "split" | "note" | "done";

export function ManageTransaction({
  transaction,
  categories,
  members,
  onSave,
  saving = false,
}: {
  transaction: ExpenseTransaction;
  categories: ExpenseCategory[];
  members: ExpenseMember[];
  onSave: (input: {
    categoryId: string;
    ownership: TransactionOwnership;
    splitMode?: SplitMode;
    splits?: { memberId: string; amountMinor: number }[];
    note?: string;
    billUrl?: string;
    markManaged: boolean;
  }) => void;
  saving?: boolean;
}) {
  const [step, setStep] = useState<Step>("category");
  const [categoryId, setCategoryId] = useState(
    transaction.categoryId ?? transaction.suggestedCategoryId ?? "",
  );
  const [ownership, setOwnership] = useState<TransactionOwnership>("personal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, number | null | undefined>>({});
  const [note, setNote] = useState(transaction.note ?? "");
  const [billUrl, setBillUrl] = useState(transaction.billUrl ?? "");

  const splitAmounts = useMemo(() => {
    if (ownership !== "split" || !selectedMembers.length) return [];
    if (splitMode === "equal")
      return splitEqualMinor(transaction.amountMinor, selectedMembers.length);
    return selectedMembers.map((id) => customAmounts[id] ?? 0);
  }, [ownership, selectedMembers, splitMode, customAmounts, transaction.amountMinor]);

  const canRecord =
    Boolean(categoryId) &&
    (ownership === "personal" ||
      (selectedMembers.length > 0 && splitIsBalanced(transaction.amountMinor, splitAmounts)));

  const record = () => {
    onSave({
      categoryId,
      ownership,
      ...(ownership === "split"
        ? {
            splitMode,
            splits: selectedMembers.map((memberId, i) => ({
              memberId,
              amountMinor: splitAmounts[i] ?? 0,
            })),
          }
        : {}),
      ...(note ? { note } : {}),
      ...(billUrl ? { billUrl } : {}),
      markManaged: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="display-lg font-mono tabular-nums">
          {formatMoney(transaction.amountMinor, transaction.currency)}
        </p>
        <p className="mt-1 text-lg text-muted-foreground">{transaction.merchant}</p>
      </div>

      {step === "category" && (
        <section className="animate-soft-in space-y-3">
          <p className="label-eyebrow">Category</p>
          <CategorySelector
            categories={categories}
            value={categoryId}
            {...(transaction.suggestedCategoryId
              ? { suggestedId: transaction.suggestedCategoryId }
              : {})}
            onChange={(id) => {
              setCategoryId(id);
              setStep("ownership");
            }}
          />
        </section>
      )}

      {step === "ownership" && (
        <section className="animate-soft-in space-y-3">
          <p className="label-eyebrow">Who was this for?</p>
          <div className="grid grid-cols-2 gap-2">
            {(["personal", "split"] as TransactionOwnership[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => {
                  setOwnership(o);
                  setStep(o === "split" ? "split" : "note");
                }}
                className="rounded-xl border border-hairline/70 py-4 text-sm font-medium transition hover:border-primary/30"
              >
                {o === "personal" ? "Just me" : "Split"}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "split" && ownership === "split" && (
        <section className="animate-soft-in space-y-4">
          <p className="label-eyebrow">Who was this with?</p>
          <MemberSelector
            members={members}
            selected={selectedMembers}
            onToggle={(id) =>
              setSelectedMembers((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
          />
          {selectedMembers.length > 0 && (
            <>
              <p className="label-eyebrow">Split method</p>
              <SplitEditor
                amountMinor={transaction.amountMinor}
                currency={transaction.currency}
                members={members}
                selectedMemberIds={selectedMembers}
                mode={splitMode}
                customAmounts={customAmounts}
                onModeChange={setSplitMode}
                onCustomChange={setCustomAmounts}
              />
              <GlassButton
                type="button"
                className="w-full"
                disabled={!splitIsBalanced(transaction.amountMinor, splitAmounts)}
                onClick={() => setStep("note")}
              >
                Continue
              </GlassButton>
            </>
          )}
        </section>
      )}

      {step === "note" && (
        <section className="animate-soft-in space-y-4">
          <p className="label-eyebrow">Add note (optional)</p>
          <textarea
            className="glass-panel min-h-[80px] w-full rounded-lg border border-hairline/70 bg-background/40 p-3 text-sm outline-none focus:border-primary/40"
            placeholder="Office lunch with team"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <ReceiptField value={billUrl} onChange={setBillUrl} />
          <GlassButton
            type="button"
            className="w-full"
            disabled={!canRecord || saving}
            onClick={record}
          >
            Record expense
          </GlassButton>
        </section>
      )}
    </div>
  );
}

import { useState } from "react";
import type {
  ExpenseCategory,
  ExpenseMember,
  SplitMode,
  TransactionOwnership,
} from "@/lib/api/expense-types";
import { splitEqualMinor } from "@/lib/money";
import { CategorySelector } from "./category-selector";
import { GlassButton, GlassInput } from "./glass";
import { MemberSelector } from "./member-selector";
import { MoneyInput } from "./money-input";
import { ReceiptField } from "./receipt-field";
import { splitIsBalanced, SplitEditor } from "./split-editor";

type Step = "amount" | "category" | "ownership" | "split" | "note";

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
  onCreate: (input: {
    merchant: string;
    amountMinor: number;
    currency: string;
    categoryId?: string;
    ownership: TransactionOwnership;
    splitMode?: SplitMode;
    splits?: { memberId: string; amountMinor: number }[];
    note?: string;
    billUrl?: string;
    status?: "managed";
  }) => void;
  creating?: boolean;
  onCreateMember: (name: string) => void;
  creatingMember?: boolean;
}) {
  const [step, setStep] = useState<Step>("amount");
  const [merchant, setMerchant] = useState("");
  const [amountMinor, setAmountMinor] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [ownership, setOwnership] = useState<TransactionOwnership>("personal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [billUrl, setBillUrl] = useState("");
  const currency = "INR";

  const total = amountMinor ?? 0;
  const splitAmounts =
    ownership === "split" && selectedMembers.length
      ? splitMode === "equal"
        ? splitEqualMinor(total, selectedMembers.length)
        : selectedMembers.map((id) => customAmounts[id] ?? 0)
      : [];

  const submit = () => {
    if (!merchant.trim() || !amountMinor) return;
    onCreate({
      merchant: merchant.trim(),
      amountMinor,
      currency,
      ...(categoryId ? { categoryId } : {}),
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
      status: "managed",
    });
  };

  return (
    <div className="space-y-6">
      {step === "amount" && (
        <section className="animate-soft-in space-y-4">
          <p className="label-eyebrow">Amount</p>
          <MoneyInput valueMinor={amountMinor} onChangeMinor={setAmountMinor} className="text-2xl font-mono" />
          <p className="label-eyebrow">Merchant</p>
          <GlassInput
            placeholder="Swiggy, Uber, Amazon…"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
          <GlassButton
            type="button"
            className="w-full"
            disabled={!merchant.trim() || !amountMinor}
            onClick={() => setStep("category")}
          >
            Continue
          </GlassButton>
        </section>
      )}

      {step === "category" && (
        <section className="animate-soft-in space-y-3">
          <p className="label-eyebrow">Category</p>
          <CategorySelector
            categories={categories}
            value={categoryId}
            onChange={(id) => {
              setCategoryId(id);
              setStep("ownership");
            }}
          />
          <GlassButton type="button" variant="ghost" onClick={() => setStep("ownership")}>
            Skip for now
          </GlassButton>
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
                className="rounded-xl border border-hairline/70 py-4 text-sm font-medium"
              >
                {o === "personal" ? "Just me" : "Split"}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "split" && (
        <section className="animate-soft-in space-y-4">
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
          {selectedMembers.length > 0 && (
            <>
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
              <GlassButton
                type="button"
                className="w-full"
                disabled={!splitIsBalanced(total, splitAmounts)}
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
          <textarea
            className="glass-panel min-h-[80px] w-full rounded-lg border border-hairline/70 p-3 text-sm"
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <ReceiptField value={billUrl} onChange={setBillUrl} />
          <GlassButton type="button" className="w-full" disabled={creating} onClick={submit}>
            Record transaction
          </GlassButton>
        </section>
      )}
    </div>
  );
}

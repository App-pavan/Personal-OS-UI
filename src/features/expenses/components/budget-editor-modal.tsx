import { AlertTriangle, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CreateCategoryDialog } from "./create-category-dialog";
import { GlassButton, GlassInput } from "./glass";
import { currentMonthKey, formatMonthLabel } from "../lib/budget-utils";
import type { ExpenseCategory } from "@/lib/api/expense-types";
import { formatMoney, inputToMinor, minorToInput } from "@/lib/money";
import { cn } from "@/lib/utils";

export function BudgetEditorModal({
  open,
  mode,
  month,
  currency = "INR",
  categories,
  initialTotalMinor = 0,
  initialLimits = {},
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  month: string;
  currency?: string;
  categories: ExpenseCategory[];
  initialTotalMinor?: number;
  initialLimits?: Record<string, string>;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: {
    totalAmountMinor: number;
    categoryLimits: { categoryId: string; limitMinor: number }[];
  }) => Promise<void>;
}) {
  const [totalInput, setTotalInput] = useState("");
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTotalInput(initialTotalMinor > 0 ? minorToInput(initialTotalMinor) : "");
    setLimits(initialLimits);
  }, [open, initialTotalMinor, initialLimits]);

  const activeCategories = useMemo(() => categories.filter((c) => !c.archived), [categories]);

  const totalMinor = inputToMinor(totalInput) ?? 0;
  const allocatedMinor = Object.values(limits)
    .map((v) => inputToMinor(v) ?? 0)
    .reduce((a, b) => a + b, 0);
  const unallocatedMinor = Math.max(0, totalMinor - allocatedMinor);
  const overAllocationMinor = Math.max(0, allocatedMinor - totalMinor);

  if (!open) return null;

  const monthLabel = formatMonthLabel(month);
  const shortMonth = monthLabel.split(" ")[0];
  const isCurrent = month === currentMonthKey();

  const submit = async () => {
    const categoryLimits = Object.entries(limits)
      .map(([categoryId, value]) => ({
        categoryId,
        limitMinor: inputToMinor(value) ?? 0,
      }))
      .filter((l) => l.limitMinor > 0);

    await onSave({ totalAmountMinor: totalMinor, categoryLimits });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-[#00092c]/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-editor-title"
          className="expense-modal-panel glass-panel flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-hairline sm:rounded-2xl"
        >
          <div className="border-b border-hairline px-5 py-4 md:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {mode === "create" ? "New budget" : "Edit budget"}
            </p>
            <h2 id="budget-editor-title" className="mt-1 text-lg font-semibold">
              {mode === "create" ? `Create ${shortMonth} budget` : `Edit ${monthLabel}`}
            </h2>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 md:px-6">
            <section>
              <p className="label-eyebrow">Month</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-hairline bg-[rgb(238_238_238/0.04)] px-4 py-3">
                <span className="text-sm font-medium">{monthLabel}</span>
                {isCurrent ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Current
                  </span>
                ) : null}
              </div>
            </section>

            <section>
              <p className="label-eyebrow">Monthly budget</p>
              <p className="mt-1 text-sm text-muted-foreground">
                How much do you want to spend this month?
              </p>
              <div className="relative mt-3">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <GlassInput
                  className="pl-8 font-mono text-lg"
                  inputMode="decimal"
                  placeholder="30,000"
                  value={totalInput}
                  onChange={(e) => setTotalInput(e.target.value.replace(/[^\d.]/g, ""))}
                  autoFocus
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label-eyebrow">Category budgets</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Optionally assign limits to categories.
                  </p>
                </div>
                <GlassButton
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateCategory(true)}
                >
                  <Plus className="size-4" /> Add category
                </GlassButton>
              </div>

              <div className="mt-4 space-y-2">
                {activeCategories.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-sm text-muted-foreground">
                    No categories yet. Add one to start allocating your budget.
                  </p>
                ) : (
                  activeCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 rounded-xl border border-hairline bg-[rgb(238_238_238/0.04)] px-3 py-2.5 transition hover:border-primary/20"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[rgb(238_238_238/0.06)] text-base">
                        {cat.icon ?? "📁"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {cat.name}
                      </span>
                      <div className="relative w-[140px] shrink-0">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ₹
                        </span>
                        <GlassInput
                          className="py-2 pl-6 font-mono text-sm"
                          inputMode="decimal"
                          placeholder="0"
                          value={limits[cat.id] ?? ""}
                          onChange={(e) =>
                            setLimits((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value.replace(/[^\d.]/g, ""),
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-hairline bg-[rgb(238_238_238/0.04)] p-4">
              <p className="label-eyebrow">Summary</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Monthly budget</dt>
                  <dd className="font-mono tabular-nums">{formatMoney(totalMinor, currency)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Allocated to categories</dt>
                  <dd className="font-mono tabular-nums">
                    {formatMoney(allocatedMinor, currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {overAllocationMinor > 0 ? "Over-allocated" : "Unallocated"}
                  </dt>
                  <dd
                    className={cn(
                      "font-mono tabular-nums",
                      overAllocationMinor > 0 ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {formatMoney(
                      overAllocationMinor > 0 ? overAllocationMinor : unallocatedMinor,
                      currency,
                    )}
                  </dd>
                </div>
              </dl>
              {overAllocationMinor > 0 ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  Category allocation exceeds monthly budget by{" "}
                  {formatMoney(overAllocationMinor, currency)}.
                </p>
              ) : null}
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-hairline px-5 py-4 md:px-6">
            <GlassButton type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </GlassButton>
            <GlassButton
              type="button"
              onClick={submit}
              disabled={saving || totalMinor <= 0}
              className="bg-primary text-primary-foreground hover:bg-[#ff7722]"
            >
              {mode === "create" ? "Create budget" : "Save changes"}
            </GlassButton>
          </div>
        </div>
      </div>

      <CreateCategoryDialog
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCreated={(id) => setLimits((prev) => ({ ...prev, [id]: prev[id] ?? "" }))}
      />
    </>
  );
}

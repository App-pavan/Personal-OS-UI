import { useMemo } from "react";
import type { ExpenseMember, SplitMode } from "@/lib/api/expense-types";
import { formatMoney, splitEqualMinor, sumMinor } from "@/lib/money";
import { cn } from "@/lib/utils";
import { MoneyInput } from "./money-input";

export function SplitEditor({
  amountMinor,
  currency,
  members,
  selectedMemberIds,
  mode,
  customAmounts,
  onModeChange,
  onCustomChange,
}: {
  amountMinor: number;
  currency: string;
  members: ExpenseMember[];
  selectedMemberIds: string[];
  mode: SplitMode;
  customAmounts: Record<string, number>;
  onModeChange: (mode: SplitMode) => void;
  onCustomChange: (amounts: Record<string, number>) => void;
}) {
  const rows = useMemo(() => {
    if (mode === "equal") {
      const shares = splitEqualMinor(amountMinor, selectedMemberIds.length || 1);
      return selectedMemberIds.map((id, i) => ({
        id,
        name: members.find((m) => m.id === id)?.name ?? "Member",
        amountMinor: shares[i] ?? 0,
      }));
    }
    return selectedMemberIds.map((id) => ({
      id,
      name: members.find((m) => m.id === id)?.name ?? "Member",
      amountMinor: customAmounts[id] ?? 0,
    }));
  }, [mode, amountMinor, selectedMemberIds, members, customAmounts]);

  const allocated = sumMinor(rows.map((r) => r.amountMinor));
  const remaining = amountMinor - allocated;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["equal", "custom"] as SplitMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={cn(
              "flex-1 rounded-lg border py-2 text-sm capitalize transition-all",
              mode === m
                ? "border-primary/40 bg-primary/15 font-medium text-primary"
                : "border-hairline/70 text-muted-foreground",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg border border-hairline/60 px-3 py-2">
            <span className="text-sm">{row.name}</span>
            {mode === "equal" ? (
              <span className="font-mono text-sm tabular-nums">{formatMoney(row.amountMinor, currency)}</span>
            ) : (
              <MoneyInput
                className="w-28 text-right font-mono"
                currency={currency}
                valueMinor={customAmounts[row.id] ?? null}
                onChangeMinor={(minor) =>
                  onCustomChange({ ...customAmounts, [row.id]: minor ?? 0 })
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono tabular-nums">{formatMoney(amountMinor, currency)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Remaining</span>
        <span
          className={cn(
            "font-mono tabular-nums",
            remaining === 0 ? "text-success" : "text-warning",
          )}
        >
          {formatMoney(remaining, currency)}
        </span>
      </div>
    </div>
  );
}

export function splitIsBalanced(amountMinor: number, amounts: number[]) {
  return sumMinor(amounts) === amountMinor;
}

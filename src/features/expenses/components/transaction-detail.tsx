import { Archive, Ban, CheckCircle2, RotateCcw, X } from "lucide-react";
import type { ExpenseCategory, ExpenseMember, ExpenseTransaction } from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatWhen, ownershipLabel, sourceLabel, statusLabel } from "../lib/labels";
import { GlassBadge, GlassButton } from "./glass";
import { ManageTransaction } from "./manage-transaction";

export function TransactionDetail({
  transaction,
  categories,
  members,
  open,
  onOpenChange,
  onUpdate,
  onIgnore,
  onUnignore,
  onArchive,
  updating,
}: {
  transaction: ExpenseTransaction | null;
  categories: ExpenseCategory[];
  members: ExpenseMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: Parameters<typeof ManageTransaction>[0]["onSave"];
  onIgnore: (id: string) => void;
  onUnignore: (id: string) => void;
  onArchive: (id: string) => void;
  updating?: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  if (!transaction) return null;

  const body = (
    <div className="space-y-6 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        <GlassBadge tone="primary">{statusLabel[transaction.status]}</GlassBadge>
        <GlassBadge tone="muted">{ownershipLabel[transaction.ownership]}</GlassBadge>
        <GlassBadge tone="info">{sourceLabel[transaction.source]}</GlassBadge>
      </div>

      {transaction.status === "pending" ? (
        <ManageTransaction
          transaction={transaction}
          categories={categories}
          members={members}
          onSave={(input) => onUpdate(input)}
          {...(updating ? { saving: updating } : {})}
        />
      ) : (
        <>
          <div>
            <p className="display-lg font-mono tabular-nums">
              {formatMoney(transaction.amountMinor, transaction.currency)}
            </p>
            <p className="mt-1 text-lg">{transaction.merchant}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatWhen(transaction.occurredAt)}
            </p>
          </div>
          {transaction.categoryName ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Category · </span>
              {transaction.categoryName}
            </p>
          ) : null}
          {transaction.note ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Note · </span>
              {transaction.note}
            </p>
          ) : null}
          {transaction.splits.length > 0 && (
            <div className="space-y-2">
              <p className="label-eyebrow">Split</p>
              {transaction.splits.map((s) => (
                <div key={s.memberId} className="flex justify-between text-sm">
                  <span>{s.memberName ?? "Member"}</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(s.amountMinor, transaction.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2 border-t border-hairline/60 pt-4">
        {transaction.status === "pending" && (
          <GlassButton variant="ghost" onClick={() => onIgnore(transaction.id)}>
            <Ban className="size-4" /> Ignore
          </GlassButton>
        )}
        {transaction.status === "ignored" && (
          <GlassButton variant="ghost" onClick={() => onUnignore(transaction.id)}>
            <RotateCcw className="size-4" /> Unignore
          </GlassButton>
        )}
        {transaction.status !== "archived" && (
          <GlassButton variant="ghost" onClick={() => onArchive(transaction.id)}>
            <Archive className="size-4" /> Archive
          </GlassButton>
        )}
        {transaction.status === "managed" && (
          <GlassBadge tone="success">
            <CheckCircle2 className="mr-1 size-3" /> Managed
          </GlassBadge>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[92vh] rounded-t-2xl border-hairline p-0">
          <SheetHeader className="border-b border-hairline/60 p-4">
            <SheetTitle>Transaction</SheetTitle>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-h-[90vh] max-w-lg border-hairline bg-background/95 backdrop-blur-xl">
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-hairline/60">
          <DrawerTitle>Transaction</DrawerTitle>
          <button type="button" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="size-4" />
          </button>
        </DrawerHeader>
        {body}
      </DrawerContent>
    </Drawer>
  );
}

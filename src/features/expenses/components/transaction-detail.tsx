import { Archive, Ban, CheckCircle2, Pencil, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { IconBadge } from "@/components/future";
import type {
  ExpenseCategory,
  ExpenseMember,
  ExpenseTransaction,
  TransactionPatchInput,
} from "@/lib/api/expense-types";
import { formatMoney } from "@/lib/money";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { displayCategoryLabel } from "../lib/category-resolve";
import { getCategoryMeta } from "../lib/category-meta";
import {
  directionIcon,
  directionLabel,
  formatWhenDetailed,
  ownershipLabel,
  ownershipTone,
  paymentMethodLabel,
  sourceLabel,
  sourceTone,
  statusLabel,
  statusTone,
  transactionDisplayName,
  transactionKindLabel,
} from "../lib/labels";
import type { ManageStep } from "../lib/manage-steps";
import { EditManualTransaction } from "./edit-manual-transaction";
import { GlassBadge, GlassButton } from "./glass";
import { DirectionChip } from "./transaction-chips";
import { ManageTransaction } from "./manage-transaction";
import { SourceSmsDisclosure } from "./source-sms-disclosure";

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
  manageStep,
  onPatch,
}: {
  transaction: ExpenseTransaction | null;
  categories: ExpenseCategory[];
  members: ExpenseMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: Parameters<typeof ManageTransaction>[0]["onSave"];
  onPatch?: (input: TransactionPatchInput) => void;
  onIgnore: (id: string) => void;
  onUnignore: (id: string) => void;
  onArchive: (id: string) => void;
  updating?: boolean;
  manageStep?: ManageStep;
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [editingManual, setEditingManual] = useState(false);
  if (!transaction) return null;

  const cat = getCategoryMeta(
    displayCategoryLabel(transaction, categories),
    transaction.categoryId ?? transaction.suggestedCategoryId,
  );
  const CatIcon = cat.icon;
  const title = transactionDisplayName(transaction);
  const canEditManual = transaction.source === "manual" && onPatch;

  const body = (
    <div className="space-y-6 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-wrap gap-2">
        <GlassBadge tone={statusTone[transaction.status]} dot>
          {statusLabel[transaction.status]}
        </GlassBadge>
        <GlassBadge tone={ownershipTone[transaction.ownership]}>
          {ownershipLabel[transaction.ownership]}
        </GlassBadge>
        <GlassBadge tone={sourceTone[transaction.source]} dot>
          {sourceLabel[transaction.source]}
        </GlassBadge>
        <DirectionChip direction={transaction.direction} />
      </div>

      <section className="space-y-2 rounded-lg border border-hairline/50 p-3 text-sm">
        <p className="label-eyebrow">Financial information</p>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-mono tabular-nums">
            {formatMoney(transaction.amountMinor, transaction.currency)}
          </span>
        </div>
        {transaction.direction && transaction.direction !== "unknown" ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Direction</span>
            <span>
              {directionIcon[transaction.direction]} {directionLabel[transaction.direction]}
            </span>
          </div>
        ) : null}
        {transaction.transactionKind ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Type</span>
            <span>{transactionKindLabel[transaction.transactionKind]}</span>
          </div>
        ) : null}
        {transaction.counterparty ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Recipient</span>
            <span>{transaction.counterparty}</span>
          </div>
        ) : null}
        {transaction.paymentMethod ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Payment method</span>
            <span>{paymentMethodLabel[transaction.paymentMethod]}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Source</span>
          <span>{sourceLabel[transaction.source]}</span>
        </div>
      </section>

      {canEditManual && editingManual ? (
        <EditManualTransaction
          transaction={transaction}
          categories={categories}
          members={members}
          saving={updating}
          onSave={(input) => {
            onPatch?.(input);
            setEditingManual(false);
          }}
        />
      ) : null}

      {transaction.status === "pending" ? (
        <ManageTransaction
          transaction={transaction}
          categories={categories}
          members={members}
          onSave={(input) => onUpdate(input)}
          {...(updating ? { saving: updating } : {})}
          {...(manageStep ? { initialStep: manageStep } : {})}
        />
      ) : (
        <>
          <div className="flex items-start gap-4">
            <IconBadge icon={CatIcon} tone={cat.tone} />
            <div>
              <p className="display-lg font-mono tabular-nums">
                {formatMoney(transaction.amountMinor, transaction.currency)}
              </p>
              <p className="mt-1 text-lg">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatWhenDetailed(transaction.occurredAt)}
              </p>
            </div>
          </div>
          {displayCategoryLabel(transaction, categories) !== "Uncategorised" ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Category · </span>
              {displayCategoryLabel(transaction, categories)}
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

      <SourceSmsDisclosure transaction={transaction} />

      <div className="flex flex-wrap gap-2 border-t border-hairline/60 pt-4">
        {canEditManual && !editingManual ? (
          <GlassButton variant="ghost" onClick={() => setEditingManual(true)}>
            <Pencil className="size-4" /> Edit
          </GlassButton>
        ) : null}
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
          <GlassButton variant="danger" onClick={() => onArchive(transaction.id)}>
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

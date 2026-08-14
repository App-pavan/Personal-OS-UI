import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ExpenseTransaction } from "@/lib/api/expense-types";
import { formatWhenDetailed } from "../lib/labels";
import { cn } from "@/lib/utils";

export function SourceSmsDisclosure({ transaction }: { transaction: ExpenseTransaction }) {
  const [open, setOpen] = useState(false);
  const sms = transaction.sms;
  if (transaction.source !== "sms" || !sms?.rawContent) return null;

  return (
    <section className="space-y-2 border-t border-hairline/60 pt-4">
      <p className="label-eyebrow">Original SMS</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-hairline/60 px-3 py-2 text-left text-sm transition hover:border-primary/30"
        aria-expanded={open}
      >
        <span className="text-muted-foreground">Show original message</span>
        <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="space-y-3 rounded-lg border border-hairline/50 bg-background/40 p-3 text-sm">
          <p className="whitespace-pre-wrap break-words leading-relaxed">{sms.rawContent}</p>
          {sms.sender ? (
            <p>
              <span className="text-muted-foreground">Sender · </span>
              {sms.sender}
            </p>
          ) : null}
          {sms.receivedAt ? (
            <p>
              <span className="text-muted-foreground">Received · </span>
              {formatWhenDetailed(sms.receivedAt)}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

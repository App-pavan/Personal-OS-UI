import { useState, type ReactNode } from "react";
import { Filter, X } from "lucide-react";
import type {
  TransactionOwnership,
  TransactionQuery,
  TransactionSource,
  TransactionStatus,
} from "@/lib/api/expense-types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GlassButton, GlassInput } from "./glass";

const statuses: TransactionStatus[] = ["pending", "managed", "ignored", "archived"];
const sources: TransactionSource[] = ["manual", "sms", "bank", "import", "ai", "ocr", "api"];
const ownerships: TransactionOwnership[] = ["personal", "split"];

export function ExpenseFilters({
  query,
  onChange,
  categories,
}: {
  query: TransactionQuery;
  onChange: (next: TransactionQuery) => void;
  categories: { id: string; name: string }[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = [
    query.status?.length,
    query.category,
    query.merchant,
    query.member,
    query.ownership,
    query.source,
    query.from,
    query.to,
    query.minAmount,
    query.maxAmount,
  ].filter(Boolean).length;

  const fields = (
    <FilterFields query={query} onChange={onChange} categories={categories} />
  );

  return (
    <>
      <div className="hidden flex-wrap items-end gap-2 lg:flex">{fields}</div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <GlassButton variant="ghost" className="lg:hidden">
            <Filter className="size-4" />
            Filters
            {activeCount > 0 ? (
              <span className="rounded-full bg-primary/20 px-1.5 text-xs">{activeCount}</span>
            ) : null}
          </GlassButton>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">{fields}</div>
          <GlassButton className="mt-6 w-full" onClick={() => setMobileOpen(false)}>
            Apply
          </GlassButton>
        </SheetContent>
      </Sheet>
    </>
  );
}

function FilterFields({
  query,
  onChange,
  categories,
}: {
  query: TransactionQuery;
  onChange: (next: TransactionQuery) => void;
  categories: { id: string; name: string }[];
}) {
  const merge = (patch: Partial<TransactionQuery>): TransactionQuery => {
    const next: TransactionQuery = { ...query, page: 1 };
    for (const [key, value] of Object.entries(patch) as [keyof TransactionQuery, unknown][]) {
      if (value === undefined) delete next[key];
      else (next as Record<string, unknown>)[key] = value;
    }
    return next;
  };

  return (
    <>
      <SelectField
        label="Status"
        value={query.status?.[0] ?? ""}
        options={[{ value: "", label: "All" }, ...statuses.map((s) => ({ value: s, label: s }))]}
        onChange={(v) => merge({ status: v ? [v as TransactionStatus] : undefined })}
      />
      <SelectField
        label="Category"
        value={query.category ?? ""}
        options={[
          { value: "", label: "All" },
          ...categories.map((c) => ({ value: c.id, label: c.name })),
        ]}
        onChange={(v) => merge({ category: v || undefined })}
      />
      <Field label="Merchant">
        <GlassInput
          placeholder="Merchant"
          value={query.merchant ?? ""}
          onChange={(e) => merge({ merchant: e.target.value || undefined })}
        />
      </Field>
      <SelectField
        label="Ownership"
        value={query.ownership ?? ""}
        options={[
          { value: "", label: "All" },
          ...ownerships.map((o) => ({ value: o, label: o })),
        ]}
        onChange={(v) => merge({ ownership: (v as TransactionOwnership) || undefined })}
      />
      <SelectField
        label="Source"
        value={query.source ?? ""}
        options={[{ value: "", label: "All" }, ...sources.map((s) => ({ value: s, label: s }))]}
        onChange={(v) => merge({ source: (v as TransactionSource) || undefined })}
      />
      <Field label="From">
        <GlassInput
          type="datetime-local"
          value={query.from ? query.from.slice(0, 16) : ""}
          onChange={(e) =>
            merge({ from: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </Field>
      <Field label="To">
        <GlassInput
          type="datetime-local"
          value={query.to ? query.to.slice(0, 16) : ""}
          onChange={(e) =>
            merge({ to: e.target.value ? new Date(e.target.value).toISOString() : undefined })
          }
        />
      </Field>
      <Field label="Min amount (minor)">
        <GlassInput
          type="number"
          value={query.minAmount ?? ""}
          onChange={(e) =>
            merge({ minAmount: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </Field>
      <Field label="Max amount (minor)">
        <GlassInput
          type="number"
          value={query.maxAmount ?? ""}
          onChange={(e) =>
            merge({ maxAmount: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </Field>
      {activeFilters(query) > 0 && (
        <GlassButton variant="ghost" onClick={() => onChange({ page: 1, limit: query.limit ?? 20 })}>
          <X className="size-4" /> Clear filters
        </GlassButton>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-[140px] flex-1 space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        className="glass-panel w-full rounded-lg border border-hairline/70 bg-background/40 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function activeFilters(query: TransactionQuery) {
  return [
    query.status?.length,
    query.category,
    query.merchant,
    query.ownership,
    query.source,
    query.from,
    query.to,
    query.minAmount,
    query.maxAmount,
  ].filter(Boolean).length;
}

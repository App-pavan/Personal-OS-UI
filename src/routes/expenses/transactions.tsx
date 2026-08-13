import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { ModuleHeader } from "@/components/os/primitives";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { CreateTransactionFlow } from "@/features/expenses/components/create-transaction";
import { ExpenseFilters } from "@/features/expenses/components/expense-filters";
import { GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { TransactionCard, TransactionRow } from "@/features/expenses/components/transaction-row";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import {
  useCategories,
  useDebounced,
  useMemberMutations,
  useMembers,
  useTransaction,
  useTransactionMutations,
  useTransactions,
} from "@/hooks/use-expenses";
import type { TransactionQuery } from "@/lib/api/expense-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/expenses/transactions")({
  head: () => ({ meta: [{ title: "Transactions — Personal OS" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [query, setQuery] = useState<TransactionQuery>({
    page: 1,
    limit: 20,
    sort: "occurredAt",
    order: "desc",
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const listQuery: TransactionQuery = {
    ...query,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };
  const list = useTransactions(listQuery);
  const categories = useCategories();
  const members = useMembers();
  const detail = useTransaction(selectedId);
  const m = useTransactionMutations();
  const memberM = useMemberMutations();

  const items = list.data?.items ?? [];
  const meta = list.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <>
      <ModuleHeader
        eyebrow="Expenses"
        title="Transactions"
        description="Everything you spend, captured in one place."
        actions={
          <GlassButton onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Add transaction
          </GlassButton>
        }
      />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <GlassInput
          placeholder="Search merchants…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ExpenseFilters query={query} onChange={setQuery} categories={categories.data ?? []} />

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : list.isLoading ? (
        <RowsSkeleton rows={8} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No transactions found"
          line={
            debouncedSearch
              ? "Try a different search or clear filters."
              : "Add your first expense to get started."
          }
          action={
            <GlassButton onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> Add transaction
            </GlassButton>
          }
        />
      ) : (
        <>
          <div className="glass-panel hidden overflow-hidden rounded-xl border border-hairline/60 md:block">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-hairline/60 px-4 py-2 text-[11px] text-muted-foreground">
              <span>Merchant</span>
              <span>Status</span>
              <span>Ownership</span>
              <span className="text-right">Amount</span>
            </div>
            {items.map((tx) => (
              <div key={tx.id} className="px-4">
                <TransactionRow transaction={tx} onClick={() => setSelectedId(tx.id)} />
              </div>
            ))}
          </div>
          <div className="space-y-2 md:hidden">
            {items.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} onClick={() => setSelectedId(tx.id)} />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Page {meta?.page ?? 1} of {totalPages} · {meta?.total ?? items.length} total
            </p>
            <div className="flex gap-2">
              <GlassButton
                variant="ghost"
                disabled={(query.page ?? 1) <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: Math.max(1, (q.page ?? 1) - 1) }))}
              >
                Previous
              </GlassButton>
              <GlassButton
                variant="ghost"
                disabled={(query.page ?? 1) >= totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
              >
                Next
              </GlassButton>
            </div>
          </div>
        </>
      )}

      <TransactionDetail
        transaction={detail.data ?? null}
        categories={categories.data ?? []}
        members={members.data ?? []}
        open={Boolean(selectedId)}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onUpdate={(input) =>
          selectedId &&
          m.update.mutate({ id: selectedId, input }, { onSuccess: () => setSelectedId(null) })
        }
        onIgnore={(id) => m.ignore.mutate(id)}
        onUnignore={(id) => m.unignore.mutate(id)}
        onArchive={(id) => {
          m.remove.mutate(id);
          setSelectedId(null);
        }}
        updating={m.update.isPending}
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>New transaction</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CreateTransactionFlow
              categories={categories.data ?? []}
              members={members.data ?? []}
              {...(m.create.isPending ? { creating: true } : {})}
              {...(memberM.create.isPending ? { creatingMember: true } : {})}
              onCreateMember={(name) => memberM.create.mutate({ name })}
              onCreate={(input) =>
                m.create.mutate(input, { onSuccess: () => setCreateOpen(false) })
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/future";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/os/state-views";
import { CreateTransactionFlow } from "@/features/expenses/components/create-transaction";
import { ExpenseFilters } from "@/features/expenses/components/expense-filters";
import { GlassButton, GlassInput } from "@/features/expenses/components/glass";
import { TransactionCard, TransactionRow } from "@/features/expenses/components/transaction-row";
import { TransactionDetail } from "@/features/expenses/components/transaction-detail";
import { useExpenseMonth } from "@/features/expenses/expense-month-context";
import { formatMonthLabel } from "@/features/expenses/lib/budget-utils";
import {
  collapseSmsDuplicates,
  resolveCanonicalTransactionId,
} from "@/features/expenses/lib/sms-duplicate-matcher";
import {
  useCategories,
  useDebounced,
  useMemberMutations,
  useMembers,
  useTransaction,
  useTransactionMutations,
  useTransactions,
} from "@/hooks/use-expenses";
import {
  useSmsDuplicateCleanup,
  useSmsDuplicateCleanupPool,
} from "@/hooks/use-sms-duplicate-cleanup";
import type { TransactionQuery } from "@/lib/api/expense-types";
import type { ManageStep } from "@/features/expenses/lib/manage-steps";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type TransactionsSearch = {
  category?: string;
  merchant?: string;
  month?: string;
};

export const Route = createFileRoute("/expenses/transactions")({
  validateSearch: (search: Record<string, unknown>): TransactionsSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    merchant: typeof search.merchant === "string" ? search.merchant : undefined,
    month: typeof search.month === "string" ? search.month : undefined,
  }),
  head: () => ({ meta: [{ title: "Transactions — Personal OS" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const searchParams = Route.useSearch();
  const { month, range } = useExpenseMonth();

  const [query, setQuery] = useState<TransactionQuery>({
    page: 1,
    limit: 20,
    sort: "occurredAt",
    order: "desc",
    from: range.from,
    to: range.to,
    ...(searchParams.category ? { category: searchParams.category } : {}),
    ...(searchParams.merchant ? { merchant: searchParams.merchant } : {}),
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manageStep, setManageStep] = useState<ManageStep | undefined>();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setQuery((q) => ({
      ...q,
      page: 1,
      from: range.from,
      to: range.to,
      ...(searchParams.category ? { category: searchParams.category } : {}),
      ...(searchParams.merchant ? { merchant: searchParams.merchant } : {}),
    }));
  }, [range.from, range.to, searchParams.category, searchParams.merchant]);

  useEffect(() => {
    setQuery((q) => {
      const next = { ...q, page: 1 };
      if (debouncedSearch) next.search = debouncedSearch;
      else delete next.search;
      return next;
    });
  }, [debouncedSearch]);

  const list = useTransactions(query);
  const cleanupQuery = useSmsDuplicateCleanupPool(month);
  const categories = useCategories();
  const members = useMembers();
  const detail = useTransaction(selectedId);
  const m = useTransactionMutations();
  const memberM = useMemberMutations();

  const cleanupPool = cleanupQuery.data?.items ?? [];
  useSmsDuplicateCleanup(cleanupPool);

  const items = useMemo(
    () => collapseSmsDuplicates(list.data?.items ?? []),
    [list.data?.items],
  );
  const meta = list.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const loading = list.isLoading || list.isFetching;

  const openEditor = (id: string, step?: ManageStep) => {
    const canonicalId = resolveCanonicalTransactionId(id, cleanupPool);
    setSelectedId(canonicalId);
    setManageStep(step);
  };

  const quickUpdate = (id: string, input: Parameters<typeof m.update.mutate>[0]["input"]) => {
    m.update.mutate({ id, input });
  };

  return (
    <>
      <SectionHeader
        system="Expense system"
        module="Module 02 / Transactions"
        title="Transaction command center"
        subtitle={formatMonthLabel(month)}
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
      ) : loading && !list.data ? (
        <RowsSkeleton rows={8} />
      ) : items.length === 0 ? (
        <EmptyState
          title={`No transactions for ${formatMonthLabel(month)}`}
          line={
            debouncedSearch
              ? "Try a different search or clear filters."
              : "Add your first expense for this month to get started."
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
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-hairline/60 px-4 py-2 text-[11px] text-muted-foreground">
              <span>Transaction</span>
              <span className="text-right">Amount & actions</span>
            </div>
            {items.map((tx) => (
              <div key={tx.id} className="px-3">
                <TransactionRow
                  transaction={tx}
                  categories={categories.data ?? []}
                  onClick={() => openEditor(tx.id)}
                  onQuickUpdate={(input) => quickUpdate(tx.id, input)}
                  onOpenEditor={(intent) =>
                    openEditor(tx.id, intent === "split" ? "split" : undefined)
                  }
                />
              </div>
            ))}
          </div>
          <div className="space-y-2 md:hidden">
            {items.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                categories={categories.data ?? []}
                onClick={() => openEditor(tx.id)}
                onQuickUpdate={(input) => quickUpdate(tx.id, input)}
                onOpenEditor={(intent) =>
                  openEditor(tx.id, intent === "split" ? "split" : undefined)
                }
              />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Page {meta?.page ?? query.page ?? 1} of {totalPages} · {meta?.total ?? items.length}{" "}
              total
            </p>
            <div className="flex gap-2">
              <GlassButton
                variant="ghost"
                disabled={(query.page ?? 1) <= 1 || list.isFetching}
                onClick={() => setQuery((q) => ({ ...q, page: Math.max(1, (q.page ?? 1) - 1) }))}
              >
                Previous
              </GlassButton>
              <GlassButton
                variant="ghost"
                disabled={(query.page ?? 1) >= totalPages || list.isFetching}
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
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setManageStep(undefined);
          }
        }}
        onUpdate={(input) =>
          selectedId &&
          m.update.mutate(
            { id: selectedId, input },
            {
              onSuccess: () => {
                setSelectedId(null);
                setManageStep(undefined);
              },
            },
          )
        }
        onPatch={(input) => selectedId && m.update.mutate({ id: selectedId, input })}
        manageStep={manageStep}
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { formatMonthLabel } from "@/features/expenses/lib/budget-utils";
import { expenseApi } from "@/lib/api/expense-service";
import { errorMessage } from "@/lib/api/errors";
import { PERM } from "@/lib/permissions";
import { toast } from "sonner";
import type {
  CreateBudgetInput,
  CreateCategoryInput,
  CreateMemberInput,
  ExpenseTransaction,
  TransactionPatchInput,
  TransactionQuery,
  TransactionWriteInput,
  UpdateBudgetInput,
  UpdateMemberInput,
} from "@/lib/api/expense-types";
import type { Paginated } from "@/lib/api/types";

/* Components never touch the service — only these hooks. */

export const expenseKeys = {
  all: ["expenses"] as const,
  transactions: ["expenses", "transactions"] as const,
  transactionList: (query: TransactionQuery) =>
    ["expenses", "transactions", "list", query] as const,
  transaction: (id: string) => ["expenses", "transactions", "detail", id] as const,
  categories: ["expenses", "categories"] as const,
  members: ["expenses", "members"] as const,
  budgets: ["expenses", "budgets"] as const,
  budget: (id: string) => ["expenses", "budgets", id] as const,
  budgetSummary: (id: string) => ["expenses", "budgets", "summary", id] as const,
  budgetAlerts: (month: string) => ["expenses", "budgets", "alerts", month] as const,
  dashboard: (month: string) => ["expenses", "insights", "dashboard", month] as const,
  monthlyInsights: (month: string) => ["expenses", "insights", "monthly", month] as const,
  categoryInsights: (month: string) => ["expenses", "insights", "categories", month] as const,
  merchantInsights: (month: string) => ["expenses", "insights", "merchants", month] as const,
  memberInsights: (month: string) => ["expenses", "insights", "members", month] as const,
  insights: ["expenses", "insights"] as const,
};

export function useTransactions(query: TransactionQuery = {}) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: expenseKeys.transactionList(query),
    queryFn: () => expenseApi.transactions.list(query),
    enabled: isReady && can(PERM.EXPENSES_TRANSACTIONS_VIEW),
    retry: 1,
    placeholderData: (previous) => previous,
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: expenseKeys.transaction(id ?? "none"),
    queryFn: () => expenseApi.transactions.get(id!),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useCategories() {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: expenseKeys.categories,
    queryFn: () => expenseApi.categories.list(),
    enabled: isReady && can(PERM.EXPENSES_TRANSACTIONS_VIEW),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useMembers() {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: expenseKeys.members,
    queryFn: () => expenseApi.members.list(),
    enabled: isReady && can(PERM.EXPENSES_TRANSACTIONS_VIEW),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useExpenseDashboard(month: string) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: expenseKeys.dashboard(month),
    queryFn: () => expenseApi.insights.dashboard(month),
    enabled: isReady && can(PERM.EXPENSES_TRANSACTIONS_VIEW),
    retry: 1,
  });
}

export function useBudgets() {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: expenseKeys.budgets,
    queryFn: () => expenseApi.budgets.list(),
    enabled: isReady && can(PERM.EXPENSES_BUDGETS_VIEW),
    retry: 1,
  });
}

export function useBudgetSummary(id: string | null) {
  return useQuery({
    queryKey: expenseKeys.budgetSummary(id ?? "none"),
    queryFn: () => expenseApi.budgets.summary(id!),
    enabled: Boolean(id),
    retry: 1,
  });
}

export function useBudgetMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: expenseKeys.budgets });
    qc.invalidateQueries({ queryKey: expenseKeys.insights });
  };
  return {
    create: useMutation({
      mutationFn: (input: CreateBudgetInput) => expenseApi.budgets.create(input),
      onSuccess: (_, input) => {
        invalidate();
        toast.success("Budget created", {
          description: `${formatMonthLabel(input.month)} budget is now active.`,
        });
      },
      onError: (error: unknown) =>
        toast.error(errorMessage(error, "The budget could not be saved.")),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; input: UpdateBudgetInput }) =>
        expenseApi.budgets.update(vars.id, vars.input),
      onSuccess: (_, vars) => {
        invalidate();
        qc.invalidateQueries({ queryKey: expenseKeys.budgetSummary(vars.id) });
        toast.success("Budget updated.");
      },
      onError: (error: unknown) =>
        toast.error(errorMessage(error, "The budget could not be updated.")),
    }),
  };
}

export function useMonthlyInsights(month: string) {
  return useQuery({
    queryKey: expenseKeys.monthlyInsights(month),
    queryFn: () => expenseApi.insights.monthly(month),
    retry: 1,
  });
}

export function useCategoryInsights(month: string) {
  return useQuery({
    queryKey: expenseKeys.categoryInsights(month),
    queryFn: () => expenseApi.insights.categories(month),
    retry: 1,
  });
}

export function useMerchantInsights(month: string) {
  const { from, to } = monthIsoRange(month);
  return useQuery({
    queryKey: expenseKeys.merchantInsights(month),
    queryFn: () => expenseApi.insights.merchants(10, from, to),
    retry: 1,
  });
}

export function useMemberInsights(month: string) {
  const { from, to } = monthIsoRange(month);
  return useQuery({
    queryKey: expenseKeys.memberInsights(month),
    queryFn: () => expenseApi.insights.members(from, to),
    retry: 1,
  });
}

function monthIsoRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { from: start.toISOString(), to: end.toISOString() };
}

export function useBudgetAlerts(month: string) {
  return useQuery({
    queryKey: expenseKeys.budgetAlerts(month),
    queryFn: () => expenseApi.budgets.alerts(month),
    retry: 1,
  });
}

/** Debounce for search inputs so typing doesn't hammer the API. */
export function useDebounced<T>(value: T, delay = 320): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useTransactionMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: expenseKeys.transactions });
    qc.invalidateQueries({ queryKey: expenseKeys.insights });
    qc.invalidateQueries({ queryKey: expenseKeys.budgets });
  };
  const fail = (fallback: string) => (error: unknown) => toast.error(errorMessage(error, fallback));

  /** Ignore/unignore are safe to flip optimistically; money edits are not. */
  const optimisticStatus = (id: string, status: ExpenseTransaction["status"]) => {
    const snapshot = qc.getQueriesData<Paginated<ExpenseTransaction>>({
      queryKey: expenseKeys.transactions,
    });
    qc.setQueriesData<Paginated<ExpenseTransaction>>(
      { queryKey: expenseKeys.transactions },
      (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => (item.id === id ? { ...item, status } : item)),
            }
          : current,
    );
    return snapshot;
  };

  return {
    create: useMutation({
      mutationFn: (input: TransactionWriteInput) => expenseApi.transactions.create(input),
      onSuccess: () => {
        invalidate();
        toast.success("Expense recorded.");
      },
      onError: fail("The expense could not be recorded."),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; input: TransactionPatchInput }) =>
        expenseApi.transactions.update(vars.id, vars.input),
      onSuccess: (transaction) => {
        invalidate();
        qc.setQueryData(expenseKeys.transaction(transaction.id), transaction);
      },
      onError: fail("Changes could not be saved."),
    }),
    remove: useMutation({
      mutationFn: (id: string) => expenseApi.transactions.remove(id),
      onSuccess: () => {
        invalidate();
        toast.success("Transaction deleted.");
      },
      onError: fail("The transaction could not be deleted."),
    }),
    ignore: useMutation({
      mutationFn: (id: string) => expenseApi.transactions.ignore(id),
      onMutate: (id: string) => ({ snapshot: optimisticStatus(id, "ignored") }),
      onError: (error, _id, context) => {
        context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
        fail("The transaction could not be ignored.")(error);
      },
      onSuccess: invalidate,
    }),
    unignore: useMutation({
      mutationFn: (id: string) => expenseApi.transactions.unignore(id),
      onMutate: (id: string) => ({ snapshot: optimisticStatus(id, "pending") }),
      onError: (error, _id, context) => {
        context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
        fail("The transaction could not be restored.")(error);
      },
      onSuccess: invalidate,
    }),
  };
}

export function useCategoryMutations() {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (input: CreateCategoryInput) => expenseApi.categories.create(input),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: expenseKeys.categories });
        toast.success("Category added.");
      },
      onError: (error: unknown) =>
        toast.error(errorMessage(error, "The category could not be created.")),
    }),
  };
}

export function useMemberMutations() {
  const qc = useQueryClient();
  const done = (message: string) => () => {
    qc.invalidateQueries({ queryKey: expenseKeys.members });
    toast.success(message);
  };
  return {
    create: useMutation({
      mutationFn: (input: CreateMemberInput) => expenseApi.members.create(input),
      onSuccess: done("Member added."),
      onError: (error: unknown) =>
        toast.error(errorMessage(error, "The member could not be created.")),
    }),
    update: useMutation({
      mutationFn: (vars: { id: string; input: UpdateMemberInput }) =>
        expenseApi.members.update(vars.id, vars.input),
      onSuccess: done("Member updated."),
      onError: (error: unknown) =>
        toast.error(errorMessage(error, "The member could not be updated.")),
    }),
  };
}

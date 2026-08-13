import type { ExpenseTransaction } from "@/lib/api/expense-types";

export type ManageStep = "category" | "ownership" | "split" | "note" | "done";

/** First wizard step based on what the transaction already has assigned. */
export function initialManageStep(transaction: ExpenseTransaction): ManageStep {
  const hasCategory = Boolean(transaction.categoryId ?? transaction.suggestedCategoryId);
  if (!hasCategory) return "category";
  return "ownership";
}

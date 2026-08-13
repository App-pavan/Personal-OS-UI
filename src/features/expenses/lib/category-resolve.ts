import type { ExpenseCategory, ExpenseTransaction } from "@/lib/api/expense-types";

/** Effective category id: assigned first, then merchant-learned suggestion. */
export function effectiveCategoryId(tx: ExpenseTransaction): string | undefined {
  if (tx.categoryId) return tx.categoryId;
  if (tx.suggestedCategoryId) return tx.suggestedCategoryId;
  return undefined;
}

export function resolveCategoryName(
  tx: ExpenseTransaction,
  categories: ExpenseCategory[],
): string | undefined {
  const id = effectiveCategoryId(tx);
  if (!id) return undefined;
  const fromList = categories.find((c) => c.id === id)?.name;
  if (fromList) return fromList;
  if (tx.categoryId === id && tx.categoryName) return tx.categoryName;
  return undefined;
}

export function displayCategoryLabel(
  tx: ExpenseTransaction,
  categories: ExpenseCategory[],
): string {
  return resolveCategoryName(tx, categories) ?? "Uncategorised";
}

export function hasKnownCategory(tx: ExpenseTransaction, categories: ExpenseCategory[]): boolean {
  return resolveCategoryName(tx, categories) !== undefined;
}

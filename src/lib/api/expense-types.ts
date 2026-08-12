/* ---------------------------------------------------------------
 * Expense module DTOs — mirrors /api/v1/expenses exactly.
 * Money is always { amountMinor, currency }. Nothing invented.
 * ------------------------------------------------------------- */

export type TransactionStatus = "pending" | "managed" | "ignored" | "archived";
export type TransactionSource = "manual" | "sms" | "bank" | "import" | "ai" | "ocr" | "api";
export type TransactionOwnership = "personal" | "split";
export type SplitMode = "equal" | "custom";

export const TRANSACTION_STATUSES: TransactionStatus[] = [
  "pending",
  "managed",
  "ignored",
  "archived",
];

export const TRANSACTION_SOURCES: TransactionSource[] = [
  "manual",
  "sms",
  "bank",
  "import",
  "ai",
  "ocr",
  "api",
];

export type ExpenseCategory = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  archived?: boolean;
};

export type ExpenseMember = {
  id: string;
  name: string;
  avatarColor?: string;
  archived?: boolean;
};

export type TransactionSplitShare = {
  memberId: string;
  memberName?: string;
  amountMinor: number;
};

export type ExpenseTransaction = {
  id: string;
  merchant: string;
  merchantNormalized?: string;
  amountMinor: number;
  currency: string;
  occurredAt: string;
  status: TransactionStatus;
  source: TransactionSource;
  ownership: TransactionOwnership;
  categoryId?: string;
  suggestedCategoryId?: string;
  categoryName?: string;
  note?: string;
  billUrl?: string;
  splitMode?: SplitMode;
  splits: TransactionSplitShare[];
  createdAt?: string;
  updatedAt?: string;
};

export type TransactionSort =
  | "occurredAt"
  | "amountMinor"
  | "merchant"
  | "createdAt"
  | "status";

export type TransactionQuery = {
  status?: TransactionStatus[];
  category?: string;
  merchant?: string;
  member?: string;
  ownership?: TransactionOwnership;
  source?: TransactionSource;
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: TransactionSort;
  order?: "asc" | "desc";
};

export type TransactionWriteInput = {
  merchant: string;
  amountMinor: number;
  currency: string;
  occurredAt?: string;
  categoryId?: string;
  ownership?: TransactionOwnership;
  splitMode?: SplitMode;
  splits?: { memberId: string; amountMinor: number }[];
  note?: string;
  billUrl?: string;
  status?: TransactionStatus;
  source?: TransactionSource;
};

export type TransactionPatchInput = Partial<TransactionWriteInput> & {
  markManaged?: boolean;
};

export type CreateCategoryInput = { name: string; icon?: string; color?: string };
export type CreateMemberInput = { name: string; avatarColor?: string };
export type UpdateMemberInput = { name?: string; archive?: boolean };

/* Phase 3 — budgets & insights (server-computed) */

export type BudgetStatus = "SAFE" | "WARNING" | "NEAR_LIMIT" | "EXCEEDED";

export type CategoryBudgetLimit = {
  categoryId: string;
  limitMinor: number;
};

export type ExpenseBudget = {
  id: string;
  month: string;
  currency: string;
  totalAmountMinor: number;
  categoryLimits: CategoryBudgetLimit[];
};

export type CategoryBudgetView = {
  categoryId: string;
  categoryName: string;
  limitMinor: number;
  spentMinor: number;
  remainingMinor: number;
  usagePercent: number;
  status: BudgetStatus;
  transactionCount?: number;
};

export type BudgetSummary = {
  budget: ExpenseBudget;
  spentMinor: number;
  remainingMinor: number;
  usagePercent: number;
  status: BudgetStatus;
  transactionCount: number;
  categoryBudgets: CategoryBudgetView[];
};

export type BudgetAlert = {
  message: string;
  thresholdPercent: number;
  categoryName?: string;
  spentMinor: number;
  limitMinor: number;
  status: BudgetStatus;
};

export type CategoryAnalyticsRow = {
  categoryId: string;
  categoryName: string;
  amountMinor: number;
  percentage: number;
  transactionCount: number;
  budgetLimitMinor?: number;
  budgetSpentMinor?: number;
  budgetRemainingMinor?: number;
  budgetUsagePercent?: number;
  budgetStatus?: BudgetStatus;
};

export type DailySpendingRow = {
  date: string;
  amountMinor: number;
  transactionCount: number;
};

export type ExpenseDashboard = {
  month: string;
  currency: string;
  totalSpentMinor: number;
  budgetTotalMinor?: number;
  budgetRemainingMinor?: number;
  budgetUsagePercent?: number;
  budgetStatus?: BudgetStatus;
  topCategories: CategoryAnalyticsRow[];
  recentTransactions: ExpenseTransaction[];
  weeklyTrend: DailySpendingRow[];
  budgetAlerts: BudgetAlert[];
  transactionCount: number;
};

export type MonthlySummary = {
  month: string;
  currency: string;
  totalSpentMinor: number;
  personalSpentMinor: number;
  sharedSpentMinor: number;
  transactionCount: number;
  monthlyBudgetMinor?: number;
  budgetSpentMinor?: number;
  budgetRemainingMinor?: number;
  budgetUsagePercent?: number;
  averageTransactionMinor?: number;
  previousMonthSpentMinor?: number;
  changePercent?: number | null;
};

export type CreateBudgetInput = {
  month: string;
  currency?: string;
  totalAmountMinor: number;
  categoryLimits?: CategoryBudgetLimit[];
};

export type UpdateBudgetInput = {
  totalAmountMinor?: number;
  currency?: string;
  categoryLimits?: CategoryBudgetLimit[];
};

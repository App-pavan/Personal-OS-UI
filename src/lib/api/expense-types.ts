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
export type UpdateMemberInput = { name?: string; archived?: boolean };

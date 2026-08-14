import { api } from "./client";
import { normalizePaginationMeta } from "./pagination";
import type { PaginationMeta, Paginated } from "./types";
import type {
  BudgetAlert,
  BudgetSummary,
  CategoryAnalyticsRow,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateMemberInput,
  DailySpendingRow,
  ExpenseBudget,
  ExpenseCategory,
  ExpenseDashboard,
  ExpenseMember,
  ExpenseTransaction,
  MonthlySummary,
  TransactionPatchInput,
  TransactionQuery,
  TransactionDirection,
  TransactionSmsSource,
  TransactionSource,
  TransactionStatus,
  TransactionWriteInput,
  UpdateBudgetInput,
  UpdateMemberInput,
} from "./expense-types";

/* ---------------------------------------------------------------
 * Expense service boundary: /api/v1/expenses/*
 * UI -> hooks -> this service -> shared authenticated api client.
 * Nothing here invents endpoints the backend doesn't expose.
 * ------------------------------------------------------------- */

type Raw = Record<string, unknown>;

const str = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const num = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

const pick = (raw: Raw, keys: string[]): unknown => {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const asRaw = (value: unknown): Raw => (value && typeof value === "object" ? (value as Raw) : {});

const asList = (value: unknown): Raw[] => (Array.isArray(value) ? value.map(asRaw) : []);

/** Backends differ on `id` vs `_id`; both are accepted. */
const idOf = (raw: Raw) => str(pick(raw, ["id", "_id", "ID"]));

function normalizeDirection(raw: Raw, detection: Raw): TransactionDirection | undefined {
  const direct = str(pick(raw, ["direction"]));
  if (direct === "debit" || direct === "credit" || direct === "unknown") return direct;
  const fromDetection = str(pick(detection, ["transactionType", "transaction_type"]));
  if (fromDetection === "debit" || fromDetection === "credit") return fromDetection;
  return undefined;
}

function normalizeSms(raw: Raw): TransactionSmsSource | undefined {
  const content = str(pick(raw, ["rawContent", "raw_content", "body"]));
  if (!content) return undefined;
  return {
    ...(str(pick(raw, ["id", "_id"])) ? { id: str(pick(raw, ["id", "_id"])) } : {}),
    rawContent: content,
    ...(str(pick(raw, ["sender"])) ? { sender: str(pick(raw, ["sender"])) } : {}),
    ...(str(pick(raw, ["receivedAt", "received_at"]))
      ? { receivedAt: str(pick(raw, ["receivedAt", "received_at"])) }
      : {}),
    ...(str(pick(raw, ["classification"]))
      ? { classification: str(pick(raw, ["classification"])) }
      : {}),
  };
}

function normalizeTransaction(input: unknown): ExpenseTransaction {
  const raw = asRaw(input);
  const detection = asRaw(pick(raw, ["detection"]));
  const category = asRaw(pick(raw, ["category"]));
  const sms = normalizeSms(asRaw(pick(raw, ["sms"])));
  const direction = normalizeDirection(raw, detection);
  const categoryId = str(pick(raw, ["categoryId", "category_id"]) ?? idOf(category));
  const suggestedCategoryId = str(pick(raw, ["suggestedCategoryId", "suggested_category_id"]));
  const categoryName = str(pick(category, ["name", "title"]) ?? pick(raw, ["categoryName"]));
  const merchantObj = asRaw(pick(raw, ["merchant"]));
  const merchantRaw = str(
    pick(merchantObj, ["normalizedName", "rawName", "name"]) ??
      pick(raw, ["merchant", "merchantName", "payee", "title"]),
    "Unknown merchant",
  );
  const merchantNormalized = str(pick(merchantObj, ["normalizedName"]));
  const splitObj = asRaw(pick(raw, ["split"]));
  const splitsRaw = asList(
    pick(splitObj, ["allocations"]) ?? pick(raw, ["splits", "shares", "splitShares"]),
  );
  const status = str(pick(raw, ["status"]), "pending") as TransactionStatus;
  const source = str(pick(raw, ["source"]), "manual") as TransactionSource;
  const ownership = str(pick(raw, ["ownership"]), "personal") === "split" ? "split" : "personal";
  const note = str(pick(raw, ["note", "notes", "description"]));
  const bill = asRaw(pick(raw, ["bill"]));
  const billUrl = str(
    pick(bill, ["storageKey", "attachmentId"]) ?? pick(raw, ["billUrl", "receiptUrl"]),
  );
  const splitMode = str(pick(splitObj, ["mode"]) ?? pick(raw, ["splitMode", "split_mode"]));

  return {
    id: idOf(raw),
    merchant: merchantRaw,
    amountMinor: num(pick(raw, ["amountMinor", "amount_minor", "amount"])),
    currency: str(pick(raw, ["currency"]), "INR").toUpperCase(),
    occurredAt: str(
      pick(raw, [
        "transactionDate",
        "occurredAt",
        "occurred_at",
        "date",
        "transactedAt",
        "createdAt",
      ]),
      new Date().toISOString(),
    ),
    status,
    source,
    ownership,
    splits: splitsRaw.map((share) => {
      const member = asRaw(pick(share, ["member"]));
      const memberName = str(pick(share, ["memberName"]) ?? pick(member, ["name"]));
      return {
        memberId: str(pick(share, ["memberId", "member_id"]) ?? idOf(member)),
        amountMinor: num(pick(share, ["amountMinor", "amount_minor", "amount"])),
        ...(memberName ? { memberName } : {}),
      };
    }),
    ...(merchantNormalized ? { merchantNormalized } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(suggestedCategoryId ? { suggestedCategoryId } : {}),
    ...(categoryName ? { categoryName } : {}),
    ...(note ? { note } : {}),
    ...(billUrl ? { billUrl } : {}),
    ...(splitMode === "custom" || splitMode === "equal"
      ? { splitMode: splitMode as "custom" | "equal" }
      : {}),
    ...(direction ? { direction } : {}),
    ...(sms ? { sms } : {}),
    ...(str(pick(raw, ["createdAt"])) ? { createdAt: str(pick(raw, ["createdAt"])) } : {}),
    ...(str(pick(raw, ["updatedAt"])) ? { updatedAt: str(pick(raw, ["updatedAt"])) } : {}),
  };
}

function normalizeCategory(input: unknown): ExpenseCategory {
  const raw = asRaw(input);
  const icon = str(pick(raw, ["icon", "iconName", "emoji"]));
  const color = str(pick(raw, ["color", "accent", "colour"]));
  return {
    id: idOf(raw),
    name: str(pick(raw, ["name", "title"]), "Uncategorised"),
    ...(icon ? { icon } : {}),
    ...(color ? { color } : {}),
    ...(pick(raw, ["archived", "isArchived"]) !== undefined
      ? { archived: Boolean(pick(raw, ["archived", "isArchived"])) }
      : {}),
  };
}

function normalizeMember(input: unknown): ExpenseMember {
  const raw = asRaw(input);
  const avatarColor = str(pick(raw, ["avatarColor", "color"]));
  return {
    id: idOf(raw),
    name: str(pick(raw, ["name", "displayName"]), "Member"),
    ...(avatarColor ? { avatarColor } : {}),
    ...(pick(raw, ["archived", "isArchived"]) !== undefined
      ? { archived: Boolean(pick(raw, ["archived", "isArchived"])) }
      : {}),
  };
}

/** Lists may come back bare, enveloped, or wrapped in `items`. */
function listOf(data: unknown): Raw[] {
  if (Array.isArray(data)) return data.map(asRaw);
  const raw = asRaw(data);
  for (const key of ["items", "transactions", "categories", "members", "results", "data"]) {
    const value = raw[key];
    if (Array.isArray(value)) return value.map(asRaw);
  }
  return [];
}

function queryParams(query: TransactionQuery): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {};
  if (query.status?.length) params["status"] = query.status[0];
  if (query.category) params["category"] = query.category;
  if (query.merchant) params["merchant"] = query.merchant;
  if (query.member) params["member"] = query.member;
  if (query.ownership) params["ownership"] = query.ownership;
  if (query.source) params["source"] = query.source;
  if (query.from) params["from"] = query.from;
  if (query.to) params["to"] = query.to;
  if (query.minAmount !== undefined) params["minAmount"] = query.minAmount;
  if (query.maxAmount !== undefined) params["maxAmount"] = query.maxAmount;
  if (query.search) params["search"] = query.search;
  if (query.page) params["page"] = query.page;
  if (query.limit) params["limit"] = query.limit;
  if (query.sort) {
    params["sort"] = query.sort === "occurredAt" ? "transactionDate" : query.sort;
  }
  if (query.order) params["order"] = query.order;
  return params;
}

function writeBody(input: TransactionWriteInput | TransactionPatchInput): Raw {
  const body: Raw = {};
  if (input.merchant !== undefined)
    body["merchant"] = { rawName: input.merchant, normalizedName: input.merchant };
  if (input.amountMinor !== undefined) body["amountMinor"] = Math.trunc(input.amountMinor);
  if (input.currency !== undefined) body["currency"] = input.currency;
  if (input.occurredAt !== undefined) body["transactionDate"] = input.occurredAt;
  if (input.categoryId !== undefined) body["categoryId"] = input.categoryId;
  if (input.ownership !== undefined) body["ownership"] = input.ownership;
  if (input.splitMode !== undefined && input.splits !== undefined) {
    body["split"] = {
      mode: input.splitMode,
      allocations: input.splits.map((share) => ({
        memberId: share.memberId,
        amountMinor: Math.trunc(share.amountMinor),
      })),
    };
  } else if (input.ownership === "personal") {
    body["split"] = null;
  }
  if (input.note !== undefined) body["note"] = input.note;
  if (input.billUrl !== undefined)
    body["bill"] = input.billUrl ? { storageKey: input.billUrl } : null;
  if (input.status !== undefined) body["status"] = input.status;
  if (input.source !== undefined) body["source"] = input.source;
  if ("markManaged" in input && input.markManaged) body["markManaged"] = true;
  return body;
}

const BASE = "/expenses";

export const expenseApi = {
  transactions: {
    async list(query: TransactionQuery = {}): Promise<Paginated<ExpenseTransaction>> {
      const res = await api.get<unknown>(
        `${BASE}/transactions`,
        queryParams(query) as Record<string, string | number>,
      );
      const items = listOf(res.data).map(normalizeTransaction);
      const meta: PaginationMeta = normalizePaginationMeta(res.meta, {
        page: query.page ?? 1,
        perPage: query.limit ?? 20,
        total: items.length,
        totalPages: 1,
      });
      return { items, meta };
    },
    async get(id: string) {
      return normalizeTransaction((await api.get<unknown>(`${BASE}/transactions/${id}`)).data);
    },
    async create(input: TransactionWriteInput) {
      return normalizeTransaction(
        (await api.post<unknown>(`${BASE}/transactions`, writeBody(input))).data,
      );
    },
    async update(id: string, input: TransactionPatchInput) {
      return normalizeTransaction(
        (await api.patch<unknown>(`${BASE}/transactions/${id}`, writeBody(input))).data,
      );
    },
    async remove(id: string) {
      await api.delete<null>(`${BASE}/transactions/${id}`);
    },
    async ignore(id: string) {
      return normalizeTransaction(
        (await api.post<unknown>(`${BASE}/transactions/${id}/ignore`)).data,
      );
    },
    async unignore(id: string) {
      return normalizeTransaction(
        (await api.post<unknown>(`${BASE}/transactions/${id}/unignore`)).data,
      );
    },
  },
  categories: {
    async list(): Promise<ExpenseCategory[]> {
      return listOf((await api.get<unknown>(`${BASE}/categories`)).data).map(normalizeCategory);
    },
    async create(input: CreateCategoryInput) {
      return normalizeCategory((await api.post<unknown>(`${BASE}/categories`, input)).data);
    },
  },
  members: {
    async list(): Promise<ExpenseMember[]> {
      return listOf((await api.get<unknown>(`${BASE}/members`)).data).map(normalizeMember);
    },
    async create(input: CreateMemberInput) {
      return normalizeMember((await api.post<unknown>(`${BASE}/members`, input)).data);
    },
    async update(id: string, input: UpdateMemberInput) {
      return normalizeMember((await api.patch<unknown>(`${BASE}/members/${id}`, input)).data);
    },
  },
  budgets: {
    async list(): Promise<ExpenseBudget[]> {
      return listOf((await api.get<unknown>(`${BASE}/budgets`)).data).map(normalizeBudget);
    },
    async get(id: string) {
      return normalizeBudget((await api.get<unknown>(`${BASE}/budgets/${id}`)).data);
    },
    async create(input: CreateBudgetInput) {
      return normalizeBudget((await api.post<unknown>(`${BASE}/budgets`, input)).data);
    },
    async update(id: string, input: UpdateBudgetInput) {
      return normalizeBudget((await api.patch<unknown>(`${BASE}/budgets/${id}`, input)).data);
    },
    async remove(id: string) {
      await api.delete<null>(`${BASE}/budgets/${id}`);
    },
    async summary(id: string) {
      return normalizeBudgetSummary((await api.get<unknown>(`${BASE}/budgets/${id}/summary`)).data);
    },
    async alerts(month?: string) {
      const params = month ? { month } : undefined;
      return listOf((await api.get<unknown>(`${BASE}/budgets/alerts`, params)).data).map(
        normalizeBudgetAlert,
      );
    },
  },
  insights: {
    async dashboard(month?: string): Promise<ExpenseDashboard> {
      const params = month ? { month } : undefined;
      return normalizeDashboard(
        (await api.get<unknown>(`${BASE}/insights/dashboard`, params)).data,
      );
    },
    async monthly(month?: string, currency = "INR"): Promise<MonthlySummary> {
      return normalizeMonthly(
        (await api.get<unknown>(`${BASE}/insights/monthly`, { month, currency })).data,
      );
    },
    async weekly(currency = "INR"): Promise<DailySpendingRow[]> {
      return listOf((await api.get<unknown>(`${BASE}/insights/weekly`, { currency })).data).map(
        normalizeDailySpending,
      );
    },
    async daily(from: string, to: string, currency = "INR"): Promise<DailySpendingRow[]> {
      return listOf(
        (await api.get<unknown>(`${BASE}/insights/daily`, { from, to, currency })).data,
      ).map(normalizeDailySpending);
    },
    async categories(month?: string): Promise<CategoryAnalyticsRow[]> {
      const params = month ? { month } : undefined;
      return listOf((await api.get<unknown>(`${BASE}/insights/categories`, params)).data).map(
        normalizeCategoryAnalytics,
      );
    },
    async merchants(
      limit = 8,
      from?: string,
      to?: string,
    ): Promise<import("./expense-types").MerchantAnalyticsRow[]> {
      const params: Record<string, string | number> = { limit };
      if (from) params.from = from;
      if (to) params.to = to;
      return listOf((await api.get<unknown>(`${BASE}/insights/merchants`, params)).data).map(
        normalizeMerchantAnalytics,
      );
    },
    async members(
      from?: string,
      to?: string,
    ): Promise<import("./expense-types").MemberAnalyticsRow[]> {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      return listOf((await api.get<unknown>(`${BASE}/insights/members`, params)).data).map(
        normalizeMemberAnalytics,
      );
    },
  },
};

function normalizeBudget(raw: Raw): ExpenseBudget {
  const limits = asList(pick(raw, ["categoryLimits"])).map((l) => ({
    categoryId: str(pick(l, ["categoryId"])),
    limitMinor: num(pick(l, ["limitMinor"])),
  }));
  return {
    id: idOf(raw),
    month: str(pick(raw, ["month"])),
    currency: str(pick(raw, ["currency"]), "INR"),
    totalAmountMinor: num(pick(raw, ["totalAmountMinor"])),
    categoryLimits: limits,
  };
}

function normalizeBudgetSummary(raw: Raw): BudgetSummary {
  const budget = normalizeBudget(asRaw(pick(raw, ["budget"])));
  const cats = asList(pick(raw, ["categoryBudgets"])).map(normalizeCategoryBudgetView);
  return {
    budget,
    spentMinor: num(pick(raw, ["spentMinor"])),
    remainingMinor: num(pick(raw, ["remainingMinor"])),
    usagePercent: Number(pick(raw, ["usagePercent"]) ?? 0),
    status: str(pick(raw, ["status"]), "SAFE") as BudgetSummary["status"],
    transactionCount: num(pick(raw, ["transactionCount"])),
    categoryBudgets: cats,
    editable:
      pick(raw, ["editable"]) === true || pick(raw, ["editable"]) === false
        ? Boolean(pick(raw, ["editable"]))
        : undefined,
    locked: pick(raw, ["locked"]) === true,
    allocatedMinor: num(pick(raw, ["allocatedMinor"]), undefined as unknown as number) || undefined,
    unallocatedMinor:
      num(pick(raw, ["unallocatedMinor"]), undefined as unknown as number) || undefined,
    overAllocationMinor:
      num(pick(raw, ["overAllocationMinor"]), undefined as unknown as number) || undefined,
  };
}

function normalizeCategoryBudgetView(raw: Raw): BudgetSummary["categoryBudgets"][number] {
  return {
    categoryId: str(pick(raw, ["categoryId"])),
    categoryName: str(pick(raw, ["categoryName"]), "Category"),
    limitMinor: num(pick(raw, ["limitMinor"])),
    spentMinor: num(pick(raw, ["spentMinor"])),
    remainingMinor: num(pick(raw, ["remainingMinor"])),
    usagePercent: Number(pick(raw, ["usagePercent"]) ?? 0),
    status: str(pick(raw, ["status"]), "SAFE") as BudgetSummary["status"],
    transactionCount: num(pick(raw, ["transactionCount"])),
  };
}

function normalizeBudgetAlert(raw: Raw): BudgetAlert {
  return {
    message: str(pick(raw, ["message"])),
    thresholdPercent: num(pick(raw, ["thresholdPercent"])),
    categoryName: str(pick(raw, ["categoryName"])),
    spentMinor: num(pick(raw, ["spentMinor"])),
    limitMinor: num(pick(raw, ["limitMinor"])),
    status: str(pick(raw, ["status"]), "SAFE") as BudgetAlert["status"],
  };
}

function normalizeCategoryAnalytics(raw: Raw): CategoryAnalyticsRow {
  return {
    categoryId: str(pick(raw, ["categoryId"])),
    categoryName: str(pick(raw, ["categoryName"]), "Uncategorised"),
    amountMinor: num(pick(raw, ["amountMinor"])),
    percentage: Number(pick(raw, ["percentage"]) ?? 0),
    transactionCount: num(pick(raw, ["transactionCount"])),
    budgetLimitMinor:
      num(pick(raw, ["budgetLimitMinor"]), undefined as unknown as number) || undefined,
    budgetSpentMinor:
      num(pick(raw, ["budgetSpentMinor"]), undefined as unknown as number) || undefined,
    budgetRemainingMinor:
      num(pick(raw, ["budgetRemainingMinor"]), undefined as unknown as number) || undefined,
    budgetUsagePercent:
      pick(raw, ["budgetUsagePercent"]) != null
        ? Number(pick(raw, ["budgetUsagePercent"]))
        : undefined,
    budgetStatus: pick(raw, ["budgetStatus"])
      ? (str(pick(raw, ["budgetStatus"])) as CategoryAnalyticsRow["budgetStatus"])
      : undefined,
  };
}

function normalizeDailySpending(raw: Raw): DailySpendingRow {
  return {
    date: str(pick(raw, ["date"])),
    amountMinor: num(pick(raw, ["amountMinor"])),
    transactionCount: num(pick(raw, ["transactionCount"])),
  };
}

function normalizeDashboard(raw: Raw): ExpenseDashboard {
  return {
    month: str(pick(raw, ["month"])),
    currency: str(pick(raw, ["currency"]), "INR"),
    totalSpentMinor: num(pick(raw, ["totalSpentMinor"])),
    budgetTotalMinor:
      num(pick(raw, ["budgetTotalMinor"]), undefined as unknown as number) || undefined,
    budgetRemainingMinor:
      num(pick(raw, ["budgetRemainingMinor"]), undefined as unknown as number) || undefined,
    budgetUsagePercent:
      pick(raw, ["budgetUsagePercent"]) != null
        ? Number(pick(raw, ["budgetUsagePercent"]))
        : undefined,
    budgetStatus: pick(raw, ["budgetStatus"])
      ? (str(pick(raw, ["budgetStatus"])) as ExpenseDashboard["budgetStatus"])
      : undefined,
    topCategories: asList(pick(raw, ["topCategories"])).map(normalizeCategoryAnalytics),
    recentTransactions: asList(pick(raw, ["recentTransactions"])).map(normalizeTransaction),
    weeklyTrend: asList(pick(raw, ["weeklyTrend"])).map(normalizeDailySpending),
    budgetAlerts: asList(pick(raw, ["budgetAlerts"])).map(normalizeBudgetAlert),
    transactionCount: num(pick(raw, ["transactionCount"])),
  };
}

function normalizeMerchantAnalytics(raw: Raw): import("./expense-types").MerchantAnalyticsRow {
  return {
    merchant: str(pick(raw, ["merchant"]), "Unknown"),
    amountMinor: num(pick(raw, ["amountMinor"])),
    transactionCount: num(pick(raw, ["transactionCount"])),
    averageMinor: num(pick(raw, ["averageMinor"]), undefined as unknown as number) || undefined,
  };
}

function normalizeMemberAnalytics(raw: Raw): import("./expense-types").MemberAnalyticsRow {
  return {
    memberId: str(pick(raw, ["memberId"])),
    memberName: str(pick(raw, ["memberName"]), "Member"),
    amountMinor: num(pick(raw, ["amountMinor"])),
    transactionCount: num(pick(raw, ["transactionCount"])),
  };
}

function normalizeMonthly(raw: Raw): MonthlySummary {
  return {
    month: str(pick(raw, ["month"])),
    currency: str(pick(raw, ["currency"]), "INR"),
    totalSpentMinor: num(pick(raw, ["totalSpentMinor"])),
    personalSpentMinor: num(pick(raw, ["personalSpentMinor"])),
    sharedSpentMinor: num(pick(raw, ["sharedSpentMinor"])),
    transactionCount: num(pick(raw, ["transactionCount"])),
    monthlyBudgetMinor:
      num(pick(raw, ["monthlyBudgetMinor"]), undefined as unknown as number) || undefined,
    changePercent:
      pick(raw, ["changePercent"]) != null ? Number(pick(raw, ["changePercent"])) : null,
  };
}

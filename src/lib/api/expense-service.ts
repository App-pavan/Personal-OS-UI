import { api } from "./client";
import type { PaginationMeta, Paginated } from "./types";
import type {
  CreateCategoryInput,
  CreateMemberInput,
  ExpenseCategory,
  ExpenseMember,
  ExpenseTransaction,
  TransactionPatchInput,
  TransactionQuery,
  TransactionSource,
  TransactionStatus,
  TransactionWriteInput,
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

const asRaw = (value: unknown): Raw =>
  value && typeof value === "object" ? (value as Raw) : {};

const asList = (value: unknown): Raw[] =>
  Array.isArray(value) ? value.map(asRaw) : [];

/** Backends differ on `id` vs `_id`; both are accepted. */
const idOf = (raw: Raw) => str(pick(raw, ["id", "_id", "ID"]));

function normalizeTransaction(input: unknown): ExpenseTransaction {
  const raw = asRaw(input);
  const category = asRaw(pick(raw, ["category"]));
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
  const billUrl = str(pick(bill, ["storageKey", "attachmentId"]) ?? pick(raw, ["billUrl", "receiptUrl"]));
  const splitMode = str(pick(splitObj, ["mode"]) ?? pick(raw, ["splitMode", "split_mode"]));

  return {
    id: idOf(raw),
    merchant: merchantRaw,
    amountMinor: num(pick(raw, ["amountMinor", "amount_minor", "amount"])),
    currency: str(pick(raw, ["currency"]), "INR").toUpperCase(),
    occurredAt: str(
      pick(raw, ["transactionDate", "occurredAt", "occurred_at", "date", "transactedAt", "createdAt"]),
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
    ...(splitMode === "custom" || splitMode === "equal" ? { splitMode: splitMode as "custom" | "equal" } : {}),
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
      const meta: PaginationMeta =
        res.meta ??
        ({
          page: query.page ?? 1,
          perPage: query.limit ?? items.length,
          total: items.length,
          totalPages: 1,
        } satisfies PaginationMeta);
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
};

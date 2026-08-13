import type { PaginationMeta } from "./types";

type RawMeta = Record<string, unknown> | undefined;

function num(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

/** Normalize backend pagination whether flat or nested under meta.pagination. */
export function normalizePaginationMeta(
  meta: unknown,
  fallback: Partial<PaginationMeta> = {},
): PaginationMeta {
  const raw = (meta ?? {}) as RawMeta;
  const pag = ((raw.pagination ?? raw) as RawMeta) ?? {};

  const page = Math.max(1, num(pag.page, fallback.page ?? 1));
  const perPage = Math.max(1, num(pag.perPage ?? pag.limit, fallback.perPage ?? 20));
  const total = Math.max(0, num(pag.total, fallback.total ?? 0));

  let totalPages = num(pag.totalPages, 0);
  if (totalPages <= 0 && total > 0) {
    totalPages = Math.ceil(total / perPage);
  }
  if (totalPages <= 0) totalPages = 1;

  return { page, perPage, total, totalPages };
}

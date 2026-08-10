import type { ApiError, ApiResponse, PaginationMeta } from "./types";

/* ---------------------------------------------------------------
 * Centralised API client for the Personal OS backend.
 *
 * Nothing in the UI talks to fetch() directly. Services (see
 * ./services) are the only consumers of this client, so the whole
 * app can be flipped from mock to live by swapping the service
 * implementation — no component changes.
 * ------------------------------------------------------------- */

export const API_BASE_URL = "/api/v1";

export class ApiRequestError extends Error {
  status: number;
  error?: ApiError;

  constructor(message: string, status: number, error?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.error = error;
  }
}

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

let accessToken: string | null = null;
let tokenProvider: TokenProvider = () => accessToken;
let onUnauthorized: UnauthorizedHandler = () => {};

export const auth = {
  setAccessToken(token: string | null) {
    accessToken = token;
  },
  setTokenProvider(provider: TokenProvider) {
    tokenProvider = provider;
  },
  /** Wired in the integration phase (401 -> refresh -> retry -> lock). */
  setUnauthorizedHandler(handler: UnauthorizedHandler) {
    onUnauthorized = handler;
  },
};

export type QueryParams = Record<
  string,
  string | number | boolean | Array<string | number> | undefined | null
>;

export function buildQuery(params?: QueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (!value.length) continue;
      search.set(key, value.join(","));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  params?: QueryParams;
  signal?: AbortSignal;
  /** Public endpoints (auth) skip the bearer header. */
  anonymous?: boolean;
};

export type Envelope<T> = { data: T; meta?: PaginationMeta };

export async function request<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  const { method = "GET", body, params, signal, anonymous } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!anonymous) {
    const token = tokenProvider();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    onUnauthorized();
    throw new ApiRequestError("Session expired", 401);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new ApiRequestError(
      payload?.error?.message ?? `Request failed (${response.status})`,
      response.status,
      payload?.error,
    );
  }

  return { data: payload.data, meta: payload.meta };
}

export const api = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

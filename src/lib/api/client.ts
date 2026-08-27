import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import { ApiRequestError, networkError, toApiError } from "./errors";
import { tokenStore } from "./token-store";
import type { ApiResponse, PaginationMeta } from "./types";

/* ---------------------------------------------------------------
 * Centralised API client.
 *
 * UI -> hooks -> services -> this client -> /api/v1
 *
 * Owns: base URL, JSON, Authorization header, timeouts, envelope
 * unwrapping, error normalization and 401 -> refresh -> retry.
 * Nothing else in the app may call fetch().
 * ------------------------------------------------------------- */

export { ApiRequestError };
export { API_BASE_URL };

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};

type ForbiddenHandler = () => void;
let onForbidden: ForbiddenHandler = () => {};

export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

export function setForbiddenHandler(handler: ForbiddenHandler) {
  onForbidden = handler;
}

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
  params?: QueryParams | undefined;
  signal?: AbortSignal | undefined;
  /** Public endpoints (login / refresh) skip the bearer header and retry. */
  anonymous?: boolean;
};

export type Envelope<T> = { data: T; meta?: PaginationMeta | undefined };

const requestId = () => `pos-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ---------------- single-flight refresh ---------------- */

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStore.refreshToken();
  if (!refreshToken) return false;

  refreshInFlight ??= (async () => {
    try {
      const res = await rawFetch("/identity/auth/refresh", {
        method: "POST",
        body: { refreshToken, refresh_token: refreshToken },
        anonymous: true,
      });
      const payload = res.data as Record<string, unknown>;
      const access = (payload["accessToken"] ?? payload["access_token"]) as string | undefined;
      const refresh =
        ((payload["refreshToken"] ?? payload["refresh_token"]) as string | undefined) ??
        refreshToken;
      if (!access) return false;
      tokenStore.set({ accessToken: access, refreshToken: refresh });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/* ---------------- transport ---------------- */

async function rawFetch<T>(path: string, options: RequestOptions): Promise<Envelope<T>> {
  const { method = "GET", body, params, signal, anonymous } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-Id": requestId(),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!anonymous) {
    const token = tokenStore.accessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      signal: controller.signal,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (cause) {
    throw networkError(cause);
  } finally {
    clearTimeout(timeout);
  }

  let payload: ApiResponse<T> | null = null;
  if (response.status !== 204) {
    try {
      payload = (await response.json()) as ApiResponse<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || (payload && payload.success === false)) {
    const err = toApiError(response.status, payload?.error);
    if (response.status === 403) onForbidden();
    throw err;
  }

  // Normalize the backend envelope: services and components receive plain data.
  return {
    data: (payload && "data" in payload ? payload.data : (payload as unknown as T)) as T,
    meta: payload?.meta,
  };
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<Envelope<T>> {
  try {
    return await rawFetch<T>(path, options);
  } catch (error) {
    const unauthorized = error instanceof ApiRequestError && error.status === 401;
    if (!unauthorized || options.anonymous) throw error;

    const refreshed = await refreshSession();
    if (!refreshed) {
      tokenStore.clear();
      onSessionExpired();
      throw error;
    }
    try {
      return await rawFetch<T>(path, options);
    } catch (retryError) {
      if (retryError instanceof ApiRequestError && retryError.status === 401) {
        tokenStore.clear();
        onSessionExpired();
      }
      throw retryError;
    }
  }
}

export const api = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
    request<T>(path, { method: "GET", params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  /** Public endpoints only (login, refresh). */
  anonymous: {
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body, anonymous: true }),
  },
};

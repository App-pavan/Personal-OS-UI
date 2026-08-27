import type { ApiError } from "./types";

export type ApiErrorKind =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "server"
  | "network"
  | "timeout"
  | "unknown";

/**
 * Normalized transport error. Raw backend payloads never reach the UI —
 * components read `message` (already human friendly) and `kind`.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly code?: string | undefined;

  constructor(kind: ApiErrorKind, message: string, status = 0, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

const messages: Record<ApiErrorKind, string> = {
  bad_request: "That request wasn't valid. Check the details and try again.",
  unauthorized: "Your session expired. Sign in to continue.",
  forbidden: "You don't have access to this.",
  not_found: "We couldn't find that anymore.",
  conflict: "This changed somewhere else. Reload and try again.",
  validation: "Some details need fixing before this can be saved.",
  rate_limited: "Too many requests. Give it a moment.",
  server: "The backend had a problem. Try again shortly.",
  network: "Network unavailable. Check your connection.",
  timeout: "The backend took too long to respond.",
  unknown: "Something went wrong.",
};

export function kindFromStatus(status: number): ApiErrorKind {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    case 429:
      return "rate_limited";
    default:
      return status >= 500 ? "server" : "unknown";
  }
}

export function toApiError(status: number, error?: ApiError): ApiRequestError {
  const kind = kindFromStatus(status);
  const safe = error?.message && error.message.length < 160 ? error.message : messages[kind];
  return new ApiRequestError(kind, safe, status, error?.code);
}

export function networkError(cause: unknown): ApiRequestError {
  if (cause instanceof ApiRequestError) return cause;
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return new ApiRequestError("timeout", messages.timeout);
  }
  return new ApiRequestError("network", messages.network);
}

/** Friendly, contextual message for any thrown value. */
export function errorMessage(error: unknown, fallback = messages.unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error && error.message) return fallback;
  return fallback;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.kind === "not_found";
}

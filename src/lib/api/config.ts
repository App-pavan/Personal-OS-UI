/* ---------------------------------------------------------------
 * API environment configuration.
 * The base URL is never hardcoded in components or services.
 * ------------------------------------------------------------- */

const raw = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.trim();

function normalizeBaseUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, "");
  // Accept the API Gateway root; backend routes always live under /api/v1.
  if (trimmed.startsWith("http") && !trimmed.endsWith("/api/v1")) {
    return `${trimmed}/api/v1`;
  }
  return trimmed;
}

/** Same-origin fallback keeps the app usable behind a reverse proxy. */
export const API_BASE_URL = normalizeBaseUrl(raw && raw.length ? raw : "/api/v1");

export const API_TIMEOUT_MS = 20_000;

export const API_ENVIRONMENT = import.meta.env.PROD ? "production" : "development";

/** True when the deployment explicitly configured a backend. */
export const API_CONFIGURED = Boolean(raw && raw.length);

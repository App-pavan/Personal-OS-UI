import { api } from "@/lib/api/client";
import { tokenStore } from "@/lib/api/token-store";

/* ---------------------------------------------------------------
 * Auth service. Master-account model: login / logout / session
 * restore only. No registration exists by design.
 * ------------------------------------------------------------- */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role?: string;
};

type RawUser = Record<string, unknown>;

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length ? value.trim() : undefined;

export function normalizeUser(raw: RawUser | null | undefined, fallbackEmail = ""): SessionUser {
  const source = raw ?? {};
  const email = str(source["email"]) ?? fallbackEmail;
  const name =
    str(source["name"]) ??
    str(source["displayName"]) ??
    [str(source["firstName"]), str(source["lastName"])].filter(Boolean).join(" ") ??
    "";
  const display = name.length ? name : email.split("@")[0] || "Owner";
  const initials = display
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  return {
    id: str(source["id"]) ?? str(source["_id"]) ?? "owner",
    name: display,
    email,
    initials: initials || display.slice(0, 2).toUpperCase(),
    ...(str(source["role"])
      ? { role: str(source["role"])! }
      : Array.isArray(source["roles"]) && source["roles"].length
        ? { role: String(source["roles"][0]) }
        : {}),
  };
}

export const authService = {
  async login(email: string, password: string): Promise<SessionUser> {
    const res = await api.anonymous.post<Record<string, unknown>>("/identity/auth/login", {
      email,
      password,
    });
    const payload = res.data ?? {};
    const tokens = (payload["tokens"] ?? payload) as Record<string, unknown>;
    const access = (tokens["accessToken"] ?? tokens["access_token"]) as string | undefined;
    const refresh = (tokens["refreshToken"] ?? tokens["refresh_token"]) as string | undefined;
    if (!access) throw new Error("missing token");
    tokenStore.set({ accessToken: access, refreshToken: refresh ?? "" });
    return normalizeUser(payload["user"] as RawUser, email);
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStore.refreshToken();
    try {
      await api.post<null>("/identity/auth/logout", refreshToken ? { refreshToken } : undefined);
    } catch {
      /* the local session is cleared regardless */
    } finally {
      tokenStore.clear();
    }
  },

  /** Validates a restored session against the backend. */
  async me(): Promise<SessionUser> {
    const res = await api.get<Record<string, unknown>>("/identity/auth/me");
    const payload = res.data ?? {};
    const user = (payload["user"] ?? payload) as RawUser;
    return normalizeUser(user);
  },
};

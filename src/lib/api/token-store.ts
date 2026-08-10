/* ---------------------------------------------------------------
 * Token storage. Tokens live here only — never in component state,
 * never logged, never rendered.
 * ------------------------------------------------------------- */

const KEY = "personal-os.session";

export type StoredTokens = { accessToken: string; refreshToken: string };

let tokens: StoredTokens | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const tokenStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get(): StoredTokens | null {
    return tokens;
  },
  accessToken(): string | null {
    return tokens?.accessToken ?? null;
  },
  refreshToken(): string | null {
    return tokens?.refreshToken ?? null;
  },
  set(next: StoredTokens) {
    tokens = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — session stays in memory */
    }
    emit();
  },
  clear() {
    tokens = null;
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    emit();
  },
  /** Restores a persisted session on boot (client only). */
  hydrate(): StoredTokens | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredTokens>;
      if (!parsed.accessToken || !parsed.refreshToken) return null;
      tokens = { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken };
      emit();
      return tokens;
    } catch {
      return null;
    }
  },
};

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { setSessionExpiredHandler } from "@/lib/api/client";
import { ApiRequestError } from "@/lib/api/errors";
import { tokenStore } from "@/lib/api/token-store";
import { authService, type SessionUser } from "./auth-service";

type AuthStatus = "restoring" | "signed_out" | "signed_in";

type AuthValue = {
  status: AuthStatus;
  user: SessionUser | null;
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const USER_KEY = "personal-os.user";

const AuthContext = createContext<AuthValue | null>(null);

const readCachedUser = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
};

const writeCachedUser = (user: SessionUser | null) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("restoring");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Session restoration: tokens are persisted, then verified in the background.
  useEffect(() => {
    let alive = true;
    const tokens = tokenStore.hydrate();
    if (!tokens) {
      setStatus("signed_out");
      return;
    }
    const cached = readCachedUser();
    if (cached) setUser(cached);
    setStatus("signed_in");

    void authService
      .me()
      .then((fresh) => {
        if (!alive) return;
        setUser(fresh);
        writeCachedUser(fresh);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        // Only an explicit 401 invalidates a restored session; a missing
        // /auth/me endpoint or a network blip must not sign the owner out.
        if (error instanceof ApiRequestError && error.status === 401) {
          tokenStore.clear();
          writeCachedUser(null);
          setUser(null);
          setStatus("signed_out");
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      writeCachedUser(null);
      setUser(null);
      setSessionExpired(true);
      setStatus("signed_out");
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await authService.login(email, password);
    setUser(next);
    writeCachedUser(next);
    setSessionExpired(false);
    setStatus("signed_in");
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    writeCachedUser(null);
    setUser(null);
    setSessionExpired(false);
    setStatus("signed_out");
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status, user, sessionExpired, signIn, signOut }),
    [status, user, sessionExpired, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

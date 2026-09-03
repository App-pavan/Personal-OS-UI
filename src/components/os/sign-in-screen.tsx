import { useEffect, useState } from "react";
import { Fingerprint, KeyRound, Loader2, ScanFace } from "lucide-react";
import { BrandLogo } from "@/components/os/brand-logo";
import { useAuth } from "@/features/auth/auth-context";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/**
 * Master account gate. Personal OS has exactly one owner — there is no
 * sign-up, no invite, no account creation. Credentials are verified by
 * the backend; nothing is unlocked locally.
 */
export function SignInScreen() {
  const { signIn, sessionExpired } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      );
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and master password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(errorMessage(err, "We couldn't sign you in. Check your credentials."));
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="ambient-drift pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_50%_120%,transparent,color-mix(in_oklab,var(--background)_92%,transparent))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10">
        <header className="animate-soft-in flex items-center justify-between">
          <BrandMark className="size-8" />
          <span className="font-mono text-sm text-muted-foreground tabular-nums">{clock}</span>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-12 py-16 lg:flex-row lg:items-center lg:gap-20">
          <div className="animate-rise max-w-xl">
            <BrandLogo variant="full" className="mb-8 max-w-[240px]" />
            <p className="label-eyebrow">Master account</p>
            <h1 className="display-xl mt-4 text-balance">
              Welcome back.
              <span className="block text-muted-foreground">Your OS is where you left it.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              One account owns this system. Everything inside is unlocked by you and only you.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {["Email & password", "Passkey soon", "Biometric soon"].map((m, i) => (
                <span
                  key={m}
                  className={cn(
                    "rounded-md border border-hairline px-2.5 py-1.5",
                    i === 0 && "bg-primary-soft text-primary border-transparent",
                  )}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="glass-panel sheen-top animate-rise w-full max-w-sm rounded-xl p-6"
            style={{ animationDelay: "120ms" }}
          >
            {sessionExpired ? (
              <p className="mb-4 rounded-md border border-hairline bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                Your session expired. Sign in to continue.
              </p>
            ) : null}

            <label className="block text-xs font-medium text-muted-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="you@example.com"
              className="mt-1.5 h-11 w-full rounded-lg border border-hairline bg-surface/70 px-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/50"
            />

            <label
              className="mt-4 block text-xs font-medium text-muted-foreground"
              htmlFor="password"
            >
              Master password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              placeholder="••••••••••"
              className="mt-1.5 h-11 w-full rounded-lg border border-hairline bg-surface/70 px-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/50"
            />

            {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="gradient-primary mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-primary-foreground transition active:scale-[0.99] disabled:opacity-70"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              {busy ? "Signing in" : "Unlock"}
            </button>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                disabled
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-hairline text-xs font-medium text-muted-foreground"
              >
                <ScanFace className="size-4" /> Face ID
              </button>
              <button
                type="button"
                disabled
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-hairline text-xs font-medium text-muted-foreground"
              >
                <Fingerprint className="size-4" /> Passkey
              </button>
            </div>

            <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
              No registration exists. This system has a single owner account.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

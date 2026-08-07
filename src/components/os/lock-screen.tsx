import { useEffect, useState } from "react";
import { Fingerprint, KeyRound, Loader2, Lock, ScanFace } from "lucide-react";
import { session } from "@/lib/os-store";
import { user } from "@/lib/os-data";
import { cn } from "@/lib/utils";

/**
 * Master account gate. Personal OS has exactly one owner — there is no
 * sign-up, no invite, no account creation. Family members are managed
 * inside the OS after the owner is in.
 */
export function LockScreen() {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "error">("idle");
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setState("error");
      return;
    }
    setState("checking");
    window.setTimeout(() => session.unlock(), 620);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="ambient-drift pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_50%_120%,transparent,color-mix(in_oklab,var(--background)_92%,transparent))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10">
        <header className="animate-soft-in flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="gradient-primary grid size-8 place-items-center rounded-lg text-primary-foreground">
              <Lock className="size-3.5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Personal OS</span>
          </span>
          <span className="font-mono text-sm text-muted-foreground tabular-nums">{clock}</span>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-12 py-16 lg:flex-row lg:items-center lg:gap-20">
          <div className="animate-rise max-w-xl">
            <p className="label-eyebrow">Master account</p>
            <h1 className="display-xl mt-4 text-balance">
              Welcome back, {user.name}.
              <span className="block text-muted-foreground">Your OS is where you left it.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              One account owns this system. Everything inside — documents, keys, devices, family
              spaces — is unlocked by you and only you.
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
            <div className="flex items-center gap-3">
              <span className="gradient-accent grid size-10 place-items-center rounded-lg text-sm font-semibold text-accent-foreground">
                {user.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">Owner · this device</p>
              </div>
            </div>

            <label className="mt-6 block text-xs font-medium text-muted-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
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
                setState("idle");
              }}
              autoComplete="current-password"
              placeholder="••••••••••"
              className="mt-1.5 h-11 w-full rounded-lg border border-hairline bg-surface/70 px-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-ring/50"
            />

            {state === "error" ? (
              <p className="mt-2 text-xs text-destructive">Enter your master password to continue.</p>
            ) : null}

            <button
              type="submit"
              disabled={state === "checking"}
              className="gradient-primary mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-primary-foreground transition active:scale-[0.99] disabled:opacity-70"
            >
              {state === "checking" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {state === "checking" ? "Unlocking" : "Unlock"}
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
              No registration exists. Family members are added from inside the OS.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

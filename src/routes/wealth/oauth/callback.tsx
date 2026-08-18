import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { PageShell } from "@/components/os/primitives";
import { Skeleton } from "@/components/os/state-views";
import { useWealthMutations } from "@/hooks/use-wealth";

export const Route = createFileRoute("/wealth/oauth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    request_token: typeof search.request_token === "string" ? search.request_token : "",
    status: typeof search.status === "string" ? search.status : "",
    state: typeof search.state === "string" ? search.state : "",
  }),
  head: () => ({ meta: [{ title: "Connecting — Wealth" }] }),
  component: WealthOAuthCallbackPage,
});

function WealthOAuthCallbackPage() {
  const { request_token, status, state } = Route.useSearch();
  const navigate = useNavigate();
  const { completeOAuth } = useWealthMutations();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!request_token || status === "error") {
      void navigate({ to: "/wealth" });
      return;
    }

    completeOAuth.mutate(
      {
        provider: "zerodha_kite",
        input: { requestToken: request_token, state: state || undefined },
      },
      {
        onSettled: () => {
          void navigate({ to: "/wealth" });
        },
      },
    );
  }, [request_token, status, state, completeOAuth, navigate]);

  return (
    <PageShell>
      <div className="mx-auto max-w-md space-y-3 py-16 text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <p className="text-sm text-muted-foreground">Completing Zerodha connection…</p>
      </div>
    </PageShell>
  );
}

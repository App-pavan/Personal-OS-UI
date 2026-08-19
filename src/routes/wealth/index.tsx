import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/os/primitives";
import { ErrorState } from "@/components/os/state-views";
import { ConnectedProvidersCard } from "@/features/wealth/components/connected-providers";
import {
  ConnectProviderDialog,
  providerByKey,
} from "@/features/wealth/components/connect-provider-dialog";
import { HoldingsPreview } from "@/features/wealth/components/holdings-preview";
import { ManualHoldingDialog } from "@/features/wealth/components/manual-holding-dialog";
import {
  AssetAllocationCard,
  PortfolioPerformanceCard,
} from "@/features/wealth/components/wealth-charts";
import { WealthSyncActivity } from "@/features/runtime/components/wealth-sync-activity";
import {
  buildSyncLabel,
  SyncStatusBanner,
  WealthHeader,
  WealthSummarySkeleton,
} from "@/features/wealth/components/wealth-header";
import { WealthSummaryCards } from "@/features/wealth/components/wealth-summary";
import { WealthEmptyState } from "@/features/wealth/components/wealth-states";
import { allocationFromHoldings } from "@/features/wealth/lib/allocation";
import { resolveWealthUiState } from "@/features/wealth/lib/data-status";
import {
  useWealthCashFlow,
  useWealthConnections,
  useWealthHoldings,
  useWealthMutations,
  useWealthOverview,
  useWealthProviders,
  useWealthSyncJobs,
} from "@/hooks/use-wealth";
import { wealthApi } from "@/lib/api/wealth-service";
import type { WealthProviderKey } from "@/lib/api/wealth-types";
import { useQuery } from "@tanstack/react-query";
import { wealthKeys } from "@/hooks/use-wealth";

export const Route = createFileRoute("/wealth/")({
  head: () => ({ meta: [{ title: "Wealth — Personal OS" }] }),
  component: WealthOverviewPage,
});

function WealthOverviewPage() {
  const overview = useWealthOverview();
  const holdings = useWealthHoldings();
  const connections = useWealthConnections();
  const providers = useWealthProviders();
  const cashFlow = useWealthCashFlow();
  const mutations = useWealthMutations();

  const hasSyncingConnection = useMemo(
    () => connections.data?.some((c) => c.status === "syncing") ?? false,
    [connections.data],
  );

  const isSyncingEarly = mutations.sync.isPending || hasSyncingConnection;
  const syncJobs = useWealthSyncJobs({ refetchInterval: isSyncingEarly ? 3000 : false });
  const accounts = useQuery({
    queryKey: wealthKeys.accounts("all"),
    queryFn: () => wealthApi.accounts.list(),
  });

  const [connectKey, setConnectKey] = useState<WealthProviderKey | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeSyncJobId, setActiveSyncJobId] = useState<string | null>(null);

  const uiState = resolveWealthUiState({
    isLoading: overview.isLoading,
    isError: overview.isError,
    dataStatus: overview.data?.dataStatus,
    holdingsCount: overview.data?.holdings ?? holdings.data?.length,
    hasSyncingConnection,
  });

  const currency = overview.data?.currency ?? "INR";
  const allocation = useMemo(() => allocationFromHoldings(holdings.data ?? []), [holdings.data]);

  const latestJob = syncJobs.data?.[0];
  const activeJob =
    latestJob?.status === "running" || latestJob?.status === "pending" ? latestJob : null;
  const syncJobId = activeSyncJobId ?? activeJob?.id ?? null;
  const isSyncing =
    mutations.sync.isPending ||
    hasSyncingConnection ||
    latestJob?.status === "running" ||
    latestJob?.status === "pending";

  const syncLabel = buildSyncLabel(overview.data?.lastSyncedAt, isSyncing);

  const openConnect = (key: WealthProviderKey) => setConnectKey(key);

  const handleConnect = (credentials: Record<string, string>) => {
    if (!connectKey) return;
    mutations.connect.mutate({
      provider: connectKey,
      credentials: Object.keys(credentials).length ? credentials : undefined,
    });
  };

  const handleSyncAll = async () => {
    const list = connections.data?.filter(
      (c) =>
        c.status === "connected" || c.status === "connected_with_errors" || c.status === "syncing",
    );
    if (!list?.length) return;
    for (const conn of list) {
      if (conn.provider === "manual") continue;
      setSyncingId(conn.id);
      try {
        const job = await mutations.sync.mutateAsync({ connectionId: conn.id, mode: "incremental" });
        setActiveSyncJobId(job.id);
      } finally {
        setSyncingId(null);
      }
    }
  };

  const handleSyncConnection = (connectionId: string) => {
    setSyncingId(connectionId);
    mutations.sync.mutate(
      { connectionId, mode: "incremental" },
      {
        onSuccess: (job) => setActiveSyncJobId(job.id),
        onSettled: () => setSyncingId(null),
      },
    );
  };

  const ensureManualAndOpen = async () => {
    const hasManual = connections.data?.some((c) => c.provider === "manual");
    if (!hasManual) {
      await mutations.connect.mutateAsync({ provider: "manual" });
      await mutations.invalidateAll();
      await accounts.refetch();
    }
    setManualOpen(true);
  };

  const selectedProvider = connectKey ? providerByKey(providers.data ?? [], connectKey) : null;

  if (overview.isError) {
    return (
      <PageShell>
        <ErrorState
          error={overview.error}
          onRetry={() => overview.refetch()}
          title="Unable to load wealth"
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <WealthHeader
        uiState={uiState}
        syncLabel={syncLabel}
        onSync={() => void handleSyncAll()}
        syncing={isSyncing}
      />

      <SyncStatusBanner
        uiState={uiState}
        lastSyncedLabel={syncLabel?.replace(/^Last synced /, "")}
        errorMessage={latestJob?.errorMessage}
        onRetry={() => void handleSyncAll()}
      />

      <WealthSyncActivity
        syncing={isSyncing}
        syncJobId={syncJobId}
        errorMessage={
          uiState === "ERROR" || latestJob?.status === "failed" ? latestJob?.errorMessage : undefined
        }
      />

      {uiState === "LOADING" ? <WealthSummarySkeleton /> : null}

      {uiState === "NO_CONNECTION" ? (
        <WealthEmptyState
          connecting={mutations.connect.isPending}
          onConnectZerodha={() => openConnect("zerodha_kite")}
          onConnectGroww={() => openConnect("groww_holdings")}
          onAddManual={() => void ensureManualAndOpen()}
        />
      ) : null}

      {uiState !== "LOADING" && uiState !== "NO_CONNECTION" && overview.data ? (
        <div className="space-y-6 animate-hud-in">
          {(uiState === "EMPTY" || overview.data.holdings === 0) && (
            <WealthEmptyState
              connecting={mutations.connect.isPending}
              onConnectZerodha={() => openConnect("zerodha_kite")}
              onConnectGroww={() => openConnect("groww_holdings")}
              onAddManual={() => void ensureManualAndOpen()}
            />
          )}

          {(overview.data.holdings > 0 || overview.data.currentValueMinor > 0) && (
            <WealthSummaryCards
              currency={currency}
              currentValueMinor={overview.data.currentValueMinor}
              investedMinor={overview.data.totalInvestedMinor}
              pnlMinor={overview.data.totalPnlMinor}
              pnlPercent={overview.data.pnlPercentage}
              monthlyExpensesMinor={cashFlow.data?.monthlyExpensesMinor}
              expensesLoading={cashFlow.isLoading}
            />
          )}

          {(overview.data.holdings > 0 || overview.data.currentValueMinor > 0) && (
            <div className="grid gap-4 xl:grid-cols-2">
              <PortfolioPerformanceCard
                currency={currency}
                currentValueMinor={overview.data.currentValueMinor}
                pnlPercent={overview.data.pnlPercentage}
              />
              <AssetAllocationCard slices={allocation} currency={currency} />
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {(overview.data.holdings > 0 || holdings.isLoading) && (
              <HoldingsPreview
                holdings={holdings.data ?? []}
                currency={currency}
                loading={holdings.isLoading}
              />
            )}
            <ConnectedProvidersCard
              connections={connections.data ?? []}
              providers={providers.data ?? []}
              onConnect={openConnect}
              onSyncConnection={handleSyncConnection}
              syncingId={syncingId}
            />
          </div>
        </div>
      ) : null}

      <ConnectProviderDialog
        open={Boolean(connectKey)}
        provider={selectedProvider}
        onOpenChange={(open) => !open && setConnectKey(null)}
        onConnect={handleConnect}
        loading={mutations.connect.isPending}
      />

      <ManualHoldingDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        connections={connections.data ?? []}
        accounts={accounts.data ?? []}
        loading={mutations.createHolding.isPending || mutations.connect.isPending}
        onSubmit={(input) => {
          mutations.createHolding.mutate(
            {
              accountId: input.accountId,
              symbol: input.symbol,
              name: input.name,
              exchange: input.exchange,
              quantity: input.quantity,
              investedMinor: input.investedMinor,
              averageCostMinor: input.averageCostMinor,
              instrumentType: "equity",
              currency: "INR",
            },
            { onSuccess: () => setManualOpen(false) },
          );
        }}
      />
    </PageShell>
  );
}

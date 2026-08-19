import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wealthApi } from "@/lib/api/wealth-service";
import { errorMessage } from "@/lib/api/errors";
import type {
  CompleteOAuthInput,
  ConnectProviderInput,
  CreateHoldingInput,
  PlatformProviderKey,
  TriggerSyncInput,
  UpdatePlatformConfigurationInput,
  WealthProviderKey,
} from "@/lib/api/wealth-types";
import { toast } from "sonner";

export const wealthKeys = {
  all: ["wealth"] as const,
  overview: ["wealth", "overview"] as const,
  portfolio: ["wealth", "portfolio"] as const,
  cashFlow: (month: string) => ["wealth", "cash-flow", month] as const,
  providers: ["wealth", "providers"] as const,
  connections: ["wealth", "connections"] as const,
  holdings: ["wealth", "holdings"] as const,
  accounts: (connectionId?: string) => ["wealth", "accounts", connectionId ?? "all"] as const,
  syncJobs: ["wealth", "sync-jobs"] as const,
  configuration: ["wealth", "configuration"] as const,
};

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useWealthOverview() {
  return useQuery({
    queryKey: wealthKeys.overview,
    queryFn: () => wealthApi.overview.get(),
    retry: 1,
  });
}

export function useWealthPortfolio() {
  return useQuery({
    queryKey: wealthKeys.portfolio,
    queryFn: () => wealthApi.portfolio.get(),
    retry: 1,
  });
}

export function useWealthCashFlow(month?: string) {
  const key = month ?? currentMonthKey();
  return useQuery({
    queryKey: wealthKeys.cashFlow(key),
    queryFn: () => wealthApi.cashFlow.get(key),
    retry: 1,
  });
}

export function useWealthProviders() {
  return useQuery({
    queryKey: wealthKeys.providers,
    queryFn: () => wealthApi.providers.list(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useWealthConnections() {
  return useQuery({
    queryKey: wealthKeys.connections,
    queryFn: () => wealthApi.connections.list(),
    retry: 1,
  });
}

export function useWealthHoldings() {
  return useQuery({
    queryKey: wealthKeys.holdings,
    queryFn: () => wealthApi.holdings.list(),
    retry: 1,
  });
}

export function useWealthAccounts(connectionId?: string) {
  return useQuery({
    queryKey: wealthKeys.accounts(connectionId),
    queryFn: () => wealthApi.accounts.list(connectionId),
    enabled: Boolean(connectionId),
    retry: 1,
  });
}

export function useWealthSyncJobs(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: wealthKeys.syncJobs,
    queryFn: () => wealthApi.sync.listJobs(),
    retry: 1,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useWealthConfiguration() {
  return useQuery({
    queryKey: wealthKeys.configuration,
    queryFn: () => wealthApi.configuration.get(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useWealthMutations() {
  const qc = useQueryClient();

  const invalidateAll = () => {
    void qc.invalidateQueries({ queryKey: wealthKeys.all });
  };

  const connect = useMutation({
    mutationFn: (input: ConnectProviderInput) => wealthApi.connections.connect(input),
    onSuccess: (result) => {
      invalidateAll();
      if (result.loginUrl) {
        window.location.assign(result.loginUrl);
        return;
      }
      toast.success("Account connected");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const completeOAuth = useMutation({
    mutationFn: ({ provider, input }: { provider: WealthProviderKey; input: CompleteOAuthInput }) =>
      wealthApi.connections.completeOAuth(provider, input),
    onSuccess: () => {
      invalidateAll();
      toast.success("Zerodha connected successfully");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const disconnect = useMutation({
    mutationFn: (id: string) => wealthApi.connections.disconnect(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Disconnected");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const sync = useMutation({
    mutationFn: (input: TriggerSyncInput) => wealthApi.sync.trigger(input),
    onSuccess: () => {
      invalidateAll();
      toast.success("Sync started");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const createHolding = useMutation({
    mutationFn: (input: CreateHoldingInput) => wealthApi.holdings.create(input),
    onSuccess: () => {
      invalidateAll();
      toast.success("Investment added");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const updateConfiguration = useMutation({
    mutationFn: (input: UpdatePlatformConfigurationInput) => wealthApi.configuration.update(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: wealthKeys.configuration });
      void qc.invalidateQueries({ queryKey: wealthKeys.providers });
      toast.success("Configuration saved");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const importEnvConfiguration = useMutation({
    mutationFn: () => wealthApi.configuration.importEnv(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: wealthKeys.configuration });
      void qc.invalidateQueries({ queryKey: wealthKeys.providers });
      toast.success("Environment configuration imported");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const deleteProviderCredentials = useMutation({
    mutationFn: (provider: PlatformProviderKey) => wealthApi.configuration.deleteProvider(provider),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: wealthKeys.configuration });
      void qc.invalidateQueries({ queryKey: wealthKeys.providers });
      toast.success("Credentials removed");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const testPlatformProvider = useMutation({
    mutationFn: (provider: PlatformProviderKey) => wealthApi.configuration.testProvider(provider),
    onSuccess: () => toast.success("Provider connection successful"),
    onError: (err) => toast.error(errorMessage(err)),
  });

  return {
    connect,
    completeOAuth,
    disconnect,
    sync,
    createHolding,
    updateConfiguration,
    importEnvConfiguration,
    deleteProviderCredentials,
    testPlatformProvider,
    invalidateAll,
  };
}

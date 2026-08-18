import { api } from "./client";
import type {
  CompleteOAuthInput,
  ConnectProviderInput,
  CreateHoldingInput,
  TriggerSyncInput,
  WealthAccount,
  WealthCashFlow,
  WealthConnectResult,
  WealthConnection,
  WealthHolding,
  WealthOverview,
  WealthPortfolio,
  WealthProviderDefinition,
  WealthProviderKey,
  WealthPlatformConfiguration,
  UpdatePlatformConfigurationInput,
  PlatformProviderKey,
  WealthSyncJob,
} from "./wealth-types";

/* Wealth service boundary: /api/v1/wealth/* */

type Raw = Record<string, unknown>;

const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : v == null ? fallback : String(v);

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const raw = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {});

function mapProviderBreakdown(v: unknown) {
  const o = raw(v);
  return {
    provider: str(o.provider) as WealthProviderKey,
    displayName: str(o.displayName),
    valueMinor: num(o.valueMinor),
  };
}

function mapOverview(data: unknown): WealthOverview {
  const o = raw(data);
  return {
    dataStatus: str(o.dataStatus, "no_connection") as WealthOverview["dataStatus"],
    totalInvestedMinor: num(o.totalInvestedMinor),
    currentValueMinor: num(o.currentValueMinor),
    totalPnlMinor: num(o.totalPnlMinor),
    pnlPercentage:
      typeof o.pnlPercentage === "number" ? o.pnlPercentage : Number(o.pnlPercentage) || 0,
    accounts: num(o.accounts),
    holdings: num(o.holdings),
    providers: Array.isArray(o.providers) ? o.providers.map(mapProviderBreakdown) : [],
    lastSyncedAt: o.lastSyncedAt ? str(o.lastSyncedAt) : null,
    currency: str(o.currency, "INR"),
  };
}

function mapPortfolioEnvelope(body: Raw): WealthPortfolio {
  const data = raw(body.data);
  const meta = raw(body.meta);
  return {
    data: {
      totalValueMinor: num(data.totalValueMinor),
      investedMinor: num(data.investedMinor),
      profitLossMinor: num(data.profitLossMinor),
      profitLossPercent:
        typeof data.profitLossPercent === "number"
          ? data.profitLossPercent
          : Number(data.profitLossPercent) || 0,
      holdingsCount: num(data.holdingsCount),
      accountsCount: num(data.accountsCount),
      lastUpdatedAt: data.lastUpdatedAt ? str(data.lastUpdatedAt) : null,
    },
    meta: {
      currency: str(meta.currency, "INR"),
      dataStatus: str(meta.dataStatus, "no_connection") as WealthPortfolio["meta"]["dataStatus"],
      lastSyncedAt: meta.lastSyncedAt ? str(meta.lastSyncedAt) : null,
    },
    breakdown: body.breakdown
      ? {
          equityMinor: num(raw(body.breakdown).equityMinor),
          mutualFundMinor: num(raw(body.breakdown).mutualFundMinor),
          etfMinor: num(raw(body.breakdown).etfMinor),
          otherMinor: num(raw(body.breakdown).otherMinor),
        }
      : undefined,
    providers: Array.isArray(body.providers) ? body.providers.map(mapProviderBreakdown) : undefined,
  };
}

function mapConnection(v: unknown): WealthConnection {
  const o = raw(v);
  return {
    id: str(o.id),
    provider: str(o.provider) as WealthProviderKey,
    status: str(o.status) as WealthConnection["status"],
    displayName: str(o.displayName),
    accountIdentifier: str(o.accountIdentifier) || undefined,
    capabilities: raw(o.capabilities) as WealthConnection["capabilities"],
    credentialsConfigured: Boolean(o.credentialsConfigured),
    lastSyncAt: o.lastSyncAt ? str(o.lastSyncAt) : null,
    lastSuccessfulSyncAt: o.lastSuccessfulSyncAt ? str(o.lastSuccessfulSyncAt) : null,
    lastSyncError: str(o.lastSyncError) || undefined,
    createdAt: str(o.createdAt),
    updatedAt: str(o.updatedAt),
  };
}

function mapPlatformConfiguration(v: unknown): WealthPlatformConfiguration {
  const o = raw(v);
  const providers = raw(o.providers);
  const zerodha = raw(providers.zerodha);
  const groww = raw(providers.groww);
  const sync = raw(o.sync);
  return {
    providers: {
      zerodha: {
        enabled: Boolean(zerodha.enabled),
        apiKeyConfigured: Boolean(zerodha.apiKeyConfigured),
        apiSecretConfigured: Boolean(zerodha.apiSecretConfigured),
        platformConfigured: Boolean(zerodha.platformConfigured),
      },
      groww: {
        enabled: Boolean(groww.enabled),
        apiKeyConfigured: Boolean(groww.apiKeyConfigured),
        apiSecretConfigured: Boolean(groww.apiSecretConfigured),
        platformConfigured: Boolean(groww.platformConfigured),
      },
    },
    marketData: { cacheTtl: num(raw(o.marketData).cacheTtl, 300) },
    sync: {
      scheduleCron: sync.scheduleCron ? str(sync.scheduleCron) : null,
      schedulePreset: str(sync.schedulePreset) || undefined,
    },
    envConfigDetected: Boolean(o.envConfigDetected),
    envConfigImported: Boolean(o.envConfigImported),
  };
}

function mapProvider(v: unknown): WealthProviderDefinition {
  const o = raw(v);
  return {
    key: str(o.key) as WealthProviderKey,
    displayName: str(o.displayName),
    description: str(o.description),
    country: str(o.country, "IN"),
    available: Boolean(o.available),
    platformConfigured: Boolean(o.platformConfigured),
    capabilities: raw(o.capabilities) as WealthProviderDefinition["capabilities"],
    credentialFields: Array.isArray(o.credentialFields)
      ? o.credentialFields.map((f) => {
          const field = raw(f);
          return {
            key: str(field.key),
            label: str(field.label),
            type: str(field.type, "text"),
            required: Boolean(field.required),
            description: str(field.description) || undefined,
          };
        })
      : [],
  };
}

function mapHolding(v: unknown): WealthHolding {
  const o = raw(v);
  const instrument = o.instrument ? mapInstrument(o.instrument) : undefined;
  return {
    id: str(o.id),
    ownerId: str(o.ownerId),
    accountId: str(o.accountId),
    instrumentId: str(o.instrumentId),
    quantity: typeof o.quantity === "number" ? o.quantity : Number(o.quantity) || 0,
    averageCostMinor: num(o.averageCostMinor),
    investedMinor: num(o.investedMinor),
    currency: str(o.currency, "INR"),
    currentPriceMinor: o.currentPriceMinor != null ? num(o.currentPriceMinor) : null,
    currentValueMinor: o.currentValueMinor != null ? num(o.currentValueMinor) : null,
    unrealizedPnlMinor: o.unrealizedPnlMinor != null ? num(o.unrealizedPnlMinor) : null,
    valueSource: str(o.valueSource) || undefined,
    source: str(o.source) || undefined,
    instrument,
    lastSyncedAt: o.lastSyncedAt ? str(o.lastSyncedAt) : null,
  };
}

function mapInstrument(v: unknown): WealthHolding["instrument"] {
  const o = raw(v);
  return {
    id: str(o.id),
    symbol: str(o.symbol),
    name: str(o.name),
    exchange: str(o.exchange) || undefined,
    instrumentType: str(o.instrumentType, "other") as WealthHolding["instrument"] extends infer T
      ? T extends { instrumentType: infer IT }
        ? IT
        : never
      : never,
    isin: str(o.isin) || undefined,
    currency: str(o.currency, "INR"),
  };
}

function mapAccount(v: unknown): WealthAccount {
  const o = raw(v);
  return {
    id: str(o.id),
    ownerId: str(o.ownerId),
    connectionId: str(o.connectionId),
    provider: str(o.provider) as WealthProviderKey,
    name: str(o.name),
    accountType: str(o.accountType),
    currency: str(o.currency, "INR"),
    status: str(o.status),
  };
}

function mapSyncJob(v: unknown): WealthSyncJob {
  const o = raw(v);
  return {
    id: str(o.id),
    ownerId: str(o.ownerId),
    connectionId: str(o.connectionId),
    provider: str(o.provider) as WealthProviderKey,
    mode: str(o.mode),
    status: str(o.status) as WealthSyncJob["status"],
    startedAt: o.startedAt ? str(o.startedAt) : null,
    completedAt: o.completedAt ? str(o.completedAt) : null,
    errorMessage: str(o.errorMessage) || undefined,
    stageErrors: Array.isArray(o.stageErrors)
      ? o.stageErrors.map((e) => {
          const s = raw(e);
          return { stage: str(s.stage), message: str(s.message) };
        })
      : undefined,
    accountsSynced: num(o.accountsSynced),
    holdingsSynced: num(o.holdingsSynced),
  };
}

function mapCashFlow(v: unknown): WealthCashFlow {
  const o = raw(v);
  return {
    month: str(o.month),
    currency: str(o.currency, "INR"),
    monthlyExpensesMinor: num(o.monthlyExpensesMinor),
    monthlyInvestmentsMinor:
      o.monthlyInvestmentsMinor != null ? num(o.monthlyInvestmentsMinor) : undefined,
    netCashFlowMinor: o.netCashFlowMinor != null ? num(o.netCashFlowMinor) : undefined,
  };
}

export const wealthApi = {
  overview: {
    get: async (): Promise<WealthOverview> => {
      const res = await api.get<unknown>("/wealth/overview");
      return mapOverview(res.data);
    },
  },
  portfolio: {
    get: async (): Promise<WealthPortfolio> => {
      const res = await api.get<Raw>("/wealth/portfolio");
      const summary = raw(res.data);
      const metaRaw = raw(res.meta ?? {});
      return {
        data: {
          totalValueMinor: num(summary.totalValueMinor),
          investedMinor: num(summary.investedMinor),
          profitLossMinor: num(summary.profitLossMinor),
          profitLossPercent:
            typeof summary.profitLossPercent === "number"
              ? summary.profitLossPercent
              : Number(summary.profitLossPercent) || 0,
          holdingsCount: num(summary.holdingsCount),
          accountsCount: num(summary.accountsCount),
          lastUpdatedAt: summary.lastUpdatedAt ? str(summary.lastUpdatedAt) : null,
        },
        meta: {
          currency: str(metaRaw.currency, "INR"),
          dataStatus: str(
            metaRaw.dataStatus,
            "no_connection",
          ) as WealthPortfolio["meta"]["dataStatus"],
          lastSyncedAt: metaRaw.lastSyncedAt ? str(metaRaw.lastSyncedAt) : null,
        },
      };
    },
  },
  cashFlow: {
    get: async (month?: string): Promise<WealthCashFlow> => {
      const res = await api.get<unknown>("/wealth/cash-flow", month ? { month } : undefined);
      return mapCashFlow(res.data);
    },
  },
  providers: {
    list: async (): Promise<WealthProviderDefinition[]> => {
      const res = await api.get<unknown[]>("/wealth/settings/providers");
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(mapProvider);
    },
  },
  connections: {
    list: async (): Promise<WealthConnection[]> => {
      const res = await api.get<unknown[]>("/wealth/settings/connections");
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(mapConnection);
    },
    connect: async (input: ConnectProviderInput): Promise<WealthConnectResult> => {
      const res = await api.post<Raw>("/wealth/settings/connections", input);
      const body = raw(res.data);
      return {
        connection: mapConnection(body.connection ?? body),
        loginUrl: str(body.loginUrl) || undefined,
        state: str(body.state) || undefined,
      };
    },
    disconnect: async (id: string): Promise<void> => {
      await api.post(`/wealth/settings/connections/${id}/disconnect`);
    },
    completeOAuth: async (
      provider: WealthProviderKey,
      input: CompleteOAuthInput,
    ): Promise<WealthConnectResult> => {
      const res = await api.post<Raw>(
        `/wealth/settings/providers/${provider}/oauth/callback`,
        input,
      );
      const body = raw(res.data);
      return {
        connection: mapConnection(body.connection ?? body),
      };
    },
  },
  sync: {
    trigger: async (input: TriggerSyncInput): Promise<WealthSyncJob> => {
      const res = await api.post<unknown>("/wealth/sync", input);
      return mapSyncJob(res.data);
    },
    listJobs: async (): Promise<WealthSyncJob[]> => {
      const res = await api.get<unknown[]>("/wealth/sync/jobs");
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(mapSyncJob);
    },
    getJob: async (id: string): Promise<WealthSyncJob> => {
      const res = await api.get<unknown>(`/wealth/sync/jobs/${id}`);
      return mapSyncJob(res.data);
    },
  },
  holdings: {
    list: async (accountId?: string): Promise<WealthHolding[]> => {
      const res = await api.get<unknown[]>(
        "/wealth/holdings",
        accountId ? { accountId } : undefined,
      );
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(mapHolding);
    },
    create: async (input: CreateHoldingInput): Promise<WealthHolding> => {
      const res = await api.post<unknown>("/wealth/holdings", input);
      return mapHolding(res.data);
    },
  },
  accounts: {
    list: async (connectionId?: string): Promise<WealthAccount[]> => {
      const res = await api.get<unknown[]>(
        "/wealth/accounts",
        connectionId ? { connectionId } : undefined,
      );
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(mapAccount);
    },
  },
  configuration: {
    get: async (): Promise<WealthPlatformConfiguration> => {
      const res = await api.get<unknown>("/wealth/settings/configuration");
      return mapPlatformConfiguration(res.data);
    },
    update: async (input: UpdatePlatformConfigurationInput): Promise<WealthPlatformConfiguration> => {
      const res = await api.put<unknown>("/wealth/settings/configuration", input);
      return mapPlatformConfiguration(res.data);
    },
    deleteProvider: async (provider: PlatformProviderKey): Promise<WealthPlatformConfiguration> => {
      const res = await api.delete<unknown>(`/wealth/settings/configuration/${provider}`);
      return mapPlatformConfiguration(res.data);
    },
    importEnv: async (): Promise<WealthPlatformConfiguration> => {
      const res = await api.post<unknown>("/wealth/settings/configuration/import-env");
      return mapPlatformConfiguration(res.data);
    },
    testProvider: async (provider: PlatformProviderKey): Promise<void> => {
      await api.post(`/wealth/settings/providers/${provider}/platform-test`);
    },
  },
};

/** Wealth module API types — aligned with Personal-OS-backend domain JSON tags. */

export type WealthDataStatus =
  | "ready"
  | "no_connection"
  | "no_data"
  | "sync_pending"
  | "syncing"
  | "partial"
  | "sync_error"
  | "error";

export type WealthProviderKey =
  "manual" | "zerodha_kite" | "groww_holdings" | "groww_holdings_portal";

export type ConnectionStatus =
  | "pending"
  | "connected"
  | "syncing"
  | "connected_with_errors"
  | "error"
  | "auth_expired"
  | "disconnected";

export type SyncJobStatus = "pending" | "running" | "completed" | "partial" | "failed";

export type InstrumentType = "equity" | "mutual_fund" | "etf" | "bond" | "other";

export type WealthOverview = {
  dataStatus: WealthDataStatus;
  totalInvestedMinor: number;
  currentValueMinor: number;
  totalPnlMinor: number;
  pnlPercentage: number;
  accounts: number;
  holdings: number;
  providers: WealthProviderBreakdown[];
  lastSyncedAt?: string | null;
  currency: string;
};

export type WealthPortfolioMeta = {
  currency: string;
  dataStatus: WealthDataStatus;
  lastSyncedAt?: string | null;
};

export type WealthPortfolioSummary = {
  totalValueMinor: number;
  investedMinor: number;
  profitLossMinor: number;
  profitLossPercent: number;
  holdingsCount: number;
  accountsCount: number;
  lastUpdatedAt?: string | null;
};

export type WealthPortfolioBreakdown = {
  equityMinor: number;
  mutualFundMinor: number;
  etfMinor: number;
  otherMinor: number;
};

export type WealthProviderBreakdown = {
  provider: WealthProviderKey;
  displayName: string;
  valueMinor: number;
};

export type WealthPortfolio = {
  data: WealthPortfolioSummary;
  meta: WealthPortfolioMeta;
  breakdown?: WealthPortfolioBreakdown;
  providers?: WealthProviderBreakdown[];
};

export type WealthCashFlow = {
  month: string;
  currency: string;
  monthlyExpensesMinor: number;
  monthlyInvestmentsMinor?: number;
  netCashFlowMinor?: number;
};

export type WealthProviderCapabilities = {
  supportsStocks?: boolean;
  supportsMutualFunds?: boolean;
  supportsHoldings?: boolean;
  supportsTransactions?: boolean;
  supportsOAuth?: boolean;
  supportsManualEntry?: boolean;
  supportsPortfolio?: boolean;
};

export type WealthCredentialField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
};

export type WealthProviderDefinition = {
  key: WealthProviderKey;
  displayName: string;
  description: string;
  country: string;
  available: boolean;
  platformConfigured?: boolean;
  capabilities: WealthProviderCapabilities;
  credentialFields?: WealthCredentialField[];
};

export type PlatformProviderKey = "zerodha" | "groww";

export type WealthPlatformProviderView = {
  enabled: boolean;
  apiKeyConfigured: boolean;
  apiSecretConfigured: boolean;
  platformConfigured: boolean;
};

export type WealthPlatformConfiguration = {
  providers: {
    zerodha: WealthPlatformProviderView;
    groww: WealthPlatformProviderView;
  };
  marketData: { cacheTtl: number };
  sync: { scheduleCron: string | null; schedulePreset?: string };
  envConfigDetected: boolean;
  envConfigImported: boolean;
};

export type UpdatePlatformProviderInput = {
  enabled?: boolean;
  apiKey?: string;
  apiSecret?: string;
};

export type UpdatePlatformConfigurationInput = {
  zerodha?: UpdatePlatformProviderInput;
  groww?: UpdatePlatformProviderInput;
  marketData?: { cacheTtl: number };
  sync?: { scheduleCron?: string; schedulePreset?: string };
};

export type SyncSchedulePreset =
  | "disabled"
  | "hourly"
  | "every_6_hours"
  | "every_12_hours"
  | "daily";

export const MARKET_DATA_CACHE_OPTIONS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
] as const;

export const SYNC_SCHEDULE_OPTIONS: { label: string; value: SyncSchedulePreset }[] = [
  { label: "Disabled", value: "disabled" },
  { label: "Every hour", value: "hourly" },
  { label: "Every 6 hours", value: "every_6_hours" },
  { label: "Every 12 hours", value: "every_12_hours" },
  { label: "Daily", value: "daily" },
];

export type WealthConnection = {
  id: string;
  provider: WealthProviderKey;
  status: ConnectionStatus;
  displayName: string;
  accountIdentifier?: string;
  capabilities: WealthProviderCapabilities;
  credentialsConfigured: boolean;
  lastSyncAt?: string | null;
  lastSuccessfulSyncAt?: string | null;
  lastSyncError?: string;
  createdAt: string;
  updatedAt: string;
};

export type WealthConnectResult = {
  connection: WealthConnection;
  loginUrl?: string;
  state?: string;
};

export type WealthInstrument = {
  id: string;
  symbol: string;
  name: string;
  exchange?: string;
  instrumentType: InstrumentType;
  isin?: string;
  currency: string;
};

export type WealthHolding = {
  id: string;
  ownerId: string;
  accountId: string;
  instrumentId: string;
  quantity: number;
  averageCostMinor: number;
  investedMinor: number;
  currency: string;
  currentPriceMinor?: number | null;
  currentValueMinor?: number | null;
  unrealizedPnlMinor?: number | null;
  valueSource?: string;
  source?: string;
  instrument?: WealthInstrument;
  lastSyncedAt?: string | null;
};

export type WealthAccount = {
  id: string;
  ownerId: string;
  connectionId: string;
  provider: WealthProviderKey;
  name: string;
  accountType: string;
  currency: string;
  status: string;
};

export type WealthSyncJob = {
  id: string;
  ownerId: string;
  connectionId: string;
  provider: WealthProviderKey;
  mode: string;
  status: SyncJobStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string;
  stageErrors?: { stage: string; message: string }[];
  accountsSynced?: number;
  holdingsSynced?: number;
};

export type ConnectProviderInput = {
  provider: WealthProviderKey;
  displayName?: string;
  credentials?: Record<string, string>;
};

export type TriggerSyncInput = {
  connectionId: string;
  mode?: "initial" | "incremental" | "historical";
};

export type CreateHoldingInput = {
  accountId: string;
  symbol: string;
  name?: string;
  isin?: string;
  instrumentType?: InstrumentType;
  exchange?: string;
  quantity: number;
  averageCostMinor?: number;
  investedMinor: number;
  currency?: string;
};

export type CompleteOAuthInput = {
  requestToken: string;
  state?: string;
  connectionId?: string;
};

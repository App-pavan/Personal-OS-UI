import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { FuturisticButton, SemanticBadge } from "@/components/future";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  PlatformProviderKey,
  SyncSchedulePreset,
  UpdatePlatformConfigurationInput,
  WealthPlatformConfiguration,
  WealthPlatformProviderView,
} from "@/lib/api/wealth-types";
import {
  MARKET_DATA_CACHE_OPTIONS,
  SYNC_SCHEDULE_OPTIONS,
} from "@/lib/api/wealth-types";
import { useWealthConfiguration, useWealthMutations } from "@/hooks/use-wealth";
import { cn } from "@/lib/utils";

type ProviderDraft = {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
};

function ConfiguredMask({ configured }: { configured: boolean }) {
  if (!configured) {
    return <span className="text-xs text-muted-foreground">Not configured</span>;
  }
  return (
    <span className="text-xs text-muted-foreground">
      ••••••••••••••{" "}
      <SemanticBadge tone="success" className="ml-1 inline-flex">
        Configured
      </SemanticBadge>
    </span>
  );
}

function ProviderCredentialsForm({
  name,
  description,
  view,
  draft,
  onDraftChange,
  onTest,
  onClear,
  testing,
  clearing,
}: {
  name: string;
  description: string;
  view: WealthPlatformProviderView;
  draft: ProviderDraft;
  onDraftChange: (next: ProviderDraft) => void;
  onTest: () => void;
  onClear: () => void;
  testing: boolean;
  clearing: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-lg border border-hairline/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{name}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${name}-enabled`} className="text-xs text-muted-foreground">
            Enabled
          </Label>
          <Switch
            id={`${name}-enabled`}
            checked={draft.enabled}
            onCheckedChange={(enabled) => onDraftChange({ ...draft, enabled })}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <Label className="text-xs">API Key</Label>
          {editing || !view.apiKeyConfigured ? (
            <Input
              type="text"
              autoComplete="off"
              placeholder={view.apiKeyConfigured ? "Enter new API key" : "API key"}
              value={draft.apiKey}
              onChange={(e) => onDraftChange({ ...draft, apiKey: e.target.value })}
              className="mt-1.5"
            />
          ) : (
            <div className="mt-1.5">
              <ConfiguredMask configured={view.apiKeyConfigured} />
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs">API Secret</Label>
          {editing || !view.apiSecretConfigured ? (
            <Input
              type="password"
              autoComplete="new-password"
              placeholder={view.apiSecretConfigured ? "Enter new API secret" : "API secret"}
              value={draft.apiSecret}
              onChange={(e) => onDraftChange({ ...draft, apiSecret: e.target.value })}
              className="mt-1.5"
            />
          ) : (
            <div className="mt-1.5">
              <ConfiguredMask configured={view.apiSecretConfigured} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {view.platformConfigured && !editing ? (
          <FuturisticButton variant="ghost" className="text-xs" onClick={() => setEditing(true)}>
            Update credentials
          </FuturisticButton>
        ) : null}
        {(editing || !view.platformConfigured) && view.platformConfigured ? (
          <FuturisticButton variant="ghost" className="text-xs" onClick={() => setEditing(false)}>
            Cancel
          </FuturisticButton>
        ) : null}
        <FuturisticButton
          variant="ghost"
          className="text-xs"
          disabled={!view.platformConfigured || testing}
          onClick={onTest}
        >
          {testing ? (
            <>
              <Loader2 className="mr-1 size-3 animate-spin" /> Testing…
            </>
          ) : (
            "Test connection"
          )}
        </FuturisticButton>
        {view.platformConfigured ? (
          <FuturisticButton
            variant="ghost"
            className="text-xs text-destructive"
            disabled={clearing}
            onClick={onClear}
          >
            Remove credentials
          </FuturisticButton>
        ) : null}
      </div>
    </div>
  );
}

function draftFromConfig(cfg: WealthPlatformConfiguration): {
  zerodha: ProviderDraft;
  groww: ProviderDraft;
  cacheTtl: number;
  syncPreset: SyncSchedulePreset;
} {
  return {
    zerodha: { enabled: cfg.providers.zerodha.enabled, apiKey: "", apiSecret: "" },
    groww: { enabled: cfg.providers.groww.enabled, apiKey: "", apiSecret: "" },
    cacheTtl: cfg.marketData.cacheTtl,
    syncPreset: (cfg.sync.schedulePreset as SyncSchedulePreset) || "disabled",
  };
}

function buildUpdatePayload(
  draft: ReturnType<typeof draftFromConfig>,
): UpdatePlatformConfigurationInput {
  const payload: UpdatePlatformConfigurationInput = {
    zerodha: { enabled: draft.zerodha.enabled },
    groww: { enabled: draft.groww.enabled },
    marketData: { cacheTtl: draft.cacheTtl },
    sync: { schedulePreset: draft.syncPreset },
  };
  if (draft.zerodha.apiKey) payload.zerodha!.apiKey = draft.zerodha.apiKey;
  if (draft.zerodha.apiSecret) payload.zerodha!.apiSecret = draft.zerodha.apiSecret;
  if (draft.groww.apiKey) payload.groww!.apiKey = draft.groww.apiKey;
  if (draft.groww.apiSecret) payload.groww!.apiSecret = draft.groww.apiSecret;
  return payload;
}

export function WealthSettingsSection() {
  const configQuery = useWealthConfiguration();
  const mutations = useWealthMutations();
  const [draft, setDraft] = useState<ReturnType<typeof draftFromConfig> | null>(null);
  const [testingProvider, setTestingProvider] = useState<PlatformProviderKey | null>(null);

  useEffect(() => {
    if (configQuery.data && !draft) {
      setDraft(draftFromConfig(configQuery.data));
    }
  }, [configQuery.data, draft]);

  useEffect(() => {
    if (configQuery.data) {
      setDraft((prev) => {
        const base = draftFromConfig(configQuery.data!);
        if (!prev) return base;
        return {
          ...base,
          zerodha: { ...base.zerodha, apiKey: prev.zerodha.apiKey, apiSecret: prev.zerodha.apiSecret },
          groww: { ...base.groww, apiKey: prev.groww.apiKey, apiSecret: prev.groww.apiSecret },
          cacheTtl: prev.cacheTtl,
          syncPreset: prev.syncPreset,
        };
      });
    }
  }, [configQuery.data]);

  if (configQuery.isLoading) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading Wealth configuration…
      </p>
    );
  }

  if (configQuery.isError || !configQuery.data || !draft) {
    return (
      <p className="py-4 text-sm text-destructive">
        Unable to load Wealth configuration. Check your backend connection.
      </p>
    );
  }

  const cfg = configQuery.data;

  const handleSave = () => {
    mutations.updateConfiguration.mutate(buildUpdatePayload(draft), {
      onSuccess: () => {
        setDraft((d) =>
          d
            ? {
                ...d,
                zerodha: { ...d.zerodha, apiKey: "", apiSecret: "" },
                groww: { ...d.groww, apiKey: "", apiSecret: "" },
              }
            : d,
        );
      },
    });
  };

  const handleTest = async (provider: PlatformProviderKey) => {
    setTestingProvider(provider);
    try {
      await mutations.updateConfiguration.mutateAsync(buildUpdatePayload(draft));
      await mutations.testPlatformProvider.mutateAsync(provider);
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      {cfg.envConfigDetected && !cfg.envConfigImported ? (
        <div className="rounded-lg border border-primary/30 bg-primary-soft/30 p-4">
          <p className="text-sm font-medium">Environment configuration detected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Provider credentials from environment variables can be imported into UI-managed storage.
            Values are never displayed.
          </p>
          <FuturisticButton
            className="mt-3 text-xs"
            disabled={mutations.importEnvConfiguration.isPending}
            onClick={() => mutations.importEnvConfiguration.mutate()}
          >
            {mutations.importEnvConfiguration.isPending ? "Importing…" : "Import configuration"}
          </FuturisticButton>
        </div>
      ) : null}

      <ProviderCredentialsForm
        name="Zerodha"
        description="Connect your Zerodha account and synchronize portfolio and positions via Kite Connect."
        view={cfg.providers.zerodha}
        draft={draft.zerodha}
        onDraftChange={(zerodha) => setDraft({ ...draft, zerodha })}
        onTest={() => void handleTest("zerodha")}
        onClear={() => mutations.deleteProviderCredentials.mutate("zerodha")}
        testing={testingProvider === "zerodha"}
        clearing={mutations.deleteProviderCredentials.isPending}
      />

      <ProviderCredentialsForm
        name="Groww"
        description="Default Groww Trade API credentials. Users can also supply their own at connection time."
        view={cfg.providers.groww}
        draft={draft.groww}
        onDraftChange={(groww) => setDraft({ ...draft, groww })}
        onTest={() => void handleTest("groww")}
        onClear={() => mutations.deleteProviderCredentials.mutate("groww")}
        testing={testingProvider === "groww"}
        clearing={mutations.deleteProviderCredentials.isPending}
      />

      <div className="rounded-lg border border-hairline/50 p-4">
        <p className="text-sm font-medium">Synchronization</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Automatic synchronization</Label>
            <Select
              value={draft.syncPreset}
              onValueChange={(v) =>
                setDraft({ ...draft, syncPreset: v as SyncSchedulePreset })
              }
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYNC_SCHEDULE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Market data refresh</Label>
            <Select
              value={String(draft.cacheTtl)}
              onValueChange={(v) => setDraft({ ...draft, cacheTtl: Number(v) })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKET_DATA_CACHE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FuturisticButton
          disabled={mutations.updateConfiguration.isPending}
          onClick={handleSave}
        >
          {mutations.updateConfiguration.isPending ? (
            <>
              <Loader2 className="mr-1 size-3 animate-spin" /> Saving…
            </>
          ) : (
            "Save changes"
          )}
        </FuturisticButton>
        {mutations.updateConfiguration.isSuccess ? (
          <span className={cn("text-xs text-primary")}>✓ Configuration saved</span>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Credentials are encrypted server-side. Secrets are never stored in the browser or returned
        from the API.
      </p>
    </div>
  );
}

export function WealthSettingsRow() {
  return (
    <div className="flex flex-wrap items-start gap-3 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <TrendingUp className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Wealth</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          Manage investment providers and Wealth preferences.
        </p>
        <div className="mt-4">
          <WealthSettingsSection />
        </div>
      </div>
    </div>
  );
}

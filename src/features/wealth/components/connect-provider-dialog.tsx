import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FuturisticButton } from "@/components/future";
import type { WealthProviderDefinition, WealthProviderKey } from "@/lib/api/wealth-types";

export function ConnectProviderDialog({
  open,
  provider,
  onOpenChange,
  onConnect,
  loading,
}: {
  open: boolean;
  provider: WealthProviderDefinition | null;
  onOpenChange: (open: boolean) => void;
  onConnect: (credentials: Record<string, string>) => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setValues({});
  }, [open, provider?.key]);

  if (!provider) return null;

  const isOAuth = provider.capabilities.supportsOAuth;
  const fields = provider.credentialFields ?? [];

  const handleOAuth = () => {
    onConnect({});
  };

  const handleSubmit = () => {
    onConnect(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {provider.displayName}</DialogTitle>
          <DialogDescription>{provider.description}</DialogDescription>
        </DialogHeader>

        {isOAuth && fields.every((f) => !f.required) ? (
          <p className="text-sm text-muted-foreground">
            You will be redirected to {provider.displayName} to authorize access. Credentials are
            stored securely on the server — never in your browser.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type === "password" ? "password" : "text"}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={field.description}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <FuturisticButton variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </FuturisticButton>
          {isOAuth && fields.every((f) => !f.required) ? (
            <FuturisticButton onClick={handleOAuth} disabled={loading}>
              Continue to {provider.displayName}
            </FuturisticButton>
          ) : (
            <FuturisticButton onClick={handleSubmit} disabled={loading}>
              Connect
            </FuturisticButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function providerByKey(
  providers: WealthProviderDefinition[],
  key: WealthProviderKey,
): WealthProviderDefinition | null {
  return providers.find((p) => p.key === key) ?? null;
}

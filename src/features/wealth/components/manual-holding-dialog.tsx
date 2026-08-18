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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FuturisticButton } from "@/components/future";
import type { WealthAccount, WealthConnection } from "@/lib/api/wealth-types";
import { inputToMinor } from "@/lib/money";

export function ManualHoldingDialog({
  open,
  onOpenChange,
  connections,
  accounts,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connections: WealthConnection[];
  accounts: WealthAccount[];
  onSubmit: (input: {
    accountId: string;
    symbol: string;
    name: string;
    exchange: string;
    quantity: number;
    investedMinor: number;
    averageCostMinor: number;
  }) => void;
  loading?: boolean;
}) {
  const manualAccounts = accounts.filter((a) => a.provider === "manual");
  const [accountId, setAccountId] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [exchange, setExchange] = useState("NSE");
  const [quantity, setQuantity] = useState("1");
  const [invested, setInvested] = useState("");

  useEffect(() => {
    if (open && manualAccounts.length && !accountId) {
      setAccountId(manualAccounts[0]!.id);
    }
  }, [open, manualAccounts, accountId]);

  const hasManual = connections.some((c) => c.provider === "manual") || manualAccounts.length > 0;

  const handleSubmit = () => {
    const qty = Number(quantity);
    const investedMinor = inputToMinor(invested, "INR");
    if (
      !accountId ||
      !symbol.trim() ||
      !Number.isFinite(qty) ||
      qty <= 0 ||
      investedMinor == null
    ) {
      return;
    }
    const avg = Math.round(investedMinor / qty);
    onSubmit({
      accountId,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim(),
      exchange: exchange.trim(),
      quantity: qty,
      investedMinor,
      averageCostMinor: avg,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add investment manually</DialogTitle>
          <DialogDescription>
            {hasManual
              ? "Enter holding details. Values are stored in your manual portfolio."
              : "A manual portfolio connection will be created automatically."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {manualAccounts.length > 1 ? (
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {manualAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="RELIANCE"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exchange">Exchange</Label>
              <Input
                id="exchange"
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                placeholder="NSE"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reliance Industries"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invested">Invested (₹)</Label>
              <Input
                id="invested"
                inputMode="decimal"
                value={invested}
                onChange={(e) => setInvested(e.target.value)}
                placeholder="25000"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <FuturisticButton variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </FuturisticButton>
          <FuturisticButton onClick={handleSubmit} disabled={loading}>
            Add holding
          </FuturisticButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

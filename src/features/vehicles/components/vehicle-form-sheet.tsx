import { useEffect, useState } from "react";
import type { Vehicle, VehicleType, VehicleWriteInput, FuelType } from "@/lib/api/vehicle-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { GlassButton, GlassInput } from "@/features/expenses/components/glass";

const vehicleTypes: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "truck", label: "Truck" },
  { value: "other", label: "Other" },
];

const fuelTypes: { value: FuelType; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "other", label: "Other" },
];

export function VehicleFormSheet({
  open,
  onOpenChange,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Vehicle | null;
  onSubmit: (input: VehicleWriteInput & { allowOdometerCorrection?: boolean }) => void;
  pending?: boolean;
}) {
  const [name, setName] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [odometer, setOdometer] = useState("");
  const [registration, setRegistration] = useState("");
  const [chassis, setChassis] = useState("");
  const [engine, setEngine] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseOdometer, setPurchaseOdometer] = useState("");
  const [serviceIntervalKm, setServiceIntervalKm] = useState("");
  const [serviceIntervalMonths, setServiceIntervalMonths] = useState("");
  const [notes, setNotes] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("petrol");
  const [allowCorrection, setAllowCorrection] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setVehicleType(initial?.vehicleType ?? "car");
    setMake(initial?.make ?? "");
    setModel(initial?.model ?? "");
    setOdometer(initial ? String(initial.currentOdometerKm) : "");
    setRegistration(initial?.registrationNumber ?? "");
    setChassis(initial?.chassisNumber ?? "");
    setEngine(initial?.engineNumber ?? "");
    setModelYear(initial?.modelYear != null ? String(initial.modelYear) : "");
    setPurchaseDate(initial?.purchaseDate?.slice(0, 10) ?? "");
    setPurchasePrice(
      initial?.purchasePriceMinor != null ? String(Math.round(initial.purchasePriceMinor / 100)) : "",
    );
    setPurchaseOdometer(
      initial?.purchaseOdometerKm != null ? String(initial.purchaseOdometerKm) : "",
    );
    setServiceIntervalKm(
      initial?.serviceIntervalKm != null ? String(initial.serviceIntervalKm) : "",
    );
    setServiceIntervalMonths(
      initial?.serviceIntervalMonths != null ? String(initial.serviceIntervalMonths) : "",
    );
    setNotes(initial?.notes ?? "");
    setFuelType(initial?.fuelType ?? "petrol");
    setAllowCorrection(false);
  }, [open, initial]);

  const save = () => {
    const km = Number(odometer);
    if (!name.trim() || !make.trim() || !model.trim() || !Number.isFinite(km)) return;
    const year = modelYear.trim() ? Number(modelYear) : undefined;
    const priceRupees = purchasePrice.trim() ? Number(purchasePrice) : undefined;
    const purchaseKm = purchaseOdometer.trim() ? Number(purchaseOdometer) : undefined;
    const intervalKm = serviceIntervalKm.trim() ? Number(serviceIntervalKm) : undefined;
    const intervalMonths = serviceIntervalMonths.trim() ? Number(serviceIntervalMonths) : undefined;
    onSubmit({
      name: name.trim(),
      vehicleType,
      make: make.trim(),
      model: model.trim(),
      currentOdometerKm: Math.trunc(km),
      registrationNumber: registration.trim() || undefined,
      chassisNumber: chassis.trim() || undefined,
      engineNumber: engine.trim() || undefined,
      modelYear: year != null && Number.isFinite(year) ? Math.trunc(year) : undefined,
      purchaseDate: purchaseDate.trim() || undefined,
      purchasePriceMinor:
        priceRupees != null && Number.isFinite(priceRupees)
          ? Math.round(priceRupees * 100)
          : undefined,
      purchaseOdometerKm:
        purchaseKm != null && Number.isFinite(purchaseKm) ? Math.trunc(purchaseKm) : undefined,
      fuelType,
      serviceIntervalKm:
        intervalKm != null && Number.isFinite(intervalKm) ? Math.trunc(intervalKm) : undefined,
      serviceIntervalMonths:
        intervalMonths != null && Number.isFinite(intervalMonths)
          ? Math.trunc(intervalMonths)
          : undefined,
      notes: notes.trim() || undefined,
      ...(initial && allowCorrection ? { allowOdometerCorrection: true } : {}),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{initial ? "Edit vehicle" : "Add vehicle"}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Vehicle name *</span>
            <GlassInput value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Type *</span>
            <select
              className="h-10 w-full rounded-md border border-hairline bg-transparent px-2 text-sm"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
            >
              {vehicleTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Fuel type</span>
            <select
              className="h-10 w-full rounded-md border border-hairline bg-transparent px-2 text-sm"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
            >
              {fuelTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Make *</span>
            <GlassInput value={make} onChange={(e) => setMake(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Model *</span>
            <GlassInput value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Current odometer (km) *</span>
            <GlassInput inputMode="numeric" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Registration</span>
            <GlassInput value={registration} onChange={(e) => setRegistration(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Model year</span>
            <GlassInput inputMode="numeric" value={modelYear} onChange={(e) => setModelYear(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Chassis number</span>
            <GlassInput value={chassis} onChange={(e) => setChassis(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Engine number</span>
            <GlassInput value={engine} onChange={(e) => setEngine(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Purchase date</span>
            <GlassInput type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Purchase price (₹)</span>
            <GlassInput inputMode="decimal" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Odometer at purchase (km)</span>
            <GlassInput
              inputMode="numeric"
              value={purchaseOdometer}
              onChange={(e) => setPurchaseOdometer(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Service interval (km)</span>
            <GlassInput
              inputMode="numeric"
              value={serviceIntervalKm}
              onChange={(e) => setServiceIntervalKm(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Service interval (months)</span>
            <GlassInput
              inputMode="numeric"
              value={serviceIntervalMonths}
              onChange={(e) => setServiceIntervalMonths(e.target.value)}
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Notes</span>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </label>
          {initial ? (
            <label className="flex items-center gap-2 sm:col-span-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={allowCorrection} onChange={(e) => setAllowCorrection(e.target.checked)} />
              Allow odometer correction below previous readings
            </label>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <GlassButton variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </GlassButton>
          <GlassButton onClick={save} disabled={pending}>
            {initial ? "Save" : "Create"}
          </GlassButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}

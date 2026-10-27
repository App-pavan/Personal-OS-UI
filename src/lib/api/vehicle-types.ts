export type VehicleType = "car" | "motorcycle" | "truck" | "other";
export type FuelType = "petrol" | "diesel" | "cng" | "electric" | "hybrid" | "other" | "";
export type ServiceType = "periodic" | "repair" | "inspection" | "tyre" | "other";
export type DocumentType = "registration" | "insurance" | "puc" | "purchase_invoice" | "other";
export type MaintenanceStatus = "ok" | "due_soon" | "overdue" | "unknown";

export type Vehicle = {
  id: string;
  ownerId: string;
  name: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  currentOdometerKm: number;
  registrationNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  modelYear?: number;
  purchaseDate?: string;
  purchasePriceMinor?: number;
  purchaseOdometerKm?: number;
  fuelType?: FuelType;
  photoStorageKey?: string;
  serviceIntervalKm?: number;
  serviceIntervalMonths?: number;
  notes?: string;
  currency: string;
};

export type VehicleListItem = {
  vehicle: Vehicle;
  lastServiceDate?: string;
  lastServiceOdometerKm?: number;
  nextServiceDate?: string;
  nextServiceOdometerKm?: number;
  maintenanceStatus: MaintenanceStatus;
};

export type VehicleWriteInput = {
  name: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  currentOdometerKm: number;
  registrationNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  modelYear?: number;
  purchaseDate?: string;
  purchasePriceMinor?: number;
  purchaseOdometerKm?: number;
  fuelType?: FuelType;
  photoStorageKey?: string;
  serviceIntervalKm?: number;
  serviceIntervalMonths?: number;
  notes?: string;
  currency?: string;
};

export type ServiceRecord = {
  id: string;
  vehicleId: string;
  serviceDate: string;
  odometerKm: number;
  serviceCenter: string;
  serviceType: ServiceType;
  serviceTypeOther?: string;
  amountMinor: number;
  currency: string;
  invoiceStorageKey?: string;
  nextServiceDate?: string;
  nextServiceOdometerKm?: number;
  workPerformed?: string;
  notes?: string;
  expenseTransactionId?: string;
};

export type FuelRecord = {
  id: string;
  vehicleId: string;
  occurredAt: string;
  odometerKm: number;
  liters: number;
  amountMinor: number;
  currency: string;
  fuelType?: FuelType;
  fuelStation?: string;
  fullTank: boolean;
  receiptStorageKey?: string;
  expenseTransactionId?: string;
};

export type VehicleDocument = {
  id: string;
  vehicleId: string;
  documentType: DocumentType;
  name: string;
  issueDate?: string;
  expiryDate?: string;
  storageKey: string;
  contentType?: string;
};

export type VehicleOverview = {
  vehicle: Vehicle;
  currentOdometerKm: number;
  lastService?: ServiceRecord;
  nextServiceDate?: string;
  nextServiceOdometerKm?: number;
  maintenanceStatus: MaintenanceStatus;
  fuelEconomyKmPerL?: number | null;
  expenses: {
    fuelMinor: number;
    serviceMinor: number;
    totalMinor: number;
    currency: string;
    monthMinor: number;
    yearMinor: number;
  };
  documentReminders: {
    documentId: string;
    name: string;
    documentType: DocumentType;
    expiryDate: string;
    status: "upcoming" | "expired";
  }[];
  recentActivity: {
    kind: string;
    title: string;
    timestamp: string;
    amountMinor?: number;
    currency?: string;
  }[];
};

export type PresignUploadResult = {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
};

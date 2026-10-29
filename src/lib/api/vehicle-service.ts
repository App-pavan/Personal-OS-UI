import { api } from "./client";
import type {
  FuelRecord,
  PresignUploadResult,
  ServiceRecord,
  Vehicle,
  VehicleDocument,
  VehicleListItem,
  VehicleOverview,
  VehicleUpdateInput,
  VehicleWriteInput,
} from "./vehicle-types";

const BASE = "/vehicles";

/** HTML date inputs send YYYY-MM-DD; API accepts that or RFC3339. */
function normalizeCalendarDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  return trimmed;
}

function normalizeVehicleDates<T extends { purchaseDate?: string }>(input: T): T {
  const purchaseDate = normalizeCalendarDate(input.purchaseDate);
  if (purchaseDate === input.purchaseDate) return input;
  return { ...input, purchaseDate };
}

export const vehicleApi = {
  list: () => api.get<VehicleListItem[]>(BASE).then((r) => r.data ?? []),
  get: (id: string) => api.get<Vehicle>(`${BASE}/${id}`).then((r) => r.data),
  create: (input: VehicleWriteInput) =>
    api.post<Vehicle>(BASE, normalizeVehicleDates(input)).then((r) => r.data),
  update: (id: string, input: VehicleUpdateInput) =>
    api.patch<Vehicle>(`${BASE}/${id}`, normalizeVehicleDates(input)).then((r) => r.data),
  remove: (id: string) => api.delete(`${BASE}/${id}`),
  overview: (id: string) => api.get<VehicleOverview>(`${BASE}/${id}/overview`).then((r) => r.data),

  services: {
    list: (vehicleId: string) =>
      api.get<ServiceRecord[]>(`${BASE}/${vehicleId}/services`).then((r) => r.data ?? []),
    create: (vehicleId: string, input: Omit<ServiceRecord, "id" | "vehicleId"> & { syncExpense?: boolean; allowOdometerCorrection?: boolean }) =>
      api.post<ServiceRecord>(`${BASE}/${vehicleId}/services`, input).then((r) => r.data),
    remove: (vehicleId: string, serviceId: string) =>
      api.delete(`${BASE}/${vehicleId}/services/${serviceId}`),
  },

  fuel: {
    list: (vehicleId: string) =>
      api.get<FuelRecord[]>(`${BASE}/${vehicleId}/fuel`).then((r) => r.data ?? []),
    create: (vehicleId: string, input: Omit<FuelRecord, "id" | "vehicleId"> & { syncExpense?: boolean; allowOdometerCorrection?: boolean }) =>
      api.post<FuelRecord>(`${BASE}/${vehicleId}/fuel`, input).then((r) => r.data),
    remove: (vehicleId: string, fuelId: string) => api.delete(`${BASE}/${vehicleId}/fuel/${fuelId}`),
  },

  documents: {
    list: (vehicleId: string) =>
      api.get<VehicleDocument[]>(`${BASE}/${vehicleId}/documents`).then((r) => r.data ?? []),
    create: (vehicleId: string, input: Omit<VehicleDocument, "id" | "vehicleId">) =>
      api.post<VehicleDocument>(`${BASE}/${vehicleId}/documents`, input).then((r) => r.data),
    remove: (vehicleId: string, documentId: string) =>
      api.delete(`${BASE}/${vehicleId}/documents/${documentId}`),
  },

  files: {
    presignUpload: (vehicleId: string, body: { filename: string; contentType: string; purpose: string }) =>
      api.post<PresignUploadResult>(`${BASE}/${vehicleId}/files/presign-upload`, body).then((r) => r.data),
    downloadUrl: (vehicleId: string, storageKey: string) =>
      api
        .get<{ downloadUrl: string }>(`${BASE}/${vehicleId}/files/download-url`, { storageKey })
        .then((r) => r.data?.downloadUrl ?? ""),
  },
};

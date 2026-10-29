import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCapabilities } from "@/features/capabilities/capabilities-context";
import { vehicleApi } from "@/lib/api/vehicle-service";
import { errorMessage } from "@/lib/api/errors";
import { PERM } from "@/lib/permissions";
import type { VehicleUpdateInput, VehicleWriteInput } from "@/lib/api/vehicle-types";
import { toast } from "sonner";

export const vehicleKeys = {
  all: ["vehicles"] as const,
  list: ["vehicles", "list"] as const,
  detail: (id: string) => ["vehicles", "detail", id] as const,
  overview: (id: string) => ["vehicles", "overview", id] as const,
  services: (id: string) => ["vehicles", "services", id] as const,
  fuel: (id: string) => ["vehicles", "fuel", id] as const,
  documents: (id: string) => ["vehicles", "documents", id] as const,
};

function invalidateVehicle(qc: ReturnType<typeof useQueryClient>, id?: string) {
  void qc.invalidateQueries({ queryKey: vehicleKeys.list });
  if (id) {
    void qc.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
    void qc.invalidateQueries({ queryKey: vehicleKeys.overview(id) });
    void qc.invalidateQueries({ queryKey: vehicleKeys.services(id) });
    void qc.invalidateQueries({ queryKey: vehicleKeys.fuel(id) });
    void qc.invalidateQueries({ queryKey: vehicleKeys.documents(id) });
  }
}

export function useVehicles() {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: vehicleKeys.list,
    queryFn: () => vehicleApi.list(),
    enabled: isReady && can(PERM.VEHICLES_VIEW),
    retry: 1,
  });
}

export function useVehicle(id: string | null) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? "none"),
    queryFn: () => vehicleApi.get(id!),
    enabled: isReady && can(PERM.VEHICLES_VIEW) && Boolean(id),
    retry: 1,
  });
}

export function useVehicleOverview(id: string | null) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: vehicleKeys.overview(id ?? "none"),
    queryFn: () => vehicleApi.overview(id!),
    enabled: isReady && can(PERM.VEHICLES_VIEW) && Boolean(id),
    retry: 1,
  });
}

export function useVehicleServices(vehicleId: string | null) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: vehicleKeys.services(vehicleId ?? "none"),
    queryFn: () => vehicleApi.services.list(vehicleId!),
    enabled: isReady && can(PERM.VEHICLES_VIEW) && Boolean(vehicleId),
    retry: 1,
  });
}

export function useVehicleFuel(vehicleId: string | null) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: vehicleKeys.fuel(vehicleId ?? "none"),
    queryFn: () => vehicleApi.fuel.list(vehicleId!),
    enabled: isReady && can(PERM.VEHICLES_VIEW) && Boolean(vehicleId),
    retry: 1,
  });
}

export function useVehicleDocuments(vehicleId: string | null) {
  const { can, isReady } = useCapabilities();
  return useQuery({
    queryKey: vehicleKeys.documents(vehicleId ?? "none"),
    queryFn: () => vehicleApi.documents.list(vehicleId!),
    enabled: isReady && can(PERM.VEHICLES_VIEW) && Boolean(vehicleId),
    retry: 1,
  });
}

export function useVehicleMutations() {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: (input: VehicleWriteInput) => vehicleApi.create(input),
      onSuccess: () => {
        invalidateVehicle(qc);
        toast.success("Vehicle added");
      },
      onError: (e) => toast.error(errorMessage(e, "Could not save vehicle")),
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: VehicleUpdateInput }) => vehicleApi.update(id, input),
      onSuccess: (_, { id }) => {
        invalidateVehicle(qc, id);
        toast.success("Vehicle updated");
      },
      onError: (e) => toast.error(errorMessage(e, "Could not update vehicle")),
    }),
    remove: useMutation({
      mutationFn: (id: string) => vehicleApi.remove(id),
      onSuccess: () => {
        invalidateVehicle(qc);
        toast.success("Vehicle removed");
      },
      onError: (e) => toast.error(errorMessage(e, "Could not delete vehicle")),
    }),
  };
}

export function useVehicleRecordMutations(vehicleId: string) {
  const qc = useQueryClient();
  const invalidate = () => invalidateVehicle(qc, vehicleId);

  return {
    createService: useMutation({
      mutationFn: vehicleApi.services.create.bind(null, vehicleId),
      onSuccess: invalidate,
      onError: (e) => toast.error(errorMessage(e, "Could not save service record")),
    }),
    deleteService: useMutation({
      mutationFn: (serviceId: string) => vehicleApi.services.remove(vehicleId, serviceId),
      onSuccess: invalidate,
    }),
    createFuel: useMutation({
      mutationFn: vehicleApi.fuel.create.bind(null, vehicleId),
      onSuccess: invalidate,
      onError: (e) => toast.error(errorMessage(e, "Could not save fuel record")),
    }),
    deleteFuel: useMutation({
      mutationFn: (fuelId: string) => vehicleApi.fuel.remove(vehicleId, fuelId),
      onSuccess: invalidate,
    }),
    createDocument: useMutation({
      mutationFn: vehicleApi.documents.create.bind(null, vehicleId),
      onSuccess: invalidate,
      onError: (e) => toast.error(errorMessage(e, "Could not save document")),
    }),
    deleteDocument: useMutation({
      mutationFn: (documentId: string) => vehicleApi.documents.remove(vehicleId, documentId),
      onSuccess: invalidate,
    }),
  };
}

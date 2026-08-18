import type { WealthDataStatus } from "@/lib/api/wealth-types";

/** Centralized dashboard data states for Wealth UI. */
export type WealthUiState =
  "LOADING" | "NO_CONNECTION" | "CONNECTED" | "SYNCING" | "PARTIAL" | "ERROR" | "EMPTY";

export function resolveWealthUiState(input: {
  isLoading: boolean;
  isError: boolean;
  dataStatus?: WealthDataStatus;
  holdingsCount?: number;
  hasSyncingConnection?: boolean;
}): WealthUiState {
  if (input.isLoading) return "LOADING";
  if (input.isError) return "ERROR";
  if (input.hasSyncingConnection || input.dataStatus === "syncing") return "SYNCING";
  if (input.dataStatus === "no_connection") return "NO_CONNECTION";
  if (input.dataStatus === "sync_error" || input.dataStatus === "error") return "ERROR";
  if (input.dataStatus === "partial") return "PARTIAL";
  if (input.dataStatus === "no_data" || (input.holdingsCount ?? 0) === 0) return "EMPTY";
  return "CONNECTED";
}

export function dataStatusLabel(status: WealthDataStatus): string {
  switch (status) {
    case "ready":
      return "Live data";
    case "no_connection":
      return "No connection";
    case "no_data":
      return "No holdings yet";
    case "sync_pending":
      return "Sync pending";
    case "syncing":
      return "Syncing";
    case "partial":
      return "Partial sync";
    case "sync_error":
      return "Sync error";
    case "error":
      return "Error";
    default:
      return status;
  }
}

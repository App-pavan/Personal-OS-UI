import { API_BASE_URL, api, buildQuery } from "./client";
import { tokenStore } from "./token-store";
import type {
  AwarenessPayload,
  DeviceAwarenessSummary,
  DeviceDetails,
  DeviceSummary,
  DeviceViewResponse,
  FamilyDevicesOverview,
  PresenceStatus,
  RealtimeDevicePayload,
} from "./device-awareness-types";

/* Device Awareness service boundary: /api/v1/device_awareness/* */

type Raw = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const raw = (v: unknown): Raw => (v && typeof v === "object" ? (v as Raw) : {});

const optStr = (value: unknown): string | undefined => {
  const next = str(value);
  return next ? next : undefined;
};

function mapBattery(v: unknown): AwarenessPayload["battery"] {
  const o = raw(v);
  if (!Object.keys(o).length) return undefined;
  const level = typeof o["level"] === "number" ? o["level"] : undefined;
  const charging = typeof o["charging"] === "boolean" ? o["charging"] : undefined;
  if (level == null && charging == null) return undefined;
  const out: NonNullable<AwarenessPayload["battery"]> = {};
  if (level != null) out.level = level;
  if (charging != null) out.charging = charging;
  return out;
}

function mapNetwork(v: unknown): AwarenessPayload["network"] {
  const o = raw(v);
  if (!Object.keys(o).length) return undefined;
  const type = optStr(o["type"]);
  const connected = typeof o["connected"] === "boolean" ? o["connected"] : undefined;
  if (!type && connected == null) return undefined;
  const out: NonNullable<AwarenessPayload["network"]> = {};
  if (type) out.type = type;
  if (connected != null) out.connected = connected;
  return out;
}

function mapActivity(v: unknown): AwarenessPayload["activity"] {
  const o = raw(v);
  if (!Object.keys(o).length) return undefined;
  const appState = optStr(o["appState"]) as AwarenessPayload["activity"] extends infer A
    ? A extends { appState?: infer S }
      ? S
      : never
    : never;
  const screenState = optStr(o["screenState"]) as AwarenessPayload["activity"] extends infer A
    ? A extends { screenState?: infer S }
      ? S
      : never
    : never;
  if (!appState && !screenState) return undefined;
  const out: NonNullable<AwarenessPayload["activity"]> = {};
  if (appState) out.appState = appState;
  if (screenState) out.screenState = screenState;
  return out;
}

function mapCommunication(v: unknown): AwarenessPayload["communication"] {
  const o = raw(v);
  if (!Object.keys(o).length) return undefined;
  const state = optStr(o["state"]) as AwarenessPayload["communication"] extends infer C
    ? C extends { state?: infer S }
      ? S
      : never
    : never;
  const type = optStr(o["type"]) as AwarenessPayload["communication"] extends infer C
    ? C extends { type?: infer T }
      ? T
      : never
    : never;
  if (!state && !type) return undefined;
  const out: NonNullable<AwarenessPayload["communication"]> = {};
  if (state) out.state = state;
  if (type) out.type = type;
  return out;
}

export function mapAwareness(v: unknown): AwarenessPayload {
  const o = raw(v);
  const payload: AwarenessPayload = {
    status: str(o["status"], "offline") as PresenceStatus,
    lastSeenAt: str(o["lastSeenAt"]),
  };
  const osVersion = optStr(o["osVersion"]);
  if (osVersion) payload.osVersion = osVersion;
  const timezone = optStr(o["timezone"]);
  if (timezone) payload.timezone = timezone;
  const locale = optStr(o["locale"]);
  if (locale) payload.locale = locale;
  const battery = mapBattery(o["battery"]);
  if (battery) payload.battery = battery;
  const network = mapNetwork(o["network"]);
  if (network) payload.network = network;
  const activity = mapActivity(o["activity"]);
  if (activity) payload.activity = activity;
  const communication = mapCommunication(o["communication"]);
  if (communication) payload.communication = communication;
  return payload;
}

function mapDeviceSummary(v: unknown): DeviceSummary {
  const o = raw(v);
  const awareness = mapAwareness(o["awareness"] ?? o);
  const summary: DeviceSummary = {
    id: str(o["id"]),
    userId: str(o["userId"]),
    deviceName: str(o["deviceName"]),
    platform: str(o["platform"]),
    status: str(o["status"], awareness.status) as PresenceStatus,
    lastSeenAt: str(o["lastSeenAt"], awareness.lastSeenAt),
    awareness,
  };
  const appVersion = optStr(o["appVersion"]);
  if (appVersion) summary.appVersion = appVersion;
  return summary;
}

function mapAwarenessSummary(v: unknown): DeviceAwarenessSummary {
  const o = raw(v);
  const summary: DeviceAwarenessSummary = {
    id: str(o["id"]),
    deviceName: str(o["deviceName"]),
    platform: str(o["platform"]),
    status: str(o["status"], "offline") as PresenceStatus,
    lastSeenAt: str(o["lastSeenAt"]),
  };
  const appVersion = optStr(o["appVersion"]);
  if (appVersion) summary.appVersion = appVersion;
  return summary;
}

function mapFamilyEntry(v: unknown) {
  const o = raw(v);
  return {
    device: mapAwarenessSummary(o["device"]),
    owner: mapOwner(o["owner"]),
    awareness: mapAwareness(o["awareness"]),
    scope: str(o["scope"], "basic") as "basic" | "extended",
  };
}

function mapOwner(v: unknown) {
  const o = raw(v);
  return {
    id: str(o["id"]),
    displayName: str(o["displayName"]),
  };
}

function mapFamilyOverview(data: unknown): FamilyDevicesOverview {
  const o = raw(data);
  const owners = Array.isArray(o["owners"]) ? o["owners"] : [];
  return {
    owners: owners.map((group) => {
      const g = raw(group);
      const devices = Array.isArray(g["devices"]) ? g["devices"] : [];
      return {
        owner: mapOwner(g["owner"]),
        devices: devices.map(mapFamilyEntry),
      };
    }),
  };
}

function mapDeviceDetails(v: unknown): DeviceDetails {
  const base = mapDeviceSummary(v);
  const o = raw(v);
  const details: DeviceDetails = {
    ...base,
    installationId: str(o["installationId"]),
    createdAt: str(o["createdAt"]),
    updatedAt: str(o["updatedAt"]),
  };
  const osVersion = optStr(o["osVersion"]);
  if (osVersion) details.osVersion = osVersion;
  const timezone = optStr(o["timezone"]);
  if (timezone) details.timezone = timezone;
  const locale = optStr(o["locale"]);
  if (locale) details.locale = locale;
  return details;
}

function mapDeviceView(data: unknown): DeviceViewResponse {
  const o = raw(data);
  const view: DeviceViewResponse = {
    owner: mapOwner(o["owner"]),
    awareness: mapAwareness(o["awareness"]),
    scope: str(o["scope"], "basic") as "basic" | "extended",
  };
  if (o["device"]) view.device = mapDeviceDetails(o["device"]);
  if (o["deviceSummary"]) view.deviceSummary = mapAwarenessSummary(o["deviceSummary"]);
  return view;
}

export function mapRealtimePayload(data: unknown): RealtimeDevicePayload | null {
  const o = raw(data);
  const deviceId = str(o["deviceId"]);
  if (!deviceId) return null;
  const payload: RealtimeDevicePayload = {
    event: str(o["event"]),
    deviceId,
    ownerId: str(o["ownerId"]),
    scope: str(o["scope"], "basic") as "basic" | "extended",
    awareness: mapAwareness(o["awareness"]),
  };
  if (o["deviceSummary"]) payload.deviceSummary = mapAwarenessSummary(o["deviceSummary"]);
  return payload;
}

export type DeviceStreamEvent = {
  event?: string;
  data: string;
};

export type DeviceStreamHandlers = {
  onEvent: (event: DeviceStreamEvent) => void;
  onOpen?: () => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
};

function parseSSEBlock(block: string): DeviceStreamEvent | null {
  const trimmed = block.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;

  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of trimmed.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }

  if (!dataLines.length) return null;
  return { event, data: dataLines.join("\n") };
}

/** Fetch-based SSE for device awareness (supports Authorization header). */
export function openDeviceAwarenessStream(
  handlers: DeviceStreamHandlers,
  options: { signal?: AbortSignal } = {},
): { close: () => void } {
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;

  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };
  const token = tokenStore.accessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let closed = false;

  void (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/device_awareness/devices/stream${buildQuery({})}`,
        { method: "GET", headers, signal },
      );

      if (!response.ok) {
        handlers.onError?.(new Error(`Stream failed (${response.status})`));
        return;
      }

      handlers.onOpen?.();

      const reader = response.body?.getReader();
      if (!reader) {
        handlers.onError?.(new Error("Stream body unavailable"));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const parsed = parseSSEBlock(block);
          if (parsed) handlers.onEvent(parsed);
        }
      }
    } catch (error) {
      if (!closed && !(error instanceof DOMException && error.name === "AbortError")) {
        handlers.onError?.(error);
      }
    } finally {
      if (!closed) handlers.onClose?.();
    }
  })();

  return {
    close: () => {
      closed = true;
      controller.abort();
    },
  };
}

export const deviceAwarenessApi = {
  listOwnDevices: async (): Promise<DeviceSummary[]> => {
    const { data } = await api.get<unknown>("/device_awareness/devices");
    const list = Array.isArray(data) ? data : [];
    return list.map(mapDeviceSummary);
  },

  listFamilyDevices: async (): Promise<FamilyDevicesOverview> => {
    const { data } = await api.get<unknown>("/device_awareness/devices/family");
    return mapFamilyOverview(data);
  },

  getDevice: async (deviceId: string): Promise<DeviceViewResponse> => {
    const { data } = await api.get<unknown>(`/device_awareness/devices/${deviceId}`);
    return mapDeviceView(data);
  },
};

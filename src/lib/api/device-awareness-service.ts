import { api } from "./client";
import type {
  AwarenessPayload,
  DeviceAwarenessSummary,
  DeviceDetails,
  DeviceSummary,
  DeviceViewResponse,
  FamilyDevicesOverview,
  PresenceStatus,
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

function mapOwner(v: unknown) {
  const o = raw(v);
  return {
    id: str(o["id"]),
    displayName: str(o["displayName"]),
  };
}

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

function mapAwareness(v: unknown): AwarenessPayload {
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
  return payload;
}

function mapDeviceSummary(v: unknown): DeviceSummary {
  const o = raw(v);
  const summary: DeviceSummary = {
    id: str(o["id"]),
    userId: str(o["userId"]),
    deviceName: str(o["deviceName"]),
    platform: str(o["platform"]),
    status: str(o["status"], "offline") as PresenceStatus,
    lastSeenAt: str(o["lastSeenAt"]),
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

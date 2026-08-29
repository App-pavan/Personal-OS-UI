/** Device Awareness API types — mirrors backend contracts. */

export type PresenceStatus = "online" | "offline";
export type AwarenessScope = "basic" | "extended";

export type OwnerSummary = {
  id: string;
  displayName: string;
};

export type BatterySnapshot = {
  level?: number;
  charging?: boolean;
};

export type NetworkSnapshot = {
  type?: string;
  connected?: boolean;
};

export type ActivitySnapshot = {
  appState?: "foreground" | "background";
  screenState?: "active" | "inactive" | "locked" | "unknown";
};

export type CommunicationSnapshot = {
  state?: "none" | "active" | "ringing";
  type?: "cellular" | "whatsapp" | "other";
};

export type AwarenessPayload = {
  status: PresenceStatus;
  lastSeenAt: string;
  osVersion?: string;
  timezone?: string;
  locale?: string;
  battery?: BatterySnapshot;
  network?: NetworkSnapshot;
  activity?: ActivitySnapshot;
  communication?: CommunicationSnapshot;
};

export type DeviceSummary = {
  id: string;
  userId: string;
  deviceName: string;
  platform: string;
  status: PresenceStatus;
  lastSeenAt: string;
  appVersion?: string;
  awareness: AwarenessPayload;
};

export type DeviceAwarenessSummary = {
  id: string;
  deviceName: string;
  platform: string;
  appVersion?: string;
  status: PresenceStatus;
  lastSeenAt: string;
};

export type DeviceDetails = DeviceSummary & {
  osVersion?: string;
  installationId: string;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyDeviceEntry = {
  device: DeviceAwarenessSummary;
  owner: OwnerSummary;
  awareness: AwarenessPayload;
  scope: AwarenessScope;
};

export type FamilyOwnerGroup = {
  owner: OwnerSummary;
  devices: FamilyDeviceEntry[];
};

export type FamilyDevicesOverview = {
  owners: FamilyOwnerGroup[];
};

export type DeviceViewResponse = {
  device?: DeviceDetails;
  deviceSummary?: DeviceAwarenessSummary;
  owner: OwnerSummary;
  awareness: AwarenessPayload;
  scope: AwarenessScope;
};

/** Authorized device snapshot from SSE realtime events. */
export type RealtimeDevicePayload = {
  event: string;
  deviceId: string;
  ownerId: string;
  scope: AwarenessScope;
  deviceSummary?: DeviceAwarenessSummary;
  awareness: AwarenessPayload;
};

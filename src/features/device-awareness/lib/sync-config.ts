/**
 * Device Awareness sync strategy.
 *
 * Primary updates arrive via authorized SSE (`/device_awareness/devices/stream`).
 * REST APIs reconcile on initial load, manual refresh, tab focus, and reconnect.
 */

/** Delay before reconnecting SSE after disconnect. */
export const DEVICE_AWARENESS_RECONNECT_MS = 3_000;

/** After this many ms without a successful sync, data is considered stale. */
export const DEVICE_AWARENESS_STALE_MS = 120_000;

/** How long a presence transition highlight remains visible. */
export const PRESENCE_TRANSITION_MS = 2_000;

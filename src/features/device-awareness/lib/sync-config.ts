/**
 * Device Awareness sync strategy.
 *
 * Backend publishes presence events on the internal event bus but does not
 * expose a device-awareness SSE/WebSocket stream to browsers yet. The web
 * app reconciles via authorized REST APIs on an interval and when the tab
 * becomes visible again.
 */

/** Poll interval while the Device Awareness page tab is visible. */
export const DEVICE_AWARENESS_POLL_MS = 30_000;

/** Longer reconciliation interval used as a background safety net. */
export const DEVICE_AWARENESS_RECONCILE_MS = 90_000;

/** After this many ms without a successful sync, data is considered stale. */
export const DEVICE_AWARENESS_STALE_MS = 120_000;

/** How long a presence transition highlight remains visible. */
export const PRESENCE_TRANSITION_MS = 2_000;

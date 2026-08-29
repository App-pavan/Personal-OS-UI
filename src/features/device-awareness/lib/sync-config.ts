/**
 * Device Awareness sync strategy.
 *
 * REST APIs load on initial page visit and manual Refresh only (no SSE or polling).
 */

/** After this many ms without a successful sync, data is considered stale. */
export const DEVICE_AWARENESS_STALE_MS = 120_000;

/** How long a presence transition highlight remains visible. */
export const PRESENCE_TRANSITION_MS = 2_000;

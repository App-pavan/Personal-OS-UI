/** Detect stale/missing JS chunk failures after deploy or cache mismatch. */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("chunkloaderror") ||
    error.name === "ChunkLoadError"
  );
}

const CHUNK_RELOAD_KEY = "personal-os.chunk-reload";

/** Reload once per tab session when a chunk load failure is detected. */
export function reloadForStaleChunk(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/** Clear the one-shot reload guard after a successful boot. */
export function clearChunkReloadGuard(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* ignore */
  }
}

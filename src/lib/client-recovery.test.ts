import { describe, expect, it } from "vitest";
import { isChunkLoadError } from "./client-recovery";

describe("client-recovery", () => {
  it("detects dynamic import chunk failures", () => {
    expect(
      isChunkLoadError(new Error("Failed to fetch dynamically imported module: /assets/tasks.js")),
    ).toBe(true);
    expect(isChunkLoadError(new Error("Importing a module script failed"))).toBe(true);
  });

  it("ignores normal runtime errors", () => {
    expect(isChunkLoadError(new Error("BrandMark is not defined"))).toBe(false);
    expect(isChunkLoadError(new Error("Network request failed"))).toBe(false);
  });
});

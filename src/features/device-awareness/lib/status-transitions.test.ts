import { describe, expect, it } from "vitest";
import {
  buildStatusSnapshot,
  detectPresenceTransitions,
} from "./status-transitions";

describe("status transitions", () => {
  it("detects devices whose presence changed", () => {
    const previous = buildStatusSnapshot(
      [{ id: "d1", status: "online" }],
      [{ device: { id: "d2", status: "offline" } }],
    );
    const next = buildStatusSnapshot(
      [{ id: "d1", status: "offline" }],
      [{ device: { id: "d2", status: "offline" } }],
    );
    expect(detectPresenceTransitions(previous, next)).toEqual(["d1"]);
  });

  it("ignores unchanged devices and first snapshot", () => {
    const next = buildStatusSnapshot([{ id: "d1", status: "online" }], []);
    expect(detectPresenceTransitions(null, next)).toEqual([]);
    expect(detectPresenceTransitions(next, next)).toEqual([]);
  });
});

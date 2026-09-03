import { describe, expect, it } from "vitest";
import {
  isValidMonthKey,
  monthIsoRange,
  parseMonthKey,
} from "@/features/expenses/lib/month-utils";

describe("month-utils", () => {
  it("validates month keys", () => {
    expect(isValidMonthKey("2026-08")).toBe(true);
    expect(isValidMonthKey("2026-13")).toBe(false);
    expect(isValidMonthKey("bad")).toBe(false);
  });

  it("parses month keys with fallback", () => {
    expect(parseMonthKey("2026-09", "2026-01")).toBe("2026-09");
    expect(parseMonthKey(undefined, "2026-01")).toBe("2026-01");
  });

  it("returns UTC half-open range for August 2026", () => {
    const { from, to } = monthIsoRange("2026-08");
    expect(from).toBe("2026-08-01T00:00:00.000Z");
    expect(to).toBe("2026-09-01T00:00:00.000Z");
  });

  it("returns UTC half-open range for September 2026", () => {
    const { from, to } = monthIsoRange("2026-09");
    expect(from).toBe("2026-09-01T00:00:00.000Z");
    expect(to).toBe("2026-10-01T00:00:00.000Z");
  });
});

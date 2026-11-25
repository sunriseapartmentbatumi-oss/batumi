import { describe, expect, it } from "vitest";
import { createRateLimiter, normalizeReference, REFERENCE_PATTERN, toView } from "./status";

const row = {
  reference: "BAT-ABCD2345", status: "pending_payment" as const, check_in: "2099-01-10", check_out: "2099-01-12",
  adults_count: 2, children_count: 0, hold_expires_at: "2099-01-01T10:00:00Z",
};

describe("status rezerwacji", () => {
  it("pokazuje oczekującą z końcem blokady", () => {
    const v = toView(row, new Date("2099-01-01T09:00:00Z"));
    expect(v.status).toBe("pending_payment");
    expect(v.holdExpiresAt).toBe(row.hold_expires_at);
  });
  it("przeterminowany hold = wygasła, bez końca blokady", () => {
    const v = toView(row, new Date("2099-01-01T11:00:00Z"));
    expect(v.status).toBe("expired");
    expect(v.holdExpiresAt).toBeNull();
  });
  it("normalizuje i waliduje numer", () => {
    expect(REFERENCE_PATTERN.test(normalizeReference(" bat-abcd2345 "))).toBe(true);
    expect(REFERENCE_PATTERN.test("BAT-1")).toBe(false);
  });
  it("limiter blokuje po przekroczeniu limitu i odpuszcza po oknie", () => {
    const ok = createRateLimiter(2, 1000);
    expect(ok("ip", 0)).toBe(true);
    expect(ok("ip", 1)).toBe(true);
    expect(ok("ip", 2)).toBe(false);
    expect(ok("ip", 2000)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { botVerdict, clientIp } from "./guard";
import { createRateLimiter } from "./status";
import { maskEmail, maskPhone } from "../mask";
import { countSince, funnel, recentErrors } from "../metrics";

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const now = 1_000_000_000_000;

describe("botVerdict", () => {
  it("przepuszcza człowieka", () => expect(botVerdict(fd({ website: "", form_started: String(now - 5000) }), now)).toBe("ok"));
  it("łapie honeypot", () => expect(botVerdict(fd({ website: "x", form_started: String(now - 5000) }), now)).toBe("honeypot"));
  it("łapie zbyt szybki formularz", () => expect(botVerdict(fd({ form_started: String(now - 500) }), now)).toBe("too_fast"));
  it("łapie brak lub fałszywy czas", () => {
    expect(botVerdict(fd({}), now)).toBe("too_fast");
    expect(botVerdict(fd({ form_started: String(now + 99999) }), now)).toBe("too_fast");
  });
});

describe("clientIp i limiter", () => {
  it("bierze pierwszy adres z x-forwarded-for", () => expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4"));
  it("blokuje po przekroczeniu limitu", () => {
    const allow = createRateLimiter(2, 1000);
    expect([allow("a", 0), allow("a", 1), allow("a", 2), allow("a", 2000)]).toEqual([true, true, false, true]);
  });
});

describe("maskowanie", () => {
  it("maskuje e-mail i telefon", () => {
    expect(maskEmail("jan@example.com")).toBe("j***@example.com");
    expect(maskPhone("+48 123 456 789")).toBe("***89");
  });
});

describe("metryki", () => {
  const day = 86_400_000;
  const rows = [
    { created_at: new Date(now - day).toISOString(), kind: "booking_success", operation: "x", detail: {} },
    { created_at: new Date(now - 2 * day).toISOString(), kind: "booking_validation_error", operation: "x", detail: {} },
    { created_at: new Date(now - 3 * day).toISOString(), kind: "booking_blocked", operation: "x", detail: {} },
    { created_at: new Date(now - 20 * day).toISOString(), kind: "booking_db_error", operation: "y", detail: {} },
  ];
  it("liczy lejek i konwersję", () => {
    const f = funnel(rows, 7 * day, now);
    expect(f).toMatchObject({ success: 1, validation_error: 1, blocked: 1, db_error: 0, conversionPct: 50 });
    expect(funnel(rows, 30 * day, now).db_error).toBe(1);
  });
  it("zwraca ostatnie błędy i zlicza daty", () => {
    expect(recentErrors(rows).map((r) => r.kind)).toEqual(["booking_validation_error", "booking_db_error"]);
    expect(countSince(rows.map((r) => r.created_at), 7 * day, now)).toBe(3);
  });
});

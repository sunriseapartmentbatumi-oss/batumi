import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("server-only", () => ({}));
let ipCounter = 0;
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": `10.0.0.${++ipCounter}` }) }));
vi.mock("@/lib/booking/server", () => ({
  serverClient: () => ({ rpc }),
  notifyByEmail: vi.fn(async () => ({ sent: true, reason: "ok" })),
  sendGuestEmail: vi.fn(async () => ({ sent: true, reason: "ok" })),
}));

import { submitBooking } from "./actions";

function browserForm(over: Record<string, string> = {}, omit: string[] = []) {
  const f = new FormData();
  const base: Record<string, string> = {
    $ACTION_ID_abc: "",
    check_in: "2099-01-10", check_out: "2099-01-12", adults: "2", children: "0",
    first_name: "Jan", last_name: "Kowalski", email: "jan@example.com", phone: "+48123456789",
    message: "", website: "", form_started: String(Date.now() - 10_000), accept_terms: "on", accept_privacy: "on",
  };
  for (const [k, v] of Object.entries({ ...base, ...over })) if (!omit.includes(k)) f.set(k, v);
  return f;
}

beforeEach(() => {
  rpc.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("submitBooking", () => {
  it("zapisuje poprawny formularz z przeglądarki", async () => {
    rpc.mockResolvedValue({ data: "id", error: null });
    const r = await submitBooking({}, browserForm());
    expect(r.ok).toBe(true);
    expect(r.reference).toMatch(/^BAT-/);
  });
  it("zawsze zwraca komunikat przy błędzie walidacji", async () => {
    const r = await submitBooking({}, browserForm({}, ["accept_terms"]));
    expect(r.fieldErrors?.accept_terms).toBeTruthy();
    expect(r.error).toBeTruthy();
    expect(r.values?.email).toBe("jan@example.com");
  });
  it("zwraca ogólny błąd gdy rpc rzuca wyjątek", async () => {
    rpc.mockRejectedValue(new Error("boom"));
    const r = await submitBooking({}, browserForm());
    expect(r.error).toBeTruthy();
  });
  it("mapuje zajęty termin", async () => {
    rpc.mockResolvedValue({ error: { code: "P0001", message: "dates_unavailable" } });
    const r = await submitBooking({}, browserForm());
    expect(r.error).toMatch(/zajęty/);
  });
  it("honeypot: udaje sukces, ale nic nie zapisuje", async () => {
    const r = await submitBooking({}, browserForm({ website: "http://spam" }));
    expect(r.ok).toBe(true);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("zbyt szybkie wysłanie: ogólny błąd, bez zapisu", async () => {
    const r = await submitBooking({}, browserForm({ form_started: String(Date.now()) }));
    expect(r.ok).toBeUndefined();
    expect(r.error).toBeTruthy();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("brak znacznika czasu traktowany jak bot", async () => {
    const r = await submitBooking({}, browserForm({}, ["form_started"]));
    expect(r.ok).toBeUndefined();
    expect(rpc).not.toHaveBeenCalled();
  });
});

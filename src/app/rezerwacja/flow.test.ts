import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = { reference: string; guest_email: string; status: string; check_in: string; check_out: string; adults_count: number; children_count: number; hold_expires_at: string };
const store: Row[] = [];
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "9.9.9.9" }) }));
vi.mock("@/lib/booking/server", () => ({
  notifyByEmail: vi.fn(async () => ({ sent: true, reason: "ok" })),
  sendGuestEmail: vi.fn(async () => ({ sent: true, reason: "ok" })),
  serverClient: () => ({
    rpc: async (_fn: string, a: Record<string, unknown>) => {
      store.push({
        reference: String(a.p_reference), guest_email: String(a.p_email), status: "pending_payment",
        check_in: String(a.p_check_in), check_out: String(a.p_check_out), adults_count: Number(a.p_adults), children_count: Number(a.p_children),
        hold_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
      });
      return { error: null };
    },
    from: () => {
      let ref = "";
      let email = "";
      const q = {
        select: () => q,
        eq: (_c: string, v: string) => ((ref = v), q),
        ilike: (_c: string, v: string) => ((email = v.toLowerCase()), q),
        maybeSingle: async () => ({ data: store.find((r) => r.reference === ref && r.guest_email.toLowerCase() === email) ?? null, error: null }),
        insert: async () => ({ error: null }),
      };
      return q;
    },
  }),
}));

import { submitBooking } from "./actions";
import { checkStatus } from "./status/actions";

function form(o: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
}

beforeEach(() => {
  store.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("przepływ: formularz → potwierdzenie → status", () => {
  it("rezerwacja jest widoczna w statusie tylko dla właściwego e-maila", async () => {
    const booked = await submitBooking({}, form({
      check_in: "2099-03-01", check_out: "2099-03-04", adults: "2", children: "1",
      first_name: "Jan", last_name: "Kowalski", email: "Jan@Example.com", phone: "+48123456789",
      message: "", website: "", form_started: String(Date.now() - 10_000), accept_terms: "on", accept_privacy: "on",
    }));
    expect(booked.ok).toBe(true);
    expect(booked.summary).toMatchObject({ check_in: "2099-03-01", adults: 2, children: 1 });

    const found = await checkStatus({}, form({ reference: booked.reference!.toLowerCase(), email: "jan@example.com" }));
    expect(found.view?.status).toBe("pending_payment");
    expect(found.view?.reference).toBe(booked.reference);

    const wrong = await checkStatus({}, form({ reference: booked.reference!, email: "obcy@example.com" }));
    expect(wrong.view).toBeUndefined();
    expect(wrong.error).toMatch(/Nie znaleziono/);
  });
});

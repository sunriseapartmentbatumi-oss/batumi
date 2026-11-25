import { describe, expect, it, vi } from "vitest";
import { buildReminderEmail, isCronAuthorized, localDate, parseReminderDays, reminderWindow, runReminders, type ReminderRow } from "./reminder";

describe("autoryzacja crona", () => {
  it("wymaga poprawnego Bearer", () => {
    expect(isCronAuthorized("Bearer s3", "s3")).toBe(true);
    expect(isCronAuthorized("Bearer zly", "s3")).toBe(false);
    expect(isCronAuthorized(null, "s3")).toBe(false);
    expect(isCronAuthorized("Bearer ", "")).toBe(false);
    expect(isCronAuthorized("Bearer s3", undefined)).toBe(false);
  });
});

describe("okno przypomnień", () => {
  it("domyślnie 3 dni, poprawne wartości i czas Batumi", () => {
    expect(parseReminderDays(undefined)).toBe(3);
    expect(parseReminderDays("5")).toBe(5);
    expect(parseReminderDays("0")).toBe(3);
    expect(parseReminderDays("abc")).toBe(3);
    // 21:00 UTC = 01:00 następnego dnia w Batumi (UTC+4)
    const now = new Date("2099-03-01T21:00:00Z");
    expect(localDate(now)).toBe("2099-03-02");
    expect(reminderWindow(now, 3)).toEqual({ from: "2099-03-02", to: "2099-03-05" });
  });
});

const row: ReminderRow = { id: "1", reference: "BAT-ABCD2345", guest_first_name: "<b>Jan</b>", guest_email: "jan@example.com", check_in: "2099-03-04", check_out: "2099-03-06", adults_count: 2, children_count: 0 };

describe("szablon przypomnienia", () => {
  it("zawiera dane, markery i escapuje HTML", () => {
    const m = buildReminderEmail(row, "https://x.pl/rezerwacja/status");
    expect(m.text).toContain("BAT-ABCD2345");
    expect(m.text).toContain("[DO POTWIERDZENIA]");
    expect(m.html).toContain("&lt;b&gt;Jan&lt;/b&gt;");
    expect(m.html).toContain("https://x.pl/rezerwacja/status");
  });
});

function fakeDb(rows: ReminderRow[], updates: string[]) {
  const q: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    select: () => q, eq: () => q, gt: () => q, lte: () => q, is: () => q,
    limit: async () => ({ data: rows, error: null }),
    update: () => ({ eq: (_c: string, id: string) => ({ is: async () => (updates.push(id), { error: null }) }) }),
  };
  return { from: () => q };
}

describe("runReminders", () => {
  const opts = { now: new Date("2099-03-01T06:00:00Z"), days: 3, statusUrl: null };
  it("wysyła i oznacza tylko po sukcesie, błąd nie przerywa pętli", async () => {
    const updates: string[] = [];
    const rows = [{ ...row, id: "a" }, { ...row, id: "b", guest_email: "fail@example.com" }, { ...row, id: "c" }];
    const send = vi.fn(async (to: string) => {
      if (to.startsWith("fail")) throw new Error("boom");
      return { sent: true };
    });
    const r = await runReminders(fakeDb(rows, updates), send, opts);
    expect(r).toEqual({ due: 3, sent: 2, failed: 1 });
    expect(updates).toEqual(["a", "c"]);
  });
  it("niewysłane (sent:false) nie jest oznaczane", async () => {
    const updates: string[] = [];
    const r = await runReminders(fakeDb([row], updates), async () => ({ sent: false }), opts);
    expect(r).toEqual({ due: 1, sent: 0, failed: 1 });
    expect(updates).toEqual([]);
  });
  it("brak kandydatów (np. po ponownym uruchomieniu) = nic nie wysyła", async () => {
    const send = vi.fn();
    const r = await runReminders(fakeDb([], []), send, opts);
    expect(r.due).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });
});

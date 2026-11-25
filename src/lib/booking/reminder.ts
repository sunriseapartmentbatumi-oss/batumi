import { createHash, timingSafeEqual } from "node:crypto";
import { TBC } from "@/lib/site";
import { escapeHtml } from "./guest-email";

const TZ = "Asia/Tbilisi";
const DAY = 86_400_000;

export function parseReminderDays(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 30 ? n : 3;
}

export function localDate(now: Date, offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(now.getTime() + offsetDays * DAY));
}

// Okno: przyjazd po dzisiejszym dniu (czas Batumi) i nie później niż za N dni – nadrabia pominięte uruchomienia.
export function reminderWindow(now: Date, days: number): { from: string; to: string } {
  return { from: localDate(now, 0), to: localDate(now, days) };
}

// Porównanie w stałym czasie (skróty SHA-256 mają równą długość).
export function isCronAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b);
}

export type ReminderRow = {
  id: string;
  reference: string;
  guest_first_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  adults_count: number;
  children_count: number;
};

export function buildReminderEmail(r: ReminderRow, statusUrl: string | null): { subject: string; text: string; html: string } {
  const subject = `Przypomnienie o zameldowaniu – rezerwacja ${r.reference}`;
  const text = [
    `Dzień dobry ${r.guest_first_name},`,
    "",
    "przypominamy o zbliżającym się pobycie w apartamencie w Batumi.",
    "",
    `Numer referencyjny: ${r.reference}`,
    `Termin: ${r.check_in} – ${r.check_out}`,
    `Liczba osób: dorośli ${r.adults_count}, dzieci ${r.children_count}`,
    `Godziny zameldowania i wymeldowania: ${TBC}`,
    `Dojazd i odbiór kluczy: ${TBC}`,
    ...(statusUrl ? ["", `Status rezerwacji (numer + Twój e-mail): ${statusUrl}`] : []),
    "",
    `Kontakt: ${TBC}`,
  ].join("\n");
  const e = escapeHtml;
  const html =
    `<p>Dzień dobry ${e(r.guest_first_name)},</p><p>przypominamy o zbliżającym się pobycie w apartamencie w Batumi.</p>` +
    `<ul><li>Numer referencyjny: <strong>${e(r.reference)}</strong></li>` +
    `<li>Termin: ${e(r.check_in)} – ${e(r.check_out)}</li>` +
    `<li>Liczba osób: dorośli ${r.adults_count}, dzieci ${r.children_count}</li>` +
    `<li>Godziny zameldowania i wymeldowania: ${e(TBC)}</li>` +
    `<li>Dojazd i odbiór kluczy: ${e(TBC)}</li></ul>` +
    (statusUrl ? `<p><a href="${e(statusUrl)}">Sprawdź status rezerwacji</a> (numer + Twój e-mail)</p>` : "") +
    `<p>Kontakt: ${e(TBC)}</p>`;
  return { subject, text, html };
}

type Mail = { subject: string; text: string; html: string };
type Db = {
  from: (t: string) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ReminderRun = { due: number; sent: number; failed: number };

// Idempotencja: znacznik reminder_sent_at ustawiany po udanej wysyłce, aktualizacja tylko gdy nadal pusty.
export async function runReminders(
  db: Db,
  send: (to: string, mail: Mail) => Promise<{ sent: boolean }>,
  opts: { now: Date; days: number; statusUrl: string | null },
): Promise<ReminderRun> {
  const { from, to } = reminderWindow(opts.now, opts.days);
  const { data, error } = await db
    .from("reservations")
    .select("id,reference,guest_first_name,guest_email,check_in,check_out,adults_count,children_count")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gt("check_in", from)
    .lte("check_in", to)
    .limit(200);
  if (error) throw new Error(`query_failed:${error.code ?? ""}`);
  const rows = (data ?? []) as ReminderRow[];
  const run: ReminderRun = { due: rows.length, sent: 0, failed: 0 };
  for (const r of rows) {
    try {
      const res = await send(r.guest_email, buildReminderEmail(r, opts.statusUrl));
      if (!res.sent) {
        run.failed++;
        continue;
      }
      const upd = await db.from("reservations").update({ reminder_sent_at: opts.now.toISOString() }).eq("id", r.id).is("reminder_sent_at", null);
      if (upd.error) console.error("[cron-error]", JSON.stringify({ operation: "mark_reminder", code: upd.error.code ?? null }));
      run.sent++;
    } catch {
      run.failed++;
    }
  }
  return run;
}

import type { ReservationStatus } from "@/types/database";

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending_payment: "Oczekująca",
  confirmed: "Potwierdzona",
  cancelled: "Anulowana",
  expired: "Wygasła",
  completed: "Zakończona",
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export type ReservationFilters = { status?: ReservationStatus; from?: string; to?: string; q?: string };

export function parseFilters(sp: { status?: string; from?: string; to?: string; q?: string }): ReservationFilters {
  const f: ReservationFilters = {};
  if (sp.status && sp.status in STATUS_LABELS) f.status = sp.status as ReservationStatus;
  if (sp.from && ISO.test(sp.from)) f.from = sp.from;
  if (sp.to && ISO.test(sp.to)) f.to = sp.to;
  const q = sp.q?.trim().slice(0, 100);
  if (q) f.q = q;
  return f;
}

// Fragment dla PostgREST `or(...)`: usuwamy znaki, które zmieniają składnię filtra lub wildcard.
export function searchTerm(q: string): string {
  return q.replace(/[,()%_*\\"'.:]/g, " ").replace(/\s+/g, " ").trim();
}

// Pola zaczynające się od = + - @ (także po białych znakach/tabulatorze) mogą być wykonane jako formuły w arkuszu.
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return "\uFEFF" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export type Counts = Record<ReservationStatus, number>;

export function countByStatus(rows: { status: string }[]): Counts {
  const c: Counts = { pending_payment: 0, confirmed: 0, cancelled: 0, expired: 0, completed: 0 };
  for (const r of rows) if (r.status in c) c[r.status as ReservationStatus]++;
  return c;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function parseMonth(m: string | undefined, today: string): string {
  return m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : today.slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export type DayCell = { date: string; inMonth: boolean };

// Siatka tygodni (pon–nd) dla miesiąca YYYY-MM.
export function monthGrid(month: string): DayCell[][] {
  const first = `${month}-01`;
  const dow = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start = addDays(first, -dow);
  const weeks: DayCell[][] = [];
  let cur = start;
  do {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({ date: cur, inMonth: cur.startsWith(month) });
      cur = addDays(cur, 1);
    }
    weeks.push(week);
  } while (cur.startsWith(month) || weeks.length < 4);
  return weeks;
}

export type CalendarItem = { kind: "reservation" | "block"; label: string; from: string; to: string; status?: ReservationStatus };

// Zakresy [from, to): noc dnia D jest zajęta, gdy from <= D < to.
export function itemsForDay(items: CalendarItem[], date: string): CalendarItem[] {
  return items.filter((i) => i.from <= date && date < i.to);
}

export function parseDaterange(r: unknown): { from: string; to: string } | null {
  const m = /^[\[(](\d{4}-\d{2}-\d{2}),(\d{4}-\d{2}-\d{2})[\])]$/.exec(String(r));
  return m ? { from: m[1], to: m[2] } : null;
}

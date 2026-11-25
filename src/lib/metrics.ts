export type EventRow = { created_at: string; kind: string; operation: string; detail: Record<string, unknown> | null };

export type Funnel = {
  success: number;
  validation_error: number;
  db_error: number;
  blocked: number;
  rate_limited: number;
  attempts: number;
  conversionPct: number | null;
};

const KIND_MAP: Record<string, keyof Omit<Funnel, "attempts" | "conversionPct">> = {
  booking_success: "success",
  booking_validation_error: "validation_error",
  booking_db_error: "db_error",
  booking_blocked: "blocked",
  booking_rate_limited: "rate_limited",
};

export function funnel(rows: EventRow[], sinceMs: number, now: number = Date.now()): Funnel {
  const f: Funnel = { success: 0, validation_error: 0, db_error: 0, blocked: 0, rate_limited: 0, attempts: 0, conversionPct: null };
  for (const r of rows) {
    if (now - Date.parse(r.created_at) > sinceMs) continue;
    const k = KIND_MAP[r.kind];
    if (k) {
      f[k]++;
      f.attempts++;
    }
  }
  // Konwersja liczona względem prób ludzi (bez zablokowanych botów i limitu).
  const human = f.success + f.validation_error + f.db_error;
  f.conversionPct = human > 0 ? Math.round((f.success / human) * 100) : null;
  return f;
}

export function recentErrors(rows: EventRow[], limit = 20): EventRow[] {
  return rows.filter((r) => r.kind.endsWith("_error")).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);
}

export function countSince(isoDates: string[], sinceMs: number, now: number = Date.now()): number {
  return isoDates.filter((d) => now - Date.parse(d) <= sinceMs).length;
}

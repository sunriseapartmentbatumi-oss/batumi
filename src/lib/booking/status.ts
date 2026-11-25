export type ReservationStatus = "pending_payment" | "confirmed" | "cancelled" | "expired" | "completed";

export type StatusView = {
  reference: string;
  status: ReservationStatus;
  label: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  holdExpiresAt: string | null;
};

const LABELS: Record<ReservationStatus, string> = {
  pending_payment: "Oczekuje na potwierdzenie",
  confirmed: "Potwierdzona",
  cancelled: "Anulowana",
  expired: "Wygasła (blokada terminu przepadła)",
  completed: "Zakończona",
};

export function statusLabel(s: ReservationStatus): string {
  return LABELS[s];
}

export function normalizeReference(raw: string): string {
  return raw.trim().toUpperCase();
}

export const REFERENCE_PATTERN = /^BAT-[A-Z2-9]{8}$/;

export type ReservationRow = {
  reference: string;
  status: ReservationStatus;
  check_in: string;
  check_out: string;
  adults_count: number;
  children_count: number;
  hold_expires_at: string | null;
};

// Leniwe wygasanie (D063): przeterminowany hold jest pokazywany jako wygasły, nawet jeśli wiersz nie został jeszcze zaktualizowany.
export function toView(row: ReservationRow, now: Date = new Date()): StatusView {
  const stale =
    row.status === "pending_payment" && row.hold_expires_at !== null && Date.parse(row.hold_expires_at) <= now.getTime();
  const status: ReservationStatus = stale ? "expired" : row.status;
  return {
    reference: row.reference,
    status,
    label: statusLabel(status),
    check_in: row.check_in,
    check_out: row.check_out,
    adults: row.adults_count,
    children: row.children_count,
    holdExpiresAt: status === "pending_payment" ? row.hold_expires_at : null,
  };
}

// Prosty limiter w pamięci instancji (best effort; nie zastępuje ochrony na poziomie platformy).
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string, now: number = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) for (const k of hits.keys()) { hits.delete(k); break; }
    return true;
  };
}

export function formatHold(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tbilisi" }).format(new Date(iso)) + " (czas Batumi)";
}

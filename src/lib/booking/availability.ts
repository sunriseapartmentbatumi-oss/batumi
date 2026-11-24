export type DateRange = { check_in: string; check_out: string };

// Zakresy [check_in, check_out): dotykające się dni (check-out = check-in) są dozwolone.
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.check_in < b.check_out && b.check_in < a.check_out;
}

export function isAvailable(requested: DateRange, unavailable: readonly DateRange[]): boolean {
  return !unavailable.some((r) => rangesOverlap(requested, r));
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
}

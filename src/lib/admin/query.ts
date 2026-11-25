import "server-only";
import { searchTerm, type ReservationFilters } from "./reports";

type Builder = {
  eq(c: string, v: string): Builder;
  lte(c: string, v: string): Builder;
  gte(c: string, v: string): Builder;
  or(f: string): Builder;
};

// Wspólne filtry listy i eksportu CSV. Zakres dat = rezerwacje nakładające się na [from, to].
export function applyReservationFilters<T>(query: T, f: ReservationFilters): T {
  let q = query as unknown as Builder;
  if (f.status) q = q.eq("status", f.status);
  if (f.from) q = q.gte("check_out", f.from);
  if (f.to) q = q.lte("check_in", f.to);
  if (f.q) {
    const t = searchTerm(f.q);
    if (t) q = q.or(`reference.ilike.%${t}%,guest_last_name.ilike.%${t}%,guest_first_name.ilike.%${t}%,guest_email.ilike.%${t}%`);
  }
  return q as unknown as T;
}

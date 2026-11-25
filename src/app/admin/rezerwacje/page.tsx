import Link from "next/link";
import { applyReservationFilters } from "@/lib/admin/query";
import { parseFilters, STATUS_LABELS } from "@/lib/admin/reports";
import { requireAdmin } from "@/lib/admin/session";
import type { ReservationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Zapisano.",
  invalid: "Niepoprawne dane.",
  transition: "Ta zmiana statusu nie jest dozwolona.",
  error: "Błąd zapisu (np. termin koliduje z inną rezerwacją).",
};

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ status?: string; from?: string; to?: string; q?: string; msg?: string }> }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const { db } = await requireAdmin();
  await db.rpc("expire_stale_reservations").then(() => null, () => null);
  const { data } = await applyReservationFilters(db.from("reservations").select("id,reference,status,check_in,check_out,nights_count,adults_count,children_count,guest_first_name,guest_last_name,guest_email").order("created_at", { ascending: false }).limit(200), f);
  const exportQs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
  return (
    <main>
      <h1>Rezerwacje</h1>
      {sp.msg && messages[sp.msg] && <p role="status">{messages[sp.msg]}</p>}
      <form method="get" style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        <label>Szukaj (numer, imię, nazwisko, e-mail) <input type="search" name="q" defaultValue={f.q ?? ""} /></label>
        <label>Status
          <select name="status" defaultValue={f.status ?? ""}>
            <option value="">Wszystkie</option>
            {(Object.keys(STATUS_LABELS) as ReservationStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label>Pobyt od <input type="date" name="from" defaultValue={f.from ?? ""} /></label>
        <label>Pobyt do <input type="date" name="to" defaultValue={f.to ?? ""} /></label>
        <div><button type="submit">Filtruj</button> <Link href="/admin/rezerwacje">Wyczyść</Link> | <a href={`/admin/rezerwacje/export${exportQs ? `?${exportQs}` : ""}`}>Pobierz CSV</a></div>
      </form>
      <ul>
        {(data ?? []).map((r) => (
          <li key={r.id}>
            <Link href={`/admin/rezerwacje/${r.id}`}>{r.reference}</Link> – {STATUS_LABELS[r.status as ReservationStatus]} – {r.check_in} → {r.check_out} ({r.nights_count} nocy) – {r.guest_first_name} {r.guest_last_name}
          </li>
        ))}
      </ul>
      {(data ?? []).length === 0 && <p>Brak rezerwacji.</p>}
    </main>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { addDays, countByStatus, STATUS_LABELS } from "@/lib/admin/reports";
import type { ReservationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { db, email } = await requireAdmin();
  await db.rpc("expire_stale_reservations").then(() => null, () => null);
  const today = new Date().toISOString().slice(0, 10);
  const horizon = addDays(today, 14);
  const [all, arrivals, departures] = await Promise.all([
    db.from("reservations").select("status").limit(5000),
    db.from("reservations").select("id,reference,status,check_in,guest_last_name").in("status", ["pending_payment", "confirmed"]).gte("check_in", today).lte("check_in", horizon).order("check_in"),
    db.from("reservations").select("id,reference,status,check_out,guest_last_name").in("status", ["pending_payment", "confirmed"]).gte("check_out", today).lte("check_out", horizon).order("check_out"),
  ]);
  const counts = countByStatus(all.data ?? []);
  return (
    <main>
      <h1>Panel administracyjny</h1>
      <p>Zalogowano: {email}</p>
      <section aria-labelledby="counts">
        <h2 id="counts">Rezerwacje wg statusu</h2>
        <ul>
          {(Object.keys(STATUS_LABELS) as ReservationStatus[]).map((s) => (
            <li key={s}><Link href={`/admin/rezerwacje?status=${s}`}>{STATUS_LABELS[s]}: {counts[s]}</Link></li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="arr">
        <h2 id="arr">Najbliższe przyjazdy (14 dni)</h2>
        {(arrivals.data ?? []).length === 0 ? <p>Brak.</p> : (
          <ul>{(arrivals.data ?? []).map((r) => <li key={r.id}><Link href={`/admin/rezerwacje/${r.id}`}>{r.check_in} – {r.reference} ({r.guest_last_name}, {STATUS_LABELS[r.status as ReservationStatus]})</Link></li>)}</ul>
        )}
      </section>
      <section aria-labelledby="dep">
        <h2 id="dep">Najbliższe wyjazdy (14 dni)</h2>
        {(departures.data ?? []).length === 0 ? <p>Brak.</p> : (
          <ul>{(departures.data ?? []).map((r) => <li key={r.id}><Link href={`/admin/rezerwacje/${r.id}`}>{r.check_out} – {r.reference} ({r.guest_last_name}, {STATUS_LABELS[r.status as ReservationStatus]})</Link></li>)}</ul>
        )}
      </section>
      <ul>
        <li><Link href="/admin/rezerwacje">Wszystkie rezerwacje</Link></li>
        <li><Link href="/admin/kalendarz">Kalendarz</Link></li>
        <li><Link href="/admin/blokady">Blokady terminów</Link></li>
        <li><Link href="/admin/apartament">Dane apartamentu i udogodnienia</Link></li>
      </ul>
    </main>
  );
}

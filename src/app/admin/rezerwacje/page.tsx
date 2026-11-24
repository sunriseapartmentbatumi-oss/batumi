import Link from "next/link";
import { canTransition } from "@/lib/admin/logic";
import { requireAdmin } from "@/lib/admin/session";
import type { ReservationStatus } from "@/types/database";
import { changeStatus } from "./actions";

export const dynamic = "force-dynamic";

const labels: Record<ReservationStatus, string> = {
  pending_payment: "Oczekująca",
  confirmed: "Potwierdzona",
  cancelled: "Anulowana",
  expired: "Wygasła",
  completed: "Zakończona",
};
const messages: Record<string, string> = {
  saved: "Zapisano.",
  invalid: "Niepoprawne dane.",
  transition: "Ta zmiana statusu nie jest dozwolona.",
  error: "Błąd zapisu (np. termin koliduje z inną rezerwacją).",
};

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ status?: string; msg?: string }> }) {
  const { status, msg } = await searchParams;
  const { db } = await requireAdmin();
  await db.rpc("expire_stale_reservations").then(() => null, () => null);
  let q = db.from("reservations").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && status in labels) q = q.eq("status", status as ReservationStatus);
  const { data } = await q;
  return (
    <main>
      <h1>Rezerwacje</h1>
      {msg && messages[msg] && <p role="status">{messages[msg]}</p>}
      <p>
        <Link href="/admin/rezerwacje">Wszystkie</Link>
        {(Object.keys(labels) as ReservationStatus[]).map((s) => (
          <span key={s}> | <Link href={`/admin/rezerwacje?status=${s}`}>{labels[s]}</Link></span>
        ))}
      </p>
      {(data ?? []).map((r) => (
        <article key={r.id} style={{ border: "1px solid #ddd", padding: "0.75rem", marginBottom: "0.75rem" }}>
          <h3>{r.reference} – {labels[r.status as ReservationStatus]}</h3>
          <p>{r.check_in} – {r.check_out} ({r.nights_count} nocy), dorośli: {r.adults_count}, dzieci: {r.children_count}</p>
          <p>{r.guest_first_name} {r.guest_last_name}, {r.guest_email}, {r.guest_phone}</p>
          {r.guest_message && <p>Wiadomość: {r.guest_message}</p>}
          {(["confirmed", "cancelled", "completed"] as ReservationStatus[])
            .filter((to) => canTransition(r.status as ReservationStatus, to))
            .map((to) => (
              <form key={to} action={changeStatus} style={{ display: "inline", marginRight: "0.5rem" }}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="to" value={to} />
                <button type="submit">{to === "confirmed" ? "Potwierdź" : to === "cancelled" ? "Anuluj" : "Zakończ"}</button>
              </form>
            ))}
        </article>
      ))}
      {(data ?? []).length === 0 && <p>Brak rezerwacji.</p>}
    </main>
  );
}

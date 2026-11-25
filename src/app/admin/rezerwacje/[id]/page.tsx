import Link from "next/link";
import { notFound } from "next/navigation";
import { canTransition, idSchema } from "@/lib/admin/logic";
import { STATUS_LABELS } from "@/lib/admin/reports";
import { requireAdmin } from "@/lib/admin/session";
import type { ReservationStatus } from "@/types/database";
import { changeStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const { db } = await requireAdmin();
  await db.rpc("expire_stale_reservations").then(() => null, () => null);
  const { data: r } = await db.from("reservations").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();
  const status = r.status as ReservationStatus;
  const rows: [string, string][] = [
    ["Numer", r.reference],
    ["Status", STATUS_LABELS[status]],
    ["Termin", `${r.check_in} – ${r.check_out} (${r.nights_count} nocy)`],
    ["Osoby", `dorośli: ${r.adults_count}, dzieci: ${r.children_count}`],
    ["Gość", `${r.guest_first_name} ${r.guest_last_name}`],
    ["E-mail", r.guest_email],
    ["Telefon", r.guest_phone],
    ["Wiadomość", r.guest_message ?? "—"],
    ["Zgody (wersje regulaminu / polityki)", `${r.terms_version} / ${r.privacy_version}; zaakceptowano: ${r.terms_accepted_at}`],
    ["Blokada terminu do", r.hold_expires_at ?? "—"],
    ["Utworzono", r.created_at],
    ["Potwierdzono", r.confirmed_at ?? "—"],
    ["Anulowano", r.cancelled_at ?? "—"],
    ["Zakończono", r.completed_at ?? "—"],
  ];
  return (
    <main>
      <h1>Rezerwacja {r.reference}</h1>
      <dl>
        {rows.map(([k, v]) => (<div key={k}><dt><strong>{k}</strong></dt><dd>{v}</dd></div>))}
      </dl>
      <p>Cena i opłaty: [DO POTWIERDZENIA]. Historia zmian statusu i notatki nie są jeszcze zapisywane (wymagałyby migracji).</p>
      {(["confirmed", "cancelled", "completed"] as ReservationStatus[]).filter((to) => canTransition(status, to)).map((to) => (
        <form key={to} action={changeStatus} style={{ display: "inline", marginRight: "0.5rem" }}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="to" value={to} />
          <button type="submit">{to === "confirmed" ? "Potwierdź" : to === "cancelled" ? "Anuluj" : "Zakończ"}</button>
        </form>
      ))}
      <p><Link href="/admin/rezerwacje">← Lista rezerwacji</Link></p>
    </main>
  );
}

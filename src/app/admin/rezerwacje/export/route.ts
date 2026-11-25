import { applyReservationFilters } from "@/lib/admin/query";
import { parseFilters, STATUS_LABELS, toCsv } from "@/lib/admin/reports";
import { requireAdmin } from "@/lib/admin/session";
import { logDbError } from "@/lib/diagnostics";
import type { ReservationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { db } = await requireAdmin();
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const f = parseFilters(sp);
  const { data, error } = await applyReservationFilters(
    db.from("reservations").select("reference,status,check_in,check_out,nights_count,adults_count,children_count,guest_first_name,guest_last_name,guest_email,guest_phone,guest_message,hold_expires_at,created_at").order("created_at", { ascending: false }).limit(5000),
    f,
  );
  if (error) {
    logDbError("admin.exportCsv", error, {});
    return new Response("Błąd eksportu.", { status: 500 });
  }
  const header = ["Numer", "Status", "Przyjazd", "Wyjazd", "Noce", "Dorośli", "Dzieci", "Imię", "Nazwisko", "E-mail", "Telefon", "Wiadomość", "Blokada do", "Utworzono"];
  const rows = (data ?? []).map((r) => [r.reference, STATUS_LABELS[r.status as ReservationStatus], r.check_in, r.check_out, r.nights_count, r.adults_count, r.children_count, r.guest_first_name, r.guest_last_name, r.guest_email, r.guest_phone, r.guest_message, r.hold_expires_at, r.created_at]);
  return new Response(toCsv(header, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rezerwacje-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

"use server";
import { headers } from "next/headers";
import { serverClient } from "@/lib/booking/server";
import { createRateLimiter, normalizeReference, REFERENCE_PATTERN, toView, type ReservationRow, type StatusView } from "@/lib/booking/status";
import { logDbError } from "@/lib/diagnostics";

export type StatusState = { view?: StatusView; error?: string; values?: { reference: string; email: string } };

const NOT_FOUND = "Nie znaleziono rezerwacji dla podanego numeru i adresu e-mail.";
const allow = createRateLimiter(10, 10 * 60_000);

export async function checkStatus(_prev: StatusState, formData: FormData): Promise<StatusState> {
  const reference = normalizeReference(String(formData.get("reference") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const values = { reference, email };
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!allow(ip)) return { error: "Zbyt wiele prób. Spróbuj ponownie za kilka minut.", values };
    if (!REFERENCE_PATTERN.test(reference) || email.length < 3 || email.length > 200) return { error: NOT_FOUND, values };
    const db = serverClient();
    if (!db) return { error: "Sprawdzanie statusu jest chwilowo niedostępne.", values };
    const { data, error } = await db
      .from("reservations")
      .select("reference,status,check_in,check_out,adults_count,children_count,hold_expires_at")
      .eq("reference", reference)
      .ilike("guest_email", email.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();
    if (error) {
      logDbError("check_reservation_status", error, {});
      return { error: "Nie udało się sprawdzić statusu. Spróbuj ponownie później.", values };
    }
    if (!data) return { error: NOT_FOUND, values };
    return { view: toView(data as unknown as ReservationRow), values };
  } catch (e) {
    console.error("[action-error]", JSON.stringify({ operation: "checkStatus", message: e instanceof Error ? e.message : String(e) }));
    return { error: "Nie udało się sprawdzić statusu. Spróbuj ponownie później.", values };
  }
}

"use server";
import { bookingSchema, makeReference } from "@/lib/booking/validation";
import { notifyByEmail, serverClient } from "@/lib/booking/server";
import { TBC } from "@/lib/site";

export type BookingState = { ok?: boolean; reference?: string; error?: string; fieldErrors?: Record<string, string> };

const HOLD_MINUTES = 15;

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const today = new Date().toISOString().slice(0, 10);
  const parsed = bookingSchema(today).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors };
  }
  const db = serverClient();
  if (!db) return { error: "Rezerwacje są chwilowo niedostępne. Skontaktuj się z nami bezpośrednio." };

  const v = parsed.data;
  const reference = makeReference();
  const { error } = await db.rpc("create_pending_reservation", {
    p_reference: reference,
    p_check_in: v.check_in,
    p_check_out: v.check_out,
    p_adults: v.adults,
    p_children: v.children,
    p_first_name: v.first_name,
    p_last_name: v.last_name,
    p_email: v.email,
    p_phone: v.phone,
    p_message: v.message ?? null,
    p_terms_version: TBC,
    p_privacy_version: TBC,
    p_hold_minutes: HOLD_MINUTES,
  });
  if (error) {
    if (error.message.includes("dates_unavailable")) return { error: "Wybrany termin jest już zajęty." };
    if (error.message.includes("min_stay")) return { error: "Termin jest krótszy niż minimalny pobyt." };
    return { error: "Nie udało się zapisać rezerwacji. Spróbuj ponownie później." };
  }
  await notifyByEmail(
    `Nowa rezerwacja ${reference}`,
    `${v.first_name} ${v.last_name}, ${v.email}, ${v.phone}\n${v.check_in} – ${v.check_out}, dorośli: ${v.adults}, dzieci: ${v.children}`,
  );
  return { ok: true, reference };
}

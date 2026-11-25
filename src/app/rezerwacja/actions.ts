"use server";
import { bookingSchema, makeReference } from "@/lib/booking/validation";
import { notifyByEmail, serverClient } from "@/lib/booking/server";
import { TBC } from "@/lib/site";
import { logDbError, userMessage } from "@/lib/diagnostics";

export type BookingState = {
  ok?: boolean;
  reference?: string;
  summary?: { check_in: string; check_out: string; adults: number; children: number; holdExpiresAt: string };
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const GENERIC_ERROR = "Nie udało się zapisać rezerwacji. Spróbuj ponownie później.";

// Wartości do odtworzenia formularza po błędzie (React 19 czyści pola po akcji).
function echoValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$ACTION")) out[k] = v;
  return out;
}

const HOLD_MINUTES = 15;

async function handle(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const today = new Date().toISOString().slice(0, 10);
  const parsed = bookingSchema(today).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    console.error("[validation-error]", JSON.stringify({ operation: "submitBooking", fields: Object.keys(fieldErrors) }));
    return { error: "Popraw zaznaczone pola formularza.", fieldErrors, values: echoValues(formData) };
  }
  const db = serverClient();
  if (!db) {
    console.error("[config-error]", JSON.stringify({
      operation: "submitBooking",
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    }));
    return { error: "Rezerwacje są chwilowo niedostępne (brak konfiguracji). Skontaktuj się z nami bezpośrednio.", values: echoValues(formData) };
  }

  const v = parsed.data;
  const reference = makeReference();
  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();
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
    const kind = logDbError("create_pending_reservation", error, { reference });
    return { error: userMessage(kind), values: echoValues(formData) };
  }
  await notifyByEmail(
    `Nowa rezerwacja ${reference}`,
    `${v.first_name} ${v.last_name}, ${v.email}, ${v.phone}\n${v.check_in} – ${v.check_out}, dorośli: ${v.adults}, dzieci: ${v.children}`,
  );
  return { ok: true, reference, summary: { check_in: v.check_in, check_out: v.check_out, adults: v.adults, children: v.children, holdExpiresAt } };
}

export async function submitBooking(prev: BookingState, formData: FormData): Promise<BookingState> {
  try {
    return await handle(prev, formData);
  } catch (e) {
    console.error("[action-error]", JSON.stringify({ operation: "submitBooking", message: e instanceof Error ? e.message : String(e) }));
    return { error: GENERIC_ERROR, values: echoValues(formData) };
  }
}

import "server-only";
import { createClient } from "@supabase/supabase-js";

// Klucz service_role wyłącznie po stronie serwera (bez NEXT_PUBLIC_).
export function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type EmailResult = { sent: boolean; reason: string };

// Zwraca wynik (do diagnostyki); błąd e-maila nigdy nie blokuje rezerwacji, a szczegóły trafiają tylko do logów.
export async function notifyByEmail(subject: string, text: string): Promise<EmailResult> {
  const missing = ["RESEND_API_KEY", "BOOKING_NOTIFY_EMAIL", "BOOKING_FROM_EMAIL"].filter((k) => !process.env[k]);
  if (missing.length > 0) return { sent: false, reason: `Brak zmiennych: ${missing.join(", ")}` };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.BOOKING_FROM_EMAIL, to: process.env.BOOKING_NOTIFY_EMAIL, subject, text }),
    });
    if (!res.ok) {
      console.error("[email-error]", JSON.stringify({ operation: "notifyByEmail", status: res.status }));
      return { sent: false, reason: `Resend odpowiedział statusem ${res.status} (sprawdź klucz API i nadawcę)` };
    }
    return { sent: true, reason: "Wysłano (sprawdź skrzynkę, spam i zakładkę Emails w Resend)" };
  } catch (e) {
    console.error("[email-error]", JSON.stringify({ operation: "notifyByEmail", message: e instanceof Error ? e.message : String(e) }));
    return { sent: false, reason: "Błąd połączenia z Resend" };
  }
}

// Potwierdzenie dla gościa: wyłączone domyślnie (guestEmailEnabled sprawdza flagę i domenę nadawcy w wywołującym).
export async function sendGuestEmail(to: string, mail: { subject: string; text: string; html: string }): Promise<EmailResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.BOOKING_FROM_EMAIL, to, subject: mail.subject, text: mail.text, html: mail.html }),
    });
    if (!res.ok) {
      console.error("[email-error]", JSON.stringify({ operation: "sendGuestEmail", status: res.status }));
      return { sent: false, reason: `Resend odpowiedział statusem ${res.status}` };
    }
    return { sent: true, reason: "Wysłano" };
  } catch (e) {
    console.error("[email-error]", JSON.stringify({ operation: "sendGuestEmail", message: e instanceof Error ? e.message : String(e) }));
    return { sent: false, reason: "Błąd połączenia z Resend" };
  }
}

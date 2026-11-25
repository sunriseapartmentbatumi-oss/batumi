import "server-only";
import { serverClient } from "@/lib/booking/server";

export type EventKind =
  | "booking_success"
  | "booking_validation_error"
  | "booking_db_error"
  | "booking_blocked"
  | "booking_rate_limited"
  | "admin_action_error"
  | "email_error";

// Best effort: zapis do opcjonalnej tabeli app_events; brak tabeli lub błąd nigdy nie psuje akcji.
// W `detail` wyłącznie dane techniczne (kody błędów, nazwy pól) – bez danych osobowych i sekretów.
export async function recordEvent(kind: EventKind, operation: string, detail: Record<string, unknown> = {}): Promise<void> {
  try {
    const db = serverClient();
    if (!db) return;
    await db.from("app_events").insert({ kind, operation, detail });
  } catch {
    // celowo ignorujemy
  }
}

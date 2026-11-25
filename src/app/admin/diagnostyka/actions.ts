"use server";
import { requireAdmin } from "@/lib/admin/session";
import { notifyByEmail } from "@/lib/booking/server";
import { maskEmail } from "@/lib/mask";

export type TestEmailState = { done?: boolean; sent?: boolean; reason?: string };

export async function sendTestEmail(): Promise<TestEmailState> {
  await requireAdmin();
  const result = await notifyByEmail("Test powiadomień – Sunrise Batumi", "To jest testowa wiadomość z /admin/diagnostyka. Jeśli ją widzisz, powiadomienia o rezerwacjach działają.");
  console.error("[email-test]", JSON.stringify({ sent: result.sent, to: maskEmail(process.env.BOOKING_NOTIFY_EMAIL ?? "") }));
  return { done: true, ...result };
}

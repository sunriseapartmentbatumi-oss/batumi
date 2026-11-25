import { NextResponse } from "next/server";
import { guestEmailEnabled } from "@/lib/booking/guest-email";
import { isCronAuthorized, parseReminderDays, runReminders } from "@/lib/booking/reminder";
import { sendGuestEmail, serverClient } from "@/lib/booking/server";
import { recordEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

// Vercel Cron wysyła Authorization: Bearer $CRON_SECRET (tylko wdrożenie Production).
export async function GET(req: Request) {
  if (!isCronAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!guestEmailEnabled(process.env)) {
    await recordEvent("cron_reminders", "reminders", { skipped: "guest_email_disabled" });
    return NextResponse.json({ skipped: "guest_email_disabled" });
  }
  const db = serverClient();
  if (!db) return NextResponse.json({ error: "config" }, { status: 500 });
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    const run = await runReminders(db, sendGuestEmail, {
      now: new Date(),
      days: parseReminderDays(process.env.REMINDER_DAYS_BEFORE),
      statusUrl: base ? `${base}/rezerwacja/status` : null,
    });
    await recordEvent("cron_reminders", "reminders", { ...run });
    return NextResponse.json(run);
  } catch (e) {
    console.error("[cron-error]", JSON.stringify({ operation: "reminders", message: e instanceof Error ? e.message : String(e) }));
    await recordEvent("admin_action_error", "cron.reminders", {});
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

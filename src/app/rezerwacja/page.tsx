import type { Metadata } from "next";
import Link from "next/link";
import { serverClient } from "@/lib/booking/server";
import { BookingForm } from "./form";
import type { DateRange } from "@/lib/booking/availability";

export const metadata: Metadata = { title: "Rezerwacja", description: "Zarezerwuj termin w apartamencie w Batumi." };
export const dynamic = "force-dynamic";

async function unavailable(): Promise<DateRange[]> {
  const db = serverClient();
  if (!db) return [];
  const { data } = await db.rpc("get_unavailable_ranges");
  return (data as DateRange[] | null) ?? [];
}

export default async function BookingPage() {
  const ranges = (await unavailable()).sort((a, b) => a.check_in.localeCompare(b.check_in));
  return (
    <main className="page">
      <h1>Rezerwacja</h1>
      <section>
        <h2>Zajęte terminy</h2>
        {ranges.length === 0 ? (
          <p>Brak zajętych terminów w kalendarzu (dostępność wymaga potwierdzenia).</p>
        ) : (
          <ul>
            {ranges.map((r) => (
              <li key={r.check_in + r.check_out}>{r.check_in} – {r.check_out}</li>
            ))}
          </ul>
        )}
      </section>
      <BookingForm />
      <p><Link href="/rezerwacja/status">Sprawdź status rezerwacji</Link></p>
      <p><Link href="/">Wróć na stronę główną</Link></p>
    </main>
  );
}

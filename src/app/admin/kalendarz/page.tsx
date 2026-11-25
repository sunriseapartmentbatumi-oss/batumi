import Link from "next/link";
import { addDays, itemsForDay, monthGrid, parseDaterange, parseMonth, shiftMonth, type CalendarItem } from "@/lib/admin/reports";
import { requireAdmin } from "@/lib/admin/session";
import type { ReservationStatus } from "@/types/database";

export const dynamic = "force-dynamic";

const DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const month = parseMonth(m, today);
  const grid = monthGrid(month);
  const start = grid[0][0].date;
  const end = addDays(grid[grid.length - 1][6].date, 1);
  const { db } = await requireAdmin();
  await db.rpc("expire_stale_reservations").then(() => null, () => null);
  const [res, blocks] = await Promise.all([
    db.from("reservations").select("id,reference,status,check_in,check_out,guest_last_name").in("status", ["pending_payment", "confirmed"]).lt("check_in", end).gt("check_out", start),
    db.from("calendar_blocks").select("id,blocked_during,reason"),
  ]);
  const items: CalendarItem[] = [
    ...(res.data ?? []).map((r) => ({ kind: "reservation" as const, label: `${r.reference} ${r.guest_last_name}`, from: r.check_in, to: r.check_out, status: r.status as ReservationStatus })),
    ...(blocks.data ?? []).flatMap((b) => {
      const p = parseDaterange(b.blocked_during);
      return p ? [{ kind: "block" as const, label: b.reason ? `Blokada: ${b.reason}` : "Blokada", from: p.from, to: p.to }] : [];
    }),
  ];
  return (
    <main>
      <h1>Kalendarz {month}</h1>
      <p>
        <Link href={`/admin/kalendarz?m=${shiftMonth(month, -1)}`}>← Poprzedni</Link> | <Link href="/admin/kalendarz">Bieżący</Link> | <Link href={`/admin/kalendarz?m=${shiftMonth(month, 1)}`}>Następny →</Link>
      </p>
      <p>Komórka = noc rozpoczynająca się tego dnia (dzień wyjazdu jest wolny). Oczekująca = blokada do czasu wygaśnięcia.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead><tr>{DAYS.map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
        <tbody>
          {grid.map((w, i) => (
            <tr key={i}>
              {w.map((c) => (
                <td key={c.date} style={{ border: "1px solid #86efac", verticalAlign: "top", padding: "0.25rem", fontSize: "0.8rem", opacity: c.inMonth ? 1 : 0.5 }}>
                  <strong>{Number(c.date.slice(8))}</strong>
                  {itemsForDay(items, c.date).map((it, j) => (
                    <div key={j} style={{ background: it.kind === "block" ? "#e5e7eb" : it.status === "confirmed" ? "#bbf7d0" : "#fef08a", color: "#14221a", marginTop: 2, padding: "0 2px" }}>
                      {it.label}{it.kind === "reservation" ? (it.status === "confirmed" ? " (potw.)" : " (oczek.)") : ""}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p><Link href="/admin/blokady">Zarządzaj blokadami</Link></p>
    </main>
  );
}

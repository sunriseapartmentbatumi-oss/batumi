import { requireAdmin } from "@/lib/admin/session";
import { addBlock, deleteBlock } from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Zapisano.",
  invalid: "Niepoprawne dane.",
  error: "Błąd zapisu.",
  noproperty: "Najpierw utwórz apartament (Apartament).",
};

export default async function BlocksPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const { db } = await requireAdmin();
  const { data } = await db.from("calendar_blocks").select("id,blocked_during,reason").order("created_at", { ascending: false });
  return (
    <main>
      <h1>Blokady terminów</h1>
      {msg && messages[msg] && <p role="status">{messages[msg]}</p>}
      <form action={addBlock} style={{ display: "grid", gap: "0.75rem" }}>
        <label>Od (pierwsza zablokowana noc) <input type="date" name="from" required /></label>
        <label>Do (dzień wyjazdu) <input type="date" name="to" required /></label>
        <label>Powód (opcjonalnie) <input name="reason" /></label>
        <button type="submit">Dodaj blokadę</button>
      </form>
      <h2>Aktywne blokady</h2>
      <ul>
        {(data ?? []).map((b) => (
          <li key={b.id}>
            {String(b.blocked_during)} {b.reason ? `– ${b.reason}` : ""}{" "}
            <form action={deleteBlock} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <button type="submit">Usuń</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}

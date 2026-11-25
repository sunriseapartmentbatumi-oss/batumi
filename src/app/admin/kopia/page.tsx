import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const TABLES: [string, string][] = [
  ["reservations", "Rezerwacje"],
  ["calendar_blocks", "Blokady terminów"],
  ["properties", "Apartament"],
  ["amenities", "Udogodnienia"],
];

export default async function BackupPage() {
  await requireAdmin();
  return (
    <main>
      <h1>Kopia zapasowa danych</h1>
      <p>Eksport zawiera dane osobowe gości – przechowuj pliki bezpiecznie. Zalecane: pobieranie pełnej kopii regularnie (np. raz w tygodniu i przed większymi zmianami).</p>
      <p><a href="/admin/backup?format=json" download>Pobierz pełną kopię (JSON: rezerwacje, blokady, apartament, udogodnienia)</a></p>
      <h2>Pojedyncze tabele (CSV)</h2>
      <ul>
        {TABLES.map(([t, label]) => (
          <li key={t}><a href={`/admin/backup?format=csv&table=${t}`} download>{label} (CSV)</a></li>
        ))}
      </ul>
      <p><small>Kopia to eksport danych, nie pełny zrzut bazy (bez użytkowników Auth i funkcji). Zobacz docs/SETUP.md – procedura backupu.</small></p>
    </main>
  );
}

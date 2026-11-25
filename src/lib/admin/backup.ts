import { toCsv } from "./reports";

export const BACKUP_TABLES = ["reservations", "calendar_blocks", "properties", "amenities"] as const;
export type BackupTable = (typeof BACKUP_TABLES)[number];

export function parseBackupTable(v: string | null): BackupTable | null {
  return (BACKUP_TABLES as readonly string[]).includes(v ?? "") ? (v as BackupTable) : null;
}

type Row = Record<string, unknown>;

// Kolumny = suma kluczy ze wszystkich wierszy (stała kolejność pierwszego wystąpienia); obiekty jako JSON.
export function rowsToCsv(rows: Row[]): string {
  const cols: string[] = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  const cell = (v: unknown) => (v !== null && typeof v === "object" ? JSON.stringify(v) : v);
  return toCsv(cols, rows.map((r) => cols.map((c) => cell(r[c]))));
}

export function buildJsonBackup(data: Record<BackupTable, Row[]>, now: Date = new Date()) {
  return {
    exported_at: now.toISOString(),
    note: "Kopia danych z panelu admina. Zawiera dane osobowe gości – przechowuj bezpiecznie i nie wysyłaj w niezabezpieczonych kanałach.",
    counts: Object.fromEntries(BACKUP_TABLES.map((t) => [t, data[t].length])),
    tables: data,
  };
}

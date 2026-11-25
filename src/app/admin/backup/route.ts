import { BACKUP_TABLES, buildJsonBackup, parseBackupTable, rowsToCsv, type BackupTable } from "@/lib/admin/backup";
import { requireAdmin } from "@/lib/admin/session";
import { logDbError } from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

const LIMIT = 20000;

// GET /admin/backup?format=json (wszystko) lub ?format=csv&table=reservations|calendar_blocks|properties|amenities
export async function GET(req: Request) {
  const { db } = await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const day = new Date().toISOString().slice(0, 10);
  const noStore = { "Cache-Control": "no-store" };

  const load = async (t: BackupTable) => {
    const { data, error } = await db.from(t).select("*").limit(LIMIT);
    if (error) {
      logDbError(`admin.backup.${t}`, error, {});
      throw new Error(t);
    }
    return (data ?? []) as Record<string, unknown>[];
  };

  try {
    if (sp.get("format") === "csv") {
      const table = parseBackupTable(sp.get("table"));
      if (!table) return new Response("Nieznana tabela.", { status: 400 });
      return new Response(rowsToCsv(await load(table)), {
        headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${table}-${day}.csv"` },
      });
    }
    const entries = await Promise.all(BACKUP_TABLES.map(async (t) => [t, await load(t)] as const));
    const body = JSON.stringify(buildJsonBackup(Object.fromEntries(entries) as Record<BackupTable, Record<string, unknown>[]>), null, 2);
    return new Response(body, {
      headers: { ...noStore, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="batumi-backup-${day}.json"` },
    });
  } catch {
    return new Response("Błąd eksportu.", { status: 500 });
  }
}

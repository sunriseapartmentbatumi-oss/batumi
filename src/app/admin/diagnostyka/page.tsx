import { serverClient } from "@/lib/booking/server";
import { adminHint, classifyDbError } from "@/lib/diagnostics";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

type Check = { name: string; ok: boolean; info: string; hint?: string };

async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const env = (k: string) => Boolean(process.env[k]);
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "BOOKING_NOTIFY_EMAIL", "BOOKING_FROM_EMAIL"]) {
    const required = !k.startsWith("RESEND") && !k.startsWith("BOOKING");
    checks.push({
      name: `Zmienna ${k}`,
      ok: env(k) || !required,
      info: env(k) ? "ustawiona" : required ? "BRAK" : "nieustawiona (opcjonalna – e-mail pomijany)",
      hint: !env(k) && required ? "Ustaw w Vercel → Settings → Environment Variables dla tego środowiska i zrób redeploy." : undefined,
    });
  }
  let host = "brak";
  try {
    host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {}
  checks.push({ name: "Host Supabase", ok: host !== "brak", info: host, hint: "Staging i produkcja powinny wskazywać różne projekty." });
  checks.push({ name: "VERCEL_ENV", ok: true, info: process.env.VERCEL_ENV ?? "(brak – lokalnie)" });

  const db = serverClient();
  if (!db) {
    checks.push({ name: "Połączenie z bazą (service_role)", ok: false, info: "brak klienta", hint: "Uzupełnij brakujące zmienne powyżej." });
    return checks;
  }
  const prop = await db.from("properties").select("id", { count: "exact", head: true });
  checks.push(
    prop.error
      ? { name: "Tabela properties", ok: false, info: `${prop.error.code ?? ""} ${prop.error.message}`, hint: adminHint(classifyDbError(prop.error)) }
      : { name: "Wiersz w properties", ok: (prop.count ?? 0) > 0, info: `liczba wierszy: ${prop.count ?? 0}`, hint: (prop.count ?? 0) > 0 ? undefined : adminHint("no_property") },
  );
  // Wywołanie z odwróconymi datami kończy się błędem min_stay/no_property przed jakimkolwiek zapisem.
  const rpc = await db.rpc("create_pending_reservation", {
    p_reference: "DIAG", p_check_in: "2000-01-02", p_check_out: "2000-01-01", p_adults: 1, p_children: 0,
    p_first_name: "x", p_last_name: "x", p_email: "x", p_phone: "x", p_message: null,
    p_terms_version: "x", p_privacy_version: "x", p_hold_minutes: 1,
  });
  const kind = rpc.error ? classifyDbError(rpc.error) : "unknown";
  const exists = kind === "min_stay" || kind === "no_property";
  checks.push({
    name: "Funkcja create_pending_reservation",
    ok: exists,
    info: exists ? "dostępna" : `${rpc.error?.code ?? ""} ${rpc.error?.message ?? "nieoczekiwany wynik"}`,
    hint: exists ? undefined : adminHint(kind),
  });
  const ranges = await db.rpc("get_unavailable_ranges");
  checks.push({
    name: "Funkcja get_unavailable_ranges",
    ok: !ranges.error,
    info: ranges.error ? `${ranges.error.code ?? ""} ${ranges.error.message}` : "dostępna",
    hint: ranges.error ? adminHint(classifyDbError(ranges.error)) : undefined,
  });
  return checks;
}

export default async function DiagnosticsPage() {
  await requireAdmin();
  const checks = await runChecks();
  return (
    <main>
      <h1>Diagnostyka</h1>
      <p>Pokazuje tylko informację, czy zmienne są ustawione – nigdy ich wartości.</p>
      <ul>
        {checks.map((c) => (
          <li key={c.name}>
            {c.ok ? "✅" : "❌"} <strong>{c.name}</strong>: {c.info}
            {c.hint && <div><em>Co zrobić: {c.hint}</em></div>}
          </li>
        ))}
      </ul>
    </main>
  );
}

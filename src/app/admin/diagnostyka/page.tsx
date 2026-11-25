import { serverClient } from "@/lib/booking/server";
import { adminHint, classifyDbError } from "@/lib/diagnostics";
import { requireAdmin } from "@/lib/admin/session";
import { countSince, funnel, recentErrors, type EventRow } from "@/lib/metrics";
import { TestEmailButton } from "./test-email";

export const dynamic = "force-dynamic";

type Check = { name: string; ok: boolean; info: string; hint?: string };

async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const env = (k: string) => Boolean(process.env[k]);
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "BOOKING_NOTIFY_EMAIL", "BOOKING_FROM_EMAIL", "GUEST_EMAIL_ENABLED", "CRON_SECRET", "REMINDER_DAYS_BEFORE"]) {
    const required = !/^(RESEND|BOOKING|GUEST|CRON|REMINDER)/.test(k);
    checks.push({
      name: `Zmienna ${k}`,
      ok: env(k) || !required,
      info: env(k) ? "ustawiona" : required ? "BRAK" : "nieustawiona (opcjonalna – funkcja wyłączona/domyślna)",
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

const DAY = 86_400_000;

async function loadMetrics(db: Awaited<ReturnType<typeof requireAdmin>>["db"]) {
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const res = await db.from("reservations").select("created_at").gte("created_at", since);
  const dates = ((res.data ?? []) as { created_at: string }[]).map((r) => r.created_at);
  const ev = await db.from("app_events").select("created_at,kind,operation,detail").gte("created_at", since).order("created_at", { ascending: false }).limit(2000);
  return {
    reservations7: countSince(dates, 7 * DAY),
    reservations30: countSince(dates, 30 * DAY),
    reservationsError: res.error?.message,
    events: ev.error ? null : ((ev.data ?? []) as EventRow[]),
  };
}

export default async function DiagnosticsPage() {
  const { db } = await requireAdmin();
  const checks = await runChecks();
  const m = await loadMetrics(db);
  const f7 = m.events ? funnel(m.events, 7 * DAY) : null;
  const f30 = m.events ? funnel(m.events, 30 * DAY) : null;
  const lastCron = m.events?.find((e) => e.kind === "cron_reminders");
  const errors = m.events ? recentErrors(m.events) : [];
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

      <h2>Powiadomienia e-mail</h2>
      <p>Wysyła wiadomość testową na adres z BOOKING_NOTIFY_EMAIL (tak samo jak powiadomienie o rezerwacji). Wynik pokazuje także brak zmiennych.</p>
      <TestEmailButton />

      <h2>Przypomnienia o zameldowaniu (cron)</h2>
      {m.events ? (
        lastCron ? (
          <p>Ostatnie uruchomienie: {new Date(lastCron.created_at).toLocaleString("pl-PL", { timeZone: "Asia/Tbilisi" })} – <code>{JSON.stringify(lastCron.detail ?? {})}</code></p>
        ) : <p>Brak zapisanych uruchomień (cron działa tylko na Production i wymaga CRON_SECRET; wysyła tylko przy GUEST_EMAIL_ENABLED=true).</p>
      ) : <p>Historia uruchomień wymaga tabeli <code>app_events</code>; sprawdź Vercel → Logs.</p>}

      <h2>Metryki rezerwacji</h2>
      <ul>
        <li>Rezerwacje utworzone w ostatnich 7 dniach: <strong>{m.reservations7}</strong>, w ostatnich 30 dniach: <strong>{m.reservations30}</strong></li>
      </ul>
      {f7 && f30 ? (
        <table>
          <thead><tr><th scope="col">Formularz</th><th scope="col">7 dni</th><th scope="col">30 dni</th></tr></thead>
          <tbody>
            <tr><th scope="row">Zapisane rezerwacje</th><td>{f7.success}</td><td>{f30.success}</td></tr>
            <tr><th scope="row">Błędy walidacji</th><td>{f7.validation_error}</td><td>{f30.validation_error}</td></tr>
            <tr><th scope="row">Błędy zapisu</th><td>{f7.db_error}</td><td>{f30.db_error}</td></tr>
            <tr><th scope="row">Zablokowane (boty)</th><td>{f7.blocked}</td><td>{f30.blocked}</td></tr>
            <tr><th scope="row">Limit zapytań</th><td>{f7.rate_limited}</td><td>{f30.rate_limited}</td></tr>
            <tr><th scope="row">Konwersja (zapis / próby ludzi)</th><td>{f7.conversionPct === null ? "–" : `${f7.conversionPct}%`}</td><td>{f30.conversionPct === null ? "–" : `${f30.conversionPct}%`}</td></tr>
          </tbody>
        </table>
      ) : (
        <p>❌ Brak dziennika zdarzeń (tabela <code>app_events</code>). Jest opcjonalna: wklej migrację <code>20261125100000_app_events.sql</code> w SQL Editor (docs/SETUP.md). Bez niej błędy są tylko w Vercel → Logs (szukaj [db-error], [validation-error], [action-error], [bot-blocked]).</p>
      )}

      {m.events && (
        <>
          <h2>Ostatnie błędy formularza i akcji</h2>
          {errors.length === 0 ? <p>Brak błędów w ostatnich 30 dniach.</p> : (
            <ul>
              {errors.map((e, i) => (
                <li key={i}>{new Date(e.created_at).toLocaleString("pl-PL", { timeZone: "Asia/Tbilisi" })} – <strong>{e.kind}</strong> ({e.operation}) <code>{JSON.stringify(e.detail ?? {})}</code></li>
              ))}
            </ul>
          )}
        </>
      )}
      <p><small>Pełne logi serwera: Vercel → projekt → Logs. Ruch na stronie: Vercel Analytics (opcjonalnie, włącza Konrad w Vercel).</small></p>
    </main>
  );
}

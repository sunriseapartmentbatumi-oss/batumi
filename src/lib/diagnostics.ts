export type DbError = { code?: string | null; message?: string | null; details?: string | null; hint?: string | null };

export type ErrorKind =
  | "dates_unavailable"
  | "min_stay"
  | "no_property"
  | "function_missing"
  | "permission"
  | "bad_key"
  | "network"
  | "unknown";

export function classifyDbError(error: DbError): ErrorKind {
  const msg = error.message ?? "";
  const code = error.code ?? "";
  if (msg.includes("dates_unavailable")) return "dates_unavailable";
  if (msg.includes("min_stay")) return "min_stay";
  if (msg.includes("no_property")) return "no_property";
  if (code === "PGRST202" || code === "42883" || /could not find the function/i.test(msg)) return "function_missing";
  if (code === "42501" || /permission denied/i.test(msg)) return "permission";
  if (code === "PGRST301" || /invalid api key|jwt/i.test(msg)) return "bad_key";
  if (/fetch failed|network|ENOTFOUND|ECONNREFUSED/i.test(msg)) return "network";
  return "unknown";
}

// Komunikaty dla gościa: tylko ogólne, szczegóły zostają w logach serwera.
export function userMessage(kind: ErrorKind): string {
  switch (kind) {
    case "dates_unavailable":
      return "Wybrany termin jest już zajęty.";
    case "min_stay":
      return "Termin jest krótszy niż minimalny pobyt.";
    case "no_property":
    case "function_missing":
    case "permission":
    case "bad_key":
    case "network":
      return "Rezerwacje są chwilowo niedostępne (błąd konfiguracji). Skontaktuj się z nami bezpośrednio.";
    default:
      return "Nie udało się zapisać rezerwacji. Spróbuj ponownie później.";
  }
}

// Podpowiedź dla administratora (panel diagnostyczny).
export function adminHint(kind: ErrorKind): string {
  switch (kind) {
    case "no_property":
      return "Brak wiersza w tabeli properties – utwórz apartament w panelu: Apartament.";
    case "function_missing":
      return "Brak funkcji w bazie lub nieodświeżony cache API – zastosuj migracje (supabase db push) na tym środowisku.";
    case "permission":
      return "Brak uprawnień – sprawdź, czy migracje zostały zastosowane w całości i czy używany jest klucz service_role.";
    case "bad_key":
      return "Klucz Supabase jest nieprawidłowy lub należy do innego projektu – sprawdź zmienne w Vercel dla tego środowiska.";
    case "network":
      return "Nie można połączyć się z Supabase – sprawdź NEXT_PUBLIC_SUPABASE_URL i czy projekt nie jest wstrzymany (pauza Free).";
    default:
      return "Sprawdź logi serwera w Vercel (szukaj wpisu [db-error]).";
  }
}

// Bez PII i sekretów: tylko operacja, pola błędu i bezpieczny kontekst (np. referencja rezerwacji).
export function logDbError(operation: string, error: DbError, context: Record<string, string> = {}): ErrorKind {
  const kind = classifyDbError(error);
  console.error("[db-error]", JSON.stringify({
    operation,
    kind,
    code: error.code ?? null,
    message: error.message ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    ...context,
  }));
  return kind;
}

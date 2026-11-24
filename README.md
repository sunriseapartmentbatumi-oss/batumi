# Batumi

Polskojęzyczny serwis jednego apartamentu w Batumi: strona oferty i SEO, przewodnik turystyczny, kontakt oraz moduł rezerwacji bezpośrednich. Stan: strona z treściami `[DO POTWIERDZENIA]`, formularz rezerwacji z blokadą terminu (bez płatności online), panel `/admin` i `/admin/diagnostyka` (D069–D070). Fazy: patrz `docs/PRODUCT.md`; stan i następne kroki: `CLAUDE.md`.

## Stack
Next.js App Router + TypeScript + Vercel + Supabase PostgreSQL/Auth/Storage/RLS + Resend + GitHub. Operator płatności pozostaje otwartą decyzją.

## Dokumentacja i hierarchia
1. [`docs/PRODUCT.md`](docs/PRODUCT.md) – wizja i scope.
2. [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) – funkcjonalne source of truth.
3. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – odpowiedzialności i przepływy techniczne.
4. [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) – PostgreSQL, RLS i integralność.
5. [`docs/DECISIONS.md`](docs/DECISIONS.md) – Accepted/Open decisions oraz tabela „Source reconciliation”.

Dokumenty operacyjne (podległe `REQUIREMENTS.md`):
- [`docs/SEO-CONTENT.md`](docs/SEO-CONTENT.md) – mapa witryny, specyfikacja stron, SEO, plan redakcyjny, analityka.
- [`docs/PROCESS.md`](docs/PROCESS.md) – role, etapy z bramkami, raportowanie (ZIP + PDF), publikacja za zgodą.
- [`docs/SETUP.md`](docs/SETUP.md) – runbook środowiska i CI/CD (staging/production, Vercel, Supabase, kroki ręczne).
- [`docs/HANDOVER.md`](docs/HANDOVER.md) – jak Robert kontynuuje pracę z Claude (bez GitHub Copilot).
- [`CLAUDE.md`](CLAUDE.md) / [`AGENTS.md`](AGENTS.md) – kontekst i zasady dla agentów AI (dowolnego dostawcy).
- [`docs/stage-0/`](docs/stage-0/) – artefakty Etapu 0 (założenia, rejestr faktów, pytania do właściciela, ryzyka, plan etapów); robocze, nienormatywne.

Role (D056): Robert – właściciel obiektu, decyzje biznesowe i zgoda na publikację; Konrad – konfiguracja środowiska i narzędzi, tak by Robert mógł je prosto rozwijać i wdrażać (D059).

README jest wejściem dla developera, nie źródłem nowych wymagań biznesowych.

## Lokalnie
Wymagane: Node.js 20.9+ (CI używa 22), Git, npm (lockfile), opcjonalnie Supabase CLI.

```bash
git clone <repo>
cd <repo>
npm install
cp .env.example .env.local
npm run dev
```

## Environment
```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=
BOOKING_NOTIFY_EMAIL=
BOOKING_FROM_EMAIL=
```

`SUPABASE_SERVICE_ROLE_KEY` i `RESEND_API_KEY` są server-only; `BOOKING_*` są opcjonalne (bez nich e-mail jest pomijany). `.env.local` nie trafia do Git. Preview (staging) i Production mają oddzielne wartości (osobne projekty Supabase). Zmienne płatności (operator – D011, Open) i cron (nieużywany – D063) nie istnieją; dojdą dopiero z odpowiednimi decyzjami.

## CI
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

CI (`.github/workflows/ci.yml`) uruchamia lint, typecheck, test i build na PR oraz pushu do `main` i `staging`. Domyślnie wszystkie zmiany idą PR-ami do `staging`; promocja `staging` → `main` tylko na wyraźne życzenie Roberta lub Konrada. Przepływ: zmiany → PR do `staging` (Preview Vercel: `test-sunrise-batumi.vercel.app`) → po akceptacji PR `staging` → `main` (Production: `sunrise-batumi.vercel.app`; jeden projekt Vercel). Merge do `main` = publikacja produkcyjna, zatwierdza go Robert albo Konrad po jawnym potwierdzeniu w prompcie/czacie (D033, D068); runbook: `docs/SETUP.md`; Hobby = projekt hobbystyczny (D062); wygasanie hold bez crona: D063. Do publikacji treści `noindex`/brak własnej domeny. Migracje schematu są wersjonowane w `supabase/migrations` i stosowane ręcznie (SQL Editor lub `supabase db push`, `docs/SETUP.md` §6a) – CI i Vercel ich nie uruchamiają; repozytorium nie ma auto-merge, PR merguje człowiek po zielonym CI; zmiany niekompatybilne wstecz stosują expand-and-contract.

## Zasady implementacji
- PII nie trafia do logów; błędy DB loguj strukturalnie (`[db-error]`, bez PII i sekretów).
- Krytyczne mutacje są walidowane po stronie serwera.
- Publiczny klient nigdy nie otrzymuje `service_role`.
- PostgreSQL jest źródłem prawdy dla dostępności i concurrency.
- (Faza C) Webhook operatora, nie redirect użytkownika, będzie źródłem prawdy dla płatności.
- Nie wymyślaj faktów o apartamencie; brakujące dane to `[DO POTWIERDZENIA]` (D028, D029). Brak sekretów, PII gości i artefaktów raportowych (ZIP/PDF) w repozytorium.
- Nie kupuj domen, nie wydawaj środków, nie publikuj produkcyjnie (agent nigdy sam) ani nie pisz do gości bez jawnego potwierdzenia Roberta lub Konrada (D033, D034).
- Nie implementuj decyzji oznaczonej `Open` w `docs/DECISIONS.md` poza neutralnym defaultem dopuszczonym przez wymagania.

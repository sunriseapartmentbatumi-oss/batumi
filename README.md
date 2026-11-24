# Batumi

Polskojęzyczny serwis jednego apartamentu w Batumi: strona oferty i SEO, przewodnik turystyczny, kontakt oraz (Faza C) moduł rezerwacji bezpośrednich. Fazy: patrz `docs/PRODUCT.md`.

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
- [`docs/stage-0/`](docs/stage-0/) – artefakty Etapu 0 (założenia, rejestr faktów, pytania do właściciela, ryzyka, plan etapów); robocze, nienormatywne.

README jest wejściem dla developera, nie źródłem nowych wymagań biznesowych.

## Lokalnie
Wymagane: Node.js LTS, Git, Supabase CLI oraz wybrany package manager określony przez lockfile.

```bash
git clone <repo>
cd <repo>
npm install
cp .env.example .env.local
supabase start
supabase db reset
npm run dev
```

## Environment
```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
CRON_SECRET=
```

`service_role`, payment secrets, Resend key i cron secret są server-only. `.env.local` nie trafia do Git. Preview i Production mają oddzielne sekrety i webhooki.

## CI
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Pull Request tworzy Vercel Preview. Merge do `main` uruchamia kontrolowany deployment, ale **nie jest zgodą na publikację**: wdrożenie dla odbiorców (domena, indeksowanie) wymaga pisemnej zgody właściciela (D033, `docs/PROCESS.md`); do tego czasu `noindex`/brak publicznej domeny. Migracje schematu są wersjonowane w `supabase/migrations`; zmiany niekompatybilne wstecz stosują expand-and-contract.

## Zasady implementacji
- PII nie trafia do logów.
- Krytyczne mutacje są walidowane po stronie serwera.
- Publiczny klient nigdy nie otrzymuje `service_role`.
- PostgreSQL jest źródłem prawdy dla dostępności i concurrency.
- Webhook operatora, nie redirect użytkownika, jest źródłem prawdy dla płatności.
- Nie wymyślaj faktów o apartamencie; brakujące dane to `[DO POTWIERDZENIA]` (D028, D029). Brak sekretów, PII gości i artefaktów raportowych (ZIP/PDF) w repozytorium.
- Nie kupuj domen, nie wydawaj środków, nie publikuj produkcyjnie ani nie pisz do gości bez zgody właściciela (D034).
- Nie implementuj decyzji oznaczonej `Open` w `docs/DECISIONS.md` poza neutralnym defaultem dopuszczonym przez wymagania.

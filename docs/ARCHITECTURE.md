# Batumi – ARCHITECTURE

## 1. Cel
Dokument definiuje odpowiedzialności komponentów dla zatwierdzonego stacku Next.js + TypeScript + Vercel + Supabase/PostgreSQL (stack potwierdzony przez Konrada 2026-11-24: D027). Jedna aplikacja obsługuje serwis treściowo-SEO (Faza A/B) i moduł rezerwacji (Faza C), patrz `PRODUCT.md`.

## 2. Widok systemu
```text
Browser
  ↓ HTTPS
Next.js / Vercel
  ├── Content/SEO layer (strony, przewodnik, FAQ, sitemap, robots, JSON-LD)
  ├── Consent + Analytics (GA4 po zgodzie)
  ├── Contact form handler (Route Handler, antyspam)
  ├── Public UI
  ├── Admin UI
  ├── Server Components
  ├── Server Actions / Route Handlers
  └── Payment Webhook (Faza C)
       ↓
Supabase
  ├── PostgreSQL
  ├── Auth
  ├── Storage
  └── Row Level Security

External
  ├── Payment Provider (Open: Stripe / Przelewy24)
  ├── Resend
  ├── GA4 / Search Console (po zgodzie cookies)
  └── WhatsApp / telefon (linki, bez integracji API)
```

## 3. Ownership logiki
| Odpowiedzialność | Odpowiedzialny komponent techniczny |
|---|---|
| UI i routing | Next.js App Router |
| Walidacja requestu | Next.js + Zod |
| Authentication admina | Supabase Auth |
| Authorization | RLS + kontrola serwerowa |
| Publiczna dostępność | bezpieczny widok/RPC PostgreSQL |
| Finalna kontrola dostępności | PostgreSQL |
| Concurrency / double booking | PostgreSQL GiST/exclusion constraint |
| Booking transaction | PostgreSQL RPC |
| Pricing orchestration | backend + PostgreSQL snapshot |
| Payment orchestration | Next.js server |
| Payment source of truth | zweryfikowany webhook |
| E-mail | Resend |
| Hold expiration | leniwie w PostgreSQL (`hold_expires_at`, bez crona – D063) |
| Zdjęcia | Supabase Storage (publikowane: next/image, WebP/AVIF, srcset) |
| Treści strony i przewodnika | pliki MDX/TS w repozytorium z frontmatter (data aktualizacji, źródła, status faktów) – D040 |
| Metadane SEO, sitemap, robots, canonical, breadcrumbs, OG | Next.js Metadata API / route handlers |
| Dane strukturalne | komponenty JSON-LD generowane wyłącznie z potwierdzonych danych (D058) |
| Zgoda cookies | komponent klienta + zapis wyboru w cookie pierwszej strony |
| Analityka | GA4 ładowane warunkowo po zgodzie; zdarzenia „potwierdzona rezerwacja” emitowane po `CONFIRMED` |
| Formularz kontaktowy | Route Handler + Zod + ochrona antyspamowa + rate limiting; wysyłka przez Resend; trwałe przechowywanie zapytań: Open (D053) |

## 4. Granice zaufania
Przeglądarka jest niezaufana. Nie wykonuje krytycznych mutacji bez walidacji serwerowej. `SUPABASE_SERVICE_ROLE_KEY`, klucze płatności i Resend nigdy nie trafiają do klienta. Publiczny anon key wymaga skutecznego RLS.

## 5. Booking flow
1. Next.js pobiera bezpieczne dane dostępności.
2. Użytkownik wybiera zakres i liczbę gości.
3. Serwer waliduje request.
4. Funkcja PostgreSQL w transakcji sprawdza blokady i kolizje, utrwala snapshot ceny oraz tworzy `PENDING_PAYMENT` z `hold_expires_at`.
5. Backend tworzy płatność u operatora.
6. Operator wysyła webhook do Route Handler.
7. Route Handler weryfikuje podpis i idempotency key.
8. Aktualizacja płatności i potwierdzenie rezerwacji zachodzą atomowo lub poprzez bezpieczną funkcję DB.
9. Resend wysyła potwierdzenia.

## 6. Wygasanie hold
Bez crona (D063). Każdy hold ma `hold_expires_at`; rezerwacja `pending_payment` z `hold_expires_at` w przeszłości jest traktowana jako wygasła. Idempotentna funkcja PostgreSQL zmienia przeterminowane `PENDING_PAYMENT` na `EXPIRED` i zapisuje zdarzenie; jest wywoływana leniwie: przy odczycie dostępności/rezerwacji, przy zapisie oraz przed utworzeniem nowej rezerwacji. Implementacja musi być bezpieczna wobec równoległego webhooka płatności. Przy wzroście ruchu można dodać harmonogram (Vercel Pro, GitHub Actions schedule lub pg_cron).

Stan implementacji: `expire_stale_reservations()` jest wywoływana przed utworzeniem rezerwacji i w liście rezerwacji admina; `get_unavailable_ranges()` ignoruje przeterminowane holdy bez zmiany danych. RPC `create_pending_reservation(..., p_hold_minutes)` (15 min) działa w jednej transakcji i polega na constraincie `reservations_no_active_overlap`.

## 6a. Stan implementacji (2026-11-24)
- Publiczne: `/`, `/rezerwacja` (formularz bez płatności, server action + zod, zapis przez `service_role` tylko serwerowo), `sitemap.xml`, `robots.txt` (indeksacja tylko `VERCEL_ENV=production`), baner STAGING poza produkcją.
- Admin: `/admin` (Supabase Auth, `admin_profiles`/`is_admin()`, middleware + `requireAdmin()`), apartament i udogodnienia, rezerwacje (zmiana statusu wg dozwolonych przejść), blokady, `/admin/diagnostyka`. Zapisy admina idą przez sesję użytkownika i RLS, nie przez `service_role`.
- Migracje: `initial_schema`, `create_reservation_rpc`, `bootstrap_admin`. Typy: `src/types/database.ts` (ręcznie utrzymywane).
- Gość: po wysłaniu formularza potwierdzenie (numer `BAT-XXXXXXXX`, status „oczekuje na potwierdzenie”, koniec blokady, podsumowanie); `/rezerwacja/status` – sprawdzenie po numerze + e-mailu przez server action (service_role tylko serwerowo, jednolity komunikat „nie znaleziono”, limiter 10 prób/10 min/IP w pamięci instancji – best effort, `noindex`).
- E-mail: `notifyByEmail` wysyła jedno powiadomienie do właściciela przez API Resend (fetch); błąd nie blokuje rezerwacji; wymaga `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL`; bez własnej domeny dostarcza tylko na adres konta Resend; maile do gości niezaimplementowane (D077, D078).
- Logowanie błędów: `src/lib/diagnostics.ts` (`[db-error]`, `[validation-error]`, `[action-error]`, `[config-error]`).
- Nie zaimplementowane: płatności i webhook (D011 Open), ceny i opłaty (decyzje Open), panel cen/zdjęć, analityka i zgoda cookies, treści z rejestru faktów.

## 7. Środowiska
- Local: lokalny Next.js i lokalny Supabase CLI.
- Preview: Vercel Preview + nieprodukcyjny Supabase/secrets.
- Production: Vercel Production + produkcyjny Supabase i produkcyjne integracje.

Production i Preview nie współdzielą sekretów ani endpointów webhook.

## 8. Deployment
Pull Request → lint/typecheck/test/build (GitHub Actions CI). Jeden projekt Vercel: gałąź `staging` wdraża się jako Preview pod `test-sunrise-batumi.vercel.app` (domena przypięta do gałęzi `staging`, Preview env vars → Supabase staging). Po akceptacji PR `staging` → `main` (wymagany recenzent, zielone CI) merge do `main` wdraża **produkcję** (`sunrise-batumi.vercel.app`, Production env vars → Supabase production). Merge do `main` = publikacja, więc zatwierdzają go wyłącznie Robert lub Konrad po jawnym potwierdzeniu w prompcie/czacie (D033, D068). Do czasu publikacji treści środowiska mają `noindex` i brak własnej domeny. Migracje niekompatybilne wstecz używają expand-and-contract.

## 9. Obserwowalność
Minimum: błędy aplikacji, błędy webhooków, nieudane płatności, liczba wygasłych holdów oraz błędy e-mail. Nie logować PII ani payloadów zawierających dane kart.

## 10. Warstwa treści i SEO
- Renderowanie: treści publiczne jako Server Components/statyczne (SSG/ISR), pełna treść i nawigacja dostępne bez JavaScript.
- Każda strona definiuje `title`, `description`, `canonical`, OG i breadcrumbs z jednego modelu specyfikacji (`SEO-CONTENT.md` §3).
- Build produkcyjny kończy się błędem, jeśli treść zawiera `[DO POTWIERDZENIA]` lub fakt o statusie innym niż `potwierdzone` (D029).
- Strony wymagające aktualnych danych (cennik/dostępność) nie są publikowane bez źródła danych na żywo (D032, D051).

## 11. Zgoda cookies i analityka
- Skrypty niekonieczne (GA4) ładowane po zgodzie; odmowa jest równie łatwa jak akceptacja; zgodę można cofnąć.
- Zdarzenia: `click_phone`, `click_whatsapp`, `submit_contact_form`, `begin_booking`, `booking_confirmed`. `booking_confirmed` jest wysyłane po potwierdzeniu serwerowym, nie na podstawie powrotu z operatora płatności. Parametry bez PII.
- Search Console: weryfikacja i przesłanie sitemap dopiero po publikacji za zgodą.

## 12. Zasady zmian
Nowy komponent/integracja lub zmiana ownershipu logiki wymaga aktualizacji tego dokumentu i, jeśli jest decyzją architektoniczną, `DECISIONS.md`.

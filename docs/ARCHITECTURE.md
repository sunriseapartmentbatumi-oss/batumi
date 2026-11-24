# Batumi – ARCHITECTURE

## 1. Cel
Dokument definiuje odpowiedzialności komponentów dla zatwierdzonego stacku Next.js + TypeScript + Vercel + Supabase/PostgreSQL.

## 2. Widok systemu
```text
Browser
  ↓ HTTPS
Next.js / Vercel
  ├── Public UI
  ├── Admin UI
  ├── Server Components
  ├── Server Actions / Route Handlers
  ├── Payment Webhook
  └── Vercel Cron
       ↓
Supabase
  ├── PostgreSQL
  ├── Auth
  ├── Storage
  └── Row Level Security

External
  ├── Payment Provider (Open: Stripe / Przelewy24)
  └── Resend
```

## 3. Ownership logiki
| Odpowiedzialność | Właściciel techniczny |
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
| Hold expiration | Vercel Cron + PostgreSQL |
| Zdjęcia | Supabase Storage |

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
Vercel Cron wywołuje chroniony endpoint. Endpoint uruchamia idempotentną funkcję PostgreSQL zmieniającą przeterminowane `PENDING_PAYMENT` na `EXPIRED` i zapisującą zdarzenie. Implementacja musi być bezpieczna wobec równoległego webhooka.

## 7. Środowiska
- Local: lokalny Next.js i lokalny Supabase CLI.
- Preview: Vercel Preview + nieprodukcyjny Supabase/secrets.
- Production: Vercel Production + produkcyjny Supabase i produkcyjne integracje.

Production i Preview nie współdzielą sekretów ani endpointów webhook.

## 8. Deployment
Pull Request → lint/typecheck/test/build → Vercel Preview. Merge do main → kontrolowane migracje → Vercel Production. Migracje niekompatybilne wstecz używają expand-and-contract.

## 9. Obserwowalność
Minimum: błędy aplikacji, błędy webhooków, nieudane płatności, liczba wygasłych holdów oraz błędy e-mail. Nie logować PII ani payloadów zawierających dane kart.

## 10. Zasady zmian
Nowy komponent/integracja lub zmiana ownershipu logiki wymaga aktualizacji tego dokumentu i, jeśli jest decyzją architektoniczną, `DECISIONS.md`.

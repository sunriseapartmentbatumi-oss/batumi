# Batumi – DATA-MODEL

## 1. Cel
PostgreSQL/Supabase dla jednego apartamentu: rezerwacje bez kont gości, blokady, ceny sezonowe, płatności, e-mail i audit trail.

## 2. Guardrails
- Obecność pola w schemacie nie oznacza, że dana reguła biznesowa należy do MVP. Funkcja dla decyzji `Open` w `DECISIONS.md` może zostać aktywowana wyłącznie po jej zatwierdzeniu i aktualizacji `REQUIREMENTS.md`.
- `airbnb` i `booking` w `booking_source` oznaczają wyłącznie źródło ręcznie zarejestrowanej rezerwacji. Nie oznaczają API, synchronizacji ani channel managera.
- Klucze: UUID. System time: `timestamptz` UTC. Stay dates: `date`. Money: `bigint` minor units. JSON: `jsonb` oszczędnie. Brak hard delete rezerwacji i płatności.

## 3. Enumy
```sql
create type reservation_status as enum ('pending_payment','confirmed','cancelled','expired','completed');
create type payment_status as enum ('created','pending','succeeded','failed','cancelled','partially_refunded','refunded');
create type booking_source as enum ('direct','phone','airbnb','booking','other');
```

## 4. Główne encje
- `admin_profiles`: FK do `auth.users`, rola i aktywność; bez własnego hasła.
- `properties`: dane obiektu i neutralne parametry techniczne pricingu.
- `property_images`: metadane obiektów w Supabase Storage.
- `amenities`: udogodnienia.
- `price_rules`: sezonowe zakresy cenowe `daterange`.
- `calendar_blocks`: niezależne blokady właściciela/hotelu/maintenance.
- `reservations`: gość, zakres, status i snapshot ceny.
- `reservation_nights`: snapshot ceny każdej nocy.
- `payments`: próby płatności i zwroty.
- `reservation_events`: niemodyfikowalna historia biznesowa.
- `email_messages`: historia transakcyjnych wysyłek.
- `settings`: niesekretne ustawienia aplikacji.

## 5. Reservations – kluczowe pola
```sql
id uuid primary key default gen_random_uuid(),
reference text not null unique,
property_id uuid not null references properties(id) on delete restrict,
status reservation_status not null default 'pending_payment',
source booking_source not null default 'direct',
external_reference text,
check_in date not null,
check_out date not null,
stay_period daterange generated always as (daterange(check_in, check_out, '[)')) stored,
nights_count integer generated always as (check_out - check_in) stored,
adults_count smallint not null check (adults_count >= 1),
children_count smallint not null default 0 check (children_count >= 0),
guest_first_name text not null,
guest_last_name text not null,
guest_email text not null,
guest_phone text not null,
guest_message text,
currency char(3) not null default 'PLN',
accommodation_amount_minor bigint not null check (accommodation_amount_minor >= 0),
cleaning_fee_minor bigint not null default 0 check (cleaning_fee_minor >= 0),
extra_guest_fee_minor bigint not null default 0 check (extra_guest_fee_minor >= 0),
discount_amount_minor bigint not null default 0 check (discount_amount_minor >= 0),
tax_amount_minor bigint not null default 0 check (tax_amount_minor >= 0),
total_amount_minor bigint not null check (total_amount_minor >= 0),
amount_due_minor bigint not null check (amount_due_minor >= 0),
terms_version text not null,
privacy_version text not null,
terms_accepted_at timestamptz not null,
hold_expires_at timestamptz,
confirmed_at timestamptz,
cancelled_at timestamptz,
completed_at timestamptz,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check (check_out > check_in)
```

Pola `cleaning_fee_minor`, `extra_guest_fee_minor`, `discount_amount_minor` i `tax_amount_minor` są przygotowaniem modelu na decyzje biznesowe. Dopóki odpowiadające decyzje są `Open`, nie wolno automatycznie naliczać tych elementów.

## 6. Price rules
```sql
id uuid primary key default gen_random_uuid(),
property_id uuid not null references properties(id) on delete restrict,
name text not null,
valid_during daterange not null,
nightly_rate_minor bigint not null check (nightly_rate_minor >= 0),
currency char(3) not null default 'PLN',
minimum_stay_nights smallint,
priority integer not null default 0,
is_active boolean not null default true,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check (not isempty(valid_during)),
check (minimum_stay_nights is null or minimum_stay_nights >= 1)
```
`minimum_stay_nights` pozostaje `NULL`, dopóki reguła biznesowa nie zostanie zatwierdzona.

## 7. Calendar blocks
```sql
id uuid primary key default gen_random_uuid(),
property_id uuid not null references properties(id) on delete restrict,
blocked_during daterange not null,
reason text,
source text not null default 'manual',
external_reference text,
created_by uuid references auth.users(id) on delete set null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check (not isempty(blocked_during))
```

## 8. Double booking
```sql
create extension if not exists btree_gist;
alter table reservations
add constraint reservations_no_active_overlap
exclude using gist (
  property_id with =,
  stay_period with &&
)
where (status in ('pending_payment', 'confirmed'));
```

Utworzenie rezerwacji przechodzi przez funkcję PostgreSQL/RPC, która w jednej transakcji sprawdza `calendar_blocks`, weryfikuje snapshot ceny, tworzy `pending_payment` i `reservation_nights`. Exclusion constraint jest ostatnią linią ochrony przed równoległymi rezerwacjami.

Przeterminowane `pending_payment` są cyklicznie ustawiane na `expired`; implementacja musi być bezpieczna wobec równoległego webhooka.

## 9. Payments
Każdy rekord zawiera `reservation_id`, `provider`, `provider_payment_id`, `provider_event_id`, `status`, kwotę, walutę i znaczniki czasu. Unikalne częściowe indeksy na `(provider, provider_payment_id)` oraz `(provider, provider_event_id)` zapewniają idempotencję. `metadata jsonb` nie może zawierać danych kart ani zbędnych PII.

## 10. RLS
RLS jest włączone na tabelach wystawianych przez Supabase API. Anonimowy użytkownik nie odczytuje surowych `reservations`, `payments`, `reservation_events` ani PII. Dostępność jest publikowana przez bezpieczny widok/funkcję bez danych gościa. Administrator wymaga aktywnego `admin_profiles`. `service_role` działa wyłącznie po stronie serwera.

## 11. Storage
Bucket `property-images`. Publiczny odczyt wyłącznie dla zdjęć przeznaczonych do publikacji. Zapis/usunięcie tylko dla administratora. Backup Storage jest traktowany oddzielnie od backupu PostgreSQL.

## 12. Migracje i typy
Migracje: `supabase/migrations`. Schemat jest odtwarzalny przez Supabase CLI. Po zmianie schematu generowane są typy TypeScript do `src/types/database.ts`. Schema migration i typy trafiają do tego samego PR.

## 13. Testy integralności
- dotykające się zakresy check-out/check-in są dozwolone,
- aktywne zakresy nachodzące są blokowane,
- `cancelled` i `expired` nie blokują terminu,
- `calendar_blocks` blokuje utworzenie rezerwacji,
- równoległe transakcje nie tworzą dwóch aktywnych rezerwacji,
- powtórzony webhook jest idempotentny,
- zmiana pricingu nie zmienia snapshotu,
- RLS blokuje anonimowy odczyt PII i płatności.

## 14. Treści, rejestr faktów i zgoda (Faza A/B)
- **Treści przewodnika i stron** oraz **rejestr faktów** (`docs/stage-0/rejestr_faktow.csv`) są plikami w repozytorium, nie tabelami PostgreSQL (D040). Zmiana modelu na bazodanowy wymaga decyzji i aktualizacji tego dokumentu.
- **Zgoda cookies** jest zapisywana po stronie przeglądarki (cookie pierwszej strony z wersją polityki i datą); brak tabeli w MVP, dopóki D049 nie wymaga rejestru zgód po stronie serwera.
- **Zapytania z formularza kontaktowego** zawierają PII. Tabela (np. `contact_inquiries`) nie jest częścią schematu, dopóki D053 (przechowywanie i retencja) jest Open; do tego czasu formularz tylko wysyła e-mail przez Resend, bez trwałego zapisu i bez PII w logach.
- Faza C: schemat z §3–§13 bez zmian.

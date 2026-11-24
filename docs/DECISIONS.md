# Batumi – DECISIONS

## Zasady
- `Accepted`: obowiązuje w implementacji.
- `Open`: nie wolno samodzielnie założyć wartości biznesowej.
- `Superseded`: zastąpione późniejszą decyzją.

| ID | Decyzja | Status | Uzasadnienie / uwagi |
|---|---|---|---|
| D001 | Next.js + TypeScript | Accepted | Jeden stack dla UI i backendu aplikacyjnego |
| D002 | Vercel | Accepted | Hosting, Preview Deployments i Cron |
| D003 | Supabase PostgreSQL | Accepted | Relacyjny model, transakcje, ranges i constraints |
| D004 | Supabase Auth | Accepted | Tylko administrator, brak publicznej rejestracji |
| D005 | Supabase Storage | Accepted | Zdjęcia obiektu |
| D006 | RLS | Accepted | Defense in depth dla danych Supabase |
| D007 | PostgreSQL odpowiada za concurrency | Accepted | Double booking blokowany w DB |
| D008 | Waluta MVP = PLN | Accepted | Jedna waluta na start |
| D009 | Hold rezerwacji = 15 min | Accepted | Tymczasowa ochrona terminu podczas płatności |
| D010 | Resend | Accepted | E-mail transakcyjny |
| D011 | Operator płatności: Stripe vs Przelewy24 | Open | Decyzja wymagana przed integracją płatności |
| D012 | Pełna płatność vs zaliczka | Open | Wymaga reguły biznesowej |
| D013 | Cancellation/refund policy | Open | Wymagane przed finalizacją payment flow |
| D014 | Minimum stay | Open | Do decyzji; techniczny default `1` nie oznacza decyzji biznesowej |
| D015 | Cleaning fee | Open | Do decyzji; techniczny default `0` nie aktywuje opłaty |
| D016 | Extra guest fee | Open | Do decyzji; techniczny default `0` nie aktywuje opłaty |
| D017 | Rabaty | Open | Poza aktywnym pricingiem do czasu zatwierdzenia |
| D018 | Podatki/opłaty lokalne | Open | Wymagają ustalenia prawno-biznesowego |
| D019 | Maksymalna liczba gości | Open | Wartość produkcyjna do ustalenia |
| D020 | Check-in/check-out | Open | Wartości produkcyjne do ustalenia |
| D021 | Zwierzęta i dzieci | Open | Reguły pobytu do ustalenia |
| D022 | Retencja danych | Open | Wymaga dopasowania do obowiązków prawnych/księgowych |
| D023 | Airbnb/Booking source w danych | Accepted | Tylko oznaczenie źródła ręcznie zarejestrowanej rezerwacji; nie oznacza integracji API |
| D024 | Integracje Airbnb/Booking/channel manager | Open post-MVP | Jawnie poza MVP |

## Guardrail
Pole istniejące w schemacie nie jest równoznaczne z zatwierdzoną funkcją. Dla decyzji `Open` kod nie może wprowadzać reguły biznesowej poza neutralnym defaultem potrzebnym do działania schematu.

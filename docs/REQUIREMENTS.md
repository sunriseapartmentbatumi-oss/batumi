# Batumi – REQUIREMENTS

**Status:** Baseline MVP, stack zatwierdzony  
**Właściciel techniczny:** Konrad  
**Skala:** jeden apartament, około 100 rezerwacji bezpośrednich rocznie

## 1. Hierarchia dokumentacji
1. `PRODUCT.md` definiuje wizję i scope.
2. `REQUIREMENTS.md` jest funkcjonalnym source of truth.
3. `ARCHITECTURE.md` określa podział odpowiedzialności technicznych.
4. `DATA-MODEL.md` definiuje trwały model danych i integralność.
5. `DECISIONS.md` rejestruje decyzje Accepted/Open.
6. `README.md` jest wejściem dla developera.

W razie konfliktu dokument niżej w tej hierarchii nie może zmieniać wymagania z dokumentu wyżej bez jawnej aktualizacji decyzji i odpowiedniego dokumentu nadrzędnego.

## 2. Role
### Gość
Bez logowania: oferta, galeria, termin, liczba gości, dostępność, cena, formularz, płatność i potwierdzenie.

### Administrator
Supabase Auth bez publicznej rejestracji. Kalendarz, szczegóły rezerwacji i płatności, ręczne rezerwacje, anulowanie, blokady i ceny.

## 3. Dostępność
Niedostępne są okresy kolidujące z `CONFIRMED`, niewygasłym `PENDING_PAYMENT` albo `calendar_blocks`. Widok klienta nie jest źródłem prawdy. Utworzenie rezerwacji wymaga transakcyjnej kontroli PostgreSQL.

## 4. Rezerwacja
Statusy: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `COMPLETED`.

Przepływ: wybór dat → dostępność → cena → dane i zgody → 15-minutowa blokada → płatność → zweryfikowany webhook → `CONFIRMED` → e-mail.

Noc wyjazdu nie jest zajęta. Rezerwacji nie usuwa się fizycznie. Zmiana cennika nie zmienia historycznej ceny.

## 5. Cennik
Wymagane: cena bazowa, ceny sezonowe, pełna cena przed płatnością, snapshot ceny, PLN. Niezatwierdzone reguły cenowe nie mogą zostać zaimplementowane tylko dlatego, że model danych ma przygotowane pola.

## 6. Płatności
Operator: Open, Stripe albo Przelewy24. Tworzenie transakcji następuje po stronie serwera. Webhook ma zweryfikowany podpis i unikalny ID. Obsługa jest idempotentna. Powrót przeglądarki od operatora nie potwierdza płatności. W MVP zwroty mogą być wykonane ręcznie w panelu operatora.

## 7. E-mail
Resend. Po potwierdzeniu rezerwacji wiadomość dla gościa i właściciela zawiera numer rezerwacji, termin, liczbę gości, cenę i status płatności. Próby wysyłki są rejestrowane.

## 8. Stack
Next.js App Router + TypeScript na Vercel. Supabase: PostgreSQL, Auth, Storage i RLS. GitHub jest źródłem prawdy dla kodu i migracji. Resend obsługuje e-mail.

## 9. Bezpieczeństwo
HTTPS, walidacja serwerowa, RLS, brak sekretów w bundle i Git, rate limiting dla logowania/rezerwacji/płatności, weryfikacja webhooków, brak danych kart i PII w logach.

## 10. Testy obowiązkowe
Kolizje terminów, rezerwacja stykająca się check-out/check-in, blokady administratora, sezonowy pricing, współbieżne rezerwacje, wygasanie hold, sukces/błąd płatności, powtórzony webhook, anulowanie, RLS i admin access.

## 11. Decyzje blokujące
### Przed developmentem funkcji zależnych od reguły
- maksymalna liczba gości,
- minimum stay albo jawne `1`,
- cleaning fee albo jawne `0`,
- dodatkowy gość albo jawne `0`.

Nie blokują scaffoldu ani podstawowej implementacji domeny, jeśli używane są bezpieczne wartości neutralne.

### Przed implementacją płatności
- Stripe vs Przelewy24,
- pełna płatność vs zaliczka,
- cancellation/refund rules.

### Przed produkcją
- nazwa handlowa,
- rzeczywiste ceny i okresy dostępności,
- max guests,
- check-in/check-out,
- zwierzęta i dzieci,
- podatki,
- dane kontaktowe,
- treść regulaminu i polityki prywatności,
- produkcyjna treść e-maili,
- okres retencji danych.

Aktualny status każdej decyzji znajduje się w `DECISIONS.md`.

## 12. Poza MVP
Booking.com/Airbnb API i channel manager, wiele obiektów, konta gości, wiele walut, dynamiczne ceny, aplikacja mobilna, fakturowanie, CRM, chatbot, mikroserwisy.

## 13. Definition of Done
Niezależny gość przechodzi pełny proces produkcyjny; administrator widzi rezerwację; PostgreSQL blokuje kolizje; błędna płatność nie potwierdza rezerwacji; RLS chroni dane; backup jest możliwy do odtworzenia; krytyczne testy przechodzą w CI.

## 14. Kontrola zmian
Niezdefiniowanych decyzji biznesowych nie wolno wymyślać podczas implementacji. Zmiana scope, płatności, pricingu, dostępności lub cyklu życia wymaga aktualizacji `DECISIONS.md` oraz dokumentów, których dotyczy.

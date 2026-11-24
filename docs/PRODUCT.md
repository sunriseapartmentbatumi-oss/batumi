# Batumi – PRODUCT

## Cel
Aplikacja do bezpośrednich rezerwacji jednego apartamentu w Batumi. Gość bez konta może poznać ofertę, sprawdzić termin i pełną cenę, zarezerwować pobyt, zapłacić online i otrzymać potwierdzenie. Właściciel zarządza kalendarzem, cenami, blokadami i rezerwacjami.

## Cele biznesowe
- zwiększenie rezerwacji bezpośrednich,
- ograniczenie prowizji pośredników,
- ograniczenie ręcznych pytań o dostępność i cenę,
- utrzymanie kontroli nad sezonową dostępnością,
- zbudowanie własnego kanału sprzedaży.

## Użytkownicy
### Gość
Bez logowania. Przegląda ofertę, wybiera termin i liczbę gości, podaje wymagane dane, akceptuje dokumenty i płaci online.

### Administrator
Właściciel apartamentu. Loguje się przez Supabase Auth i zarządza kalendarzem, rezerwacjami, blokadami oraz cennikiem.

## Zakres MVP
### Publiczna strona
- opis, lokalizacja, udogodnienia i galeria,
- godziny zameldowania i wymeldowania,
- kalendarz dostępności,
- wyszukiwanie według dat i liczby gości,
- kalkulacja pełnej ceny,
- formularz rezerwacji,
- płatność online,
- potwierdzenie e-mail,
- responsywność, podstawowe SEO i dostępność.

### Dostępność
Termin jest niedostępny, jeśli koliduje z potwierdzoną rezerwacją, aktywną rezerwacją oczekującą na płatność albo blokadą administratora. Dostępność jest ponownie sprawdzana transakcyjnie po stronie serwera przed utworzeniem blokady.

### Cennik
MVP obsługuje podstawową cenę za noc, ceny sezonowe, zatwierdzone opłaty obowiązkowe i snapshot ceny rezerwacji. Waluta początkowa: PLN. Rabaty, podatki, dopłaty, zaliczka i inne reguły są aktywowane dopiero po formalnej decyzji w `DECISIONS.md` i zmianie `REQUIREMENTS.md`.

### Rezerwacja i płatność
1. Wybór terminu i liczby osób.
2. Sprawdzenie dostępności i ceny.
3. Dane gościa i wymagane zgody.
4. Tymczasowa blokada na 15 minut.
5. Płatność przez operatora.
6. Zweryfikowany webhook potwierdza płatność.
7. Rezerwacja otrzymuje `CONFIRMED`.
8. Gość i właściciel otrzymują e-mail.

### Panel administratora
- kalendarz jako główny ekran,
- lista i szczegóły rezerwacji,
- ręczne tworzenie i anulowanie rezerwacji,
- blokowanie okresów,
- ceny podstawowe i sezonowe,
- podgląd płatności,
- podstawowa historia zdarzeń.

## Statusy rezerwacji
`PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `COMPLETED`.

## Zatwierdzony stack
Next.js + TypeScript + Vercel + Supabase PostgreSQL + Supabase Auth + Supabase Storage + RLS + Resend + GitHub. Operator płatności pozostaje decyzją otwartą.

## Poza MVP
Wiele apartamentów, konta gości, aplikacja mobilna, integracje Booking.com/Airbnb/channel manager, wiele walut, dynamiczne ceny AI, automatyczne fakturowanie, rozbudowany CMS i mikroserwisy.

## Kryterium sukcesu MVP
Pełny proces od wejścia na stronę do potwierdzonej rezerwacji działa produkcyjnie, kolizje są blokowane na poziomie PostgreSQL, administrator zarządza kalendarzem, a dane są zabezpieczone i możliwe do odtworzenia.

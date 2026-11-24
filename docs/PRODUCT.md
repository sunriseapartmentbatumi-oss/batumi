# Batumi – PRODUCT

## Cel
Polskojęzyczny serwis jednego konkretnego apartamentu w Batumi (Gruzja), w okolicy bulwaru Lecha i Marii Kaczyńskich: szybki, wiarygodny serwis wynajmu wsparty jakościowym przewodnikiem turystycznym i mierzalnym procesem pozyskiwania zapytań i rezerwacji, z modułem rezerwacji bezpośrednich. Dokładny adres, widok, odległości i standard to dane właściciela – do czasu ich potwierdzenia pozostają `[DO POTWIERDZENIA]` (D028, D029).

Gość bez konta może poznać ofertę, sprawdzić termin i pełną cenę, zarezerwować pobyt, zapłacić online i otrzymać potwierdzenie. Właściciel zarządza kalendarzem, cenami, blokadami i rezerwacjami.

## Fazy produktu (D025, D026)
| Faza | Treść |
|---|---|
| A – serwis treściowo-SEO | Strona oferty, lokalizacji, galerii, FAQ, kontaktu i przewodnik po Batumi; SEO, dostępność, wydajność |
| B – kontakt i pomiar | Telefon, WhatsApp, formularz, GA4/Search Console ze zgodą cookies, publikacja po zgodzie właściciela |
| C – rezerwacje bezpośrednie | Kalendarz, cennik, hold 15 min, płatność online, panel administratora (zakres MVP poniżej) |

Wszystko w jednej aplikacji Next.js. Do uruchomienia Fazy C ścieżką sprzedaży jest telefon/WhatsApp/formularz (D038); ostateczny kanał sprzedaży to decyzja otwarta (D037).

## Cele biznesowe
- pozyskiwanie ruchu z wyszukiwarki (polskie intencje: apartament/noclegi Batumi, atrakcje, dojazd, Batumi z dziećmi itd.) bez gwarancji pozycji,
- zwiększenie zapytań i rezerwacji bezpośrednich (mierzone zdarzeniami analityki),
- wiarygodność: realne informacje od polskiego właściciela zamiast ogólników,
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
Podział na fazy: elementy publicznej strony niezwiązane z kalendarzem i płatnością (opis, lokalizacja, udogodnienia, galeria, godziny zameldowania, SEO, dostępność, responsywność) należą do Fazy A/B; kalendarz, wyszukiwanie, cena, rezerwacja, płatność, e-mail i panel – do Fazy C. Przewodnik, FAQ, kontakt, polityka prywatności i analityka – Faza A/B (szczegóły: `SEO-CONTENT.md`).

### Publiczna strona
- opis, lokalizacja, udogodnienia i galeria,
- godziny zameldowania i wymeldowania,
- kalendarz dostępności,
- wyszukiwanie według dat i liczby gości,
- kalkulacja pełnej ceny,
- formularz rezerwacji,
- płatność online,
- potwierdzenie e-mail,
- przewodnik turystyczny, FAQ, kontakt (telefon, WhatsApp, formularz),
- responsywność, SEO (treściowe i techniczne), dostępność WCAG 2.2 AA, wydajność.

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

## Zasady twarde produktu
Nie wymyślamy faktów (adres, odległości, widok, standard, ceny, dostępność, opinie); brak fikcyjnych ocen; brak założeń o widoku na morze i dostępie do plaży; brak obietnic dostępności bez żywego kalendarza; domena, wydatki, publikacja produkcyjna i wiadomości do gości tylko po jawnym potwierdzeniu Roberta lub Konrada; publikację agent nigdy nie wykonuje samodzielnie. Pełna lista: `REQUIREMENTS.md` §16.

## Zatwierdzony stack
Next.js + TypeScript + Vercel + Supabase PostgreSQL + Supabase Auth + Supabase Storage + RLS + Resend + GitHub. Operator płatności pozostaje decyzją otwartą. Stack potwierdzony przez Konrada (właściciela technicznego) 2026-11-24 (D027).

## Poza MVP
Wiele apartamentów, konta gości, aplikacja mobilna, integracje Booking.com/Airbnb/channel manager, wiele walut, dynamiczne ceny AI, automatyczne fakturowanie, rozbudowany CMS (treści przewodnika w repozytorium) i mikroserwisy.

## Kryteria sukcesu Fazy A/B
Strona opublikowana za zgodą właściciela, wszystkie twierdzenia o apartamencie `potwierdzone` w rejestrze faktów, cele CWV/a11y z `REQUIREMENTS.md` §19 raportowane, zdarzenia analityki działają ze zgodą cookies, a po 30/60/90 dniach istnieje przegląd Search Console i zapytań.

## Kryterium sukcesu MVP (Faza C)
Pełny proces od wejścia na stronę do potwierdzonej rezerwacji działa produkcyjnie, kolizje są blokowane na poziomie PostgreSQL, administrator zarządza kalendarzem, a dane są zabezpieczone i możliwe do odtworzenia.

# Rejestr ryzyk (Etap 0)

Skala: prawdopodobieństwo i wpływ N/Ś/W. Wartości wstępne, do przeglądu na GPT-0.

| ID | Ryzyko | P | W | Mitygacja | Właściciel |
|---|---|---|---|---|---|
| R01 | Publikacja nieprawdziwych lub niepotwierdzonych informacji (adres, widok, odległości) | Ś | W | Rejestr faktów, `[DO POTWIERDZENIA]`, blokada buildu produkcyjnego (D028, D029) | właściciel / wykonawca |
| R02 | Założenie widoku na morze lub dostępu do plaży z lokalizacji przy bulwarze | Ś | W | Weryfikacja mapy i trasy pieszej (D031) | wykonawca |
| R03 | Nieaktualne informacje o transporcie, wjazdach, atrakcjach | W | Ś | Źródła oficjalne, data weryfikacji, cykliczny przegląd (D030) | wykonawca |
| R04 | Obietnica dostępności/ceny bez żywego kalendarza | Ś | W | Brak obietnic bez kalendarza; `/cennik-i-dostepnosc` warunkowo (D032, D051) | właściciel |
| R05 | Przypadkowa publikacja produkcyjna po merge do `main` | Ś | W | Wdrożenie wstrzymane/`noindex` do zgody pisemnej (D033) | wł. techniczny |
| R06 | Wydatki lub zakup domeny bez zgody | N | W | Zakaz bez zgody (D034) | właściciel |
| R07 | Niezgodność prawna: podatki w Gruzji, podmiot, RODO/prywatność, regulamin | W | W | Konsultacja prawno-podatkowa (D047, D049) | właściciel |
| R08 | Operator płatności nie obsługuje PLN dla obiektu w Gruzji | Ś | W | Weryfikacja przed Fazą C (D048) | właściciel / wykonawca |
| R09 | Brak danych od właściciela opóźnia etapy | W | Ś | Lista pytań BLOKUJE; bramki | właściciel |
| R10 | Prawa do zdjęć i treści | Ś | Ś | Potwierdzenie praw (D052) | właściciel |
| R11 | Sezonowość i wolumeny SEO niepewne; brak gwarancji pozycji | W | Ś | Metryki tylko z narzędziem/datą; plan 30/60/90 | wykonawca |
| R12 | Naruszenie prywatności (analityka bez zgody, PII w logach, sekrety w repo) | Ś | W | Zgoda cookies, brak PII w logach, brak sekretów (D043, D057) | wykonawca |
| R13 | Spam/nadużycia formularza kontaktowego | Ś | Ś | Antyspam, rate limiting | wykonawca |
| R14 | Kolizje terminów przy równoległych kanałach (Airbnb/Booking/własne) | Ś | W | Jedno źródło prawdy kalendarza; D023/D024 | właściciel |
| R15 | Rozjazd procesu: bramki GPT vs repo/CI, niejasny właściciel decyzji | Ś | Ś | `../PROCESS.md`, D056 | wszyscy |

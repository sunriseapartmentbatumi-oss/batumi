# Batumi – REQUIREMENTS

**Status:** Baseline MVP (Faza C) + wymagania serwisu treściowo-SEO (Faza A/B), stack zatwierdzony i potwierdzony przez Konrada 2026-11-24 (D027)  
**Właściciel biznesowy:** Robert (właściciel obiektu; decyzje biznesowe, dane o ofercie, zgoda na publikację)  
**Właściciel techniczny:** Konrad (brat właściciela; konfiguracja środowiska i narzędzi; D056)  
**Skala:** jeden apartament, około 100 rezerwacji bezpośrednich rocznie

## 1a. Role decyzyjne (D056)
W dokumentach „właściciel” oznacza Roberta, właściciela obiektu. Robert zatwierdza decyzje biznesowe i `Open` z `DECISIONS.md`, dostarcza dane do rejestru faktów. Publikację produkcyjną przeprowadza Robert albo Konrad, każdorazowo po jawnym potwierdzeniu w prompcie/czacie (D033); agenci AI nigdy nie publikują samodzielnie. Konrad konfiguruje i utrzymuje środowisko projektowe (repozytorium, Vercel, Supabase, GitHub Actions) oraz przygotowuje je tak, by Robert mógł je prosto rozwijać i wdrażać; nie podejmuje decyzji biznesowych za Roberta.

## 1. Hierarchia dokumentacji
1. `PRODUCT.md` definiuje wizję i scope.
2. `REQUIREMENTS.md` jest funkcjonalnym source of truth.
3. `ARCHITECTURE.md` określa podział odpowiedzialności technicznych.
4. `DATA-MODEL.md` definiuje trwały model danych i integralność.
5. `DECISIONS.md` rejestruje decyzje Accepted/Open.
6. `README.md` jest wejściem dla developera.

Dokumenty operacyjne podległe `REQUIREMENTS.md`: [`SEO-CONTENT.md`](SEO-CONTENT.md) (mapa witryny, specyfikacja stron, plan redakcyjny, SEO i analityka) oraz [`PROCESS.md`](PROCESS.md) (role, etapy, bramki, raportowanie, publikacja). Artefakty robocze Etapu 0 w `docs/stage-0/` nie są normatywne – zawierają dane do uzupełnienia, nie wymagania.

W razie konfliktu dokument niżej w tej hierarchii nie może zmieniać wymagania z dokumentu wyżej bez jawnej aktualizacji decyzji i odpowiedniego dokumentu nadrzędnego.

## 2. Role
### Gość
Bez logowania: oferta, galeria, lokalizacja, przewodnik, FAQ, kontakt (telefon/WhatsApp/formularz); w Fazie C także termin, liczba gości, dostępność, cena, formularz rezerwacji, płatność i potwierdzenie.

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
### Przed rozpoczęciem Fazy A (serwis treściowo-SEO, Etap 0–2)
- kanał sprzedaży: formularz / WhatsApp / telefon / zewnętrzny silnik / rezerwacja bezpośrednia (D037),
- dane o apartamencie do rejestru faktów: dokładny adres/pinezka, parametry, zdjęcia i prawa do nich (D052), dane kontaktowe, nazwa handlowa,
- domena i hosting; zakup domeny tylko po zgodzie (D050),
- podmiot prawny i podatki w Gruzji (D047) oraz jurysdykcja polityki prywatności/regulaminu (D049) – blokują treści prawne i ostateczne twierdzenia cenowe.

Pełna lista pytań z priorytetami BLOKUJE/WAŻNE/OPCJONALNE: `stage-0/pytania_do_wlasciciela.md` (część A – Robert, część B – Konrad).

### Przed developmentem funkcji zależnych od reguły
- maksymalna liczba gości,
- minimum stay albo jawne `1`,
- cleaning fee albo jawne `0`,
- dodatkowy gość albo jawne `0`.

Nie blokują scaffoldu ani podstawowej implementacji domeny, jeśli używane są bezpieczne wartości neutralne.

### Przed implementacją płatności
- Stripe vs Przelewy24 oraz przydatność operatora do rozliczeń w PLN dla obiektu w Gruzji (D011, D048),
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
- okres retencji danych,
- jawne potwierdzenie publikacji produkcyjnej przez Roberta lub Konrada (D033) i zatwierdzone treści po fact-checku (GPT-3),
- konfiguracja zgody cookies i polityka prywatności przed włączeniem analityki (D043).

Aktualny status każdej decyzji znajduje się w `DECISIONS.md`.

## 12. Poza MVP
Rozbudowany CMS (treści przewodnika w repozytorium, D040), Booking.com/Airbnb API i channel manager, wiele obiektów, konta gości, wiele walut, dynamiczne ceny, aplikacja mobilna, fakturowanie, CRM, chatbot, mikroserwisy.

## 13. Definition of Done
Niezależny gość przechodzi pełny proces produkcyjny; administrator widzi rezerwację; PostgreSQL blokuje kolizje; błędna płatność nie potwierdza rezerwacji; RLS chroni dane; backup jest możliwy do odtworzenia; krytyczne testy przechodzą w CI.

## 14. Kontrola zmian
Niezdefiniowanych decyzji biznesowych nie wolno wymyślać podczas implementacji. Zmiana scope, płatności, pricingu, dostępności lub cyklu życia wymaga aktualizacji `DECISIONS.md` oraz dokumentów, których dotyczy.

---
# Wymagania scalone z Master Prompt v2 (serwis treściowo-SEO)

## 15. Fazy i przypisanie funkcji (D025, D026)
| Faza | Zakres | Powiązane sekcje |
|---|---|---|
| A – serwis treściowo-SEO | Etapy 0–3 procesu: discovery, research SEO, mapa witryny/UX, treści i przewodnik; następnie implementacja strony statycznej/treściowej w Next.js | §16–§21, `SEO-CONTENT.md` |
| B – kontakt i pomiar | Telefon, WhatsApp, formularz kontaktowy, analityka ze zgodą cookies, publikacja po zgodzie | §17, §19, §20 |
| C – rezerwacje bezpośrednie | Moduł z §2–§10 (kalendarz, cennik, hold, płatność, panel admina) w tej samej aplikacji Next.js | §2–§10 |

Funkcje MVP z `PRODUCT.md` należą do Fazy C, z wyjątkiem: opisu, lokalizacji, udogodnień, galerii, godzin zameldowania, responsywności, SEO i dostępności (Faza A/B). Faza C startuje po spełnieniu warunków z §11 i decyzji D037. Do tego czasu obowiązuje ścieżka przejściowa: telefon, WhatsApp i formularz (D038). Faza A nie może obiecywać dostępności ani ceny, których nie wspiera aktualny kalendarz (§16.5).

## 16. Ograniczenia twarde (cross-cutting)
1. **Brak zmyślonych faktów (D028).** Nie wolno wymyślać ani zakładać adresu, odległości, widoku, standardu, dostępności, cen, opinii, atrakcji, czasu dojścia i parametrów apartamentu – ani w treściach, ani w danych testowych widocznych publicznie.
2. **Rejestr faktów i status danych (D029).** Każdy fakt o apartamencie/ofercie ma wpis w `stage-0/rejestr_faktow.csv` ze statusem: `potwierdzone` (źródło + data + osoba), `hipoteza`, `wymaga_właściciela`. Twierdzenie sprzedażowe wolno opublikować tylko dla statusu `potwierdzone`.
3. **Znacznik `[DO POTWIERDZENIA]` (D029).** Brakujące dane w szkicach oznacza się dosłownie `[DO POTWIERDZENIA]`. Publikacja treści zawierającej znacznik jest zablokowana; CI/review sprawdza jego brak w buildzie produkcyjnym.
4. **Cytowanie źródeł (D030).** Zewnętrzne źródło: adres URL, data dostępu, ocena wiarygodności. Informacje o transporcie, wjazdach, godzinach, cenach i atrakcjach weryfikowane na stronach oficjalnych i opatrzone datą aktualizacji treści.
5. **Lokalizacja i dostępność (D031, D032).** Lokalizacja przy bulwarze nie implikuje widoku na morze ani bezpośredniego zejścia na plażę – wymagana weryfikacja mapy i trasy pieszej. Brak obietnic dostępności bez aktualnego, żywego kalendarza.
6. **Opinie i oceny (D031).** Zakaz fikcyjnych opinii, sztucznych rekomendacji i fałszywych ocen (także w danych strukturalnych).
7. **Zgoda właściciela (D034, D033).** Bez odrębnego, jawnego potwierdzenia Roberta lub Konrada w prompcie/czacie: zakup domeny, wydatki, publikacja produkcyjna, wiadomości do gości, zmiany w systemach zewnętrznych. Publikacja produkcyjna odbywa się wyłącznie przez bramkowany workflow GitHub Actions (D060); agent nigdy nie publikuje samodzielnie.
8. **Sekrety (D057).** Brak sekretów, tokenów, danych osobowych gości i danych płatniczych w repozytorium, raportach i ZIP.
9. **Ton treści.** Konkretnie i po polsku; wyróżnik to polski właściciel i realne informacje, nie ogólnikowe „luksusowy raj”. Bez upychania słów kluczowych; bez kopiowania tekstów konkurencji.

## 17. SEO i treści
Szczegóły i szablony: `SEO-CONTENT.md`.
- **Mapa witryny (D039):** `/`, `/apartament`, `/galeria`, `/lokalizacja`, `/cennik-i-dostepnosc` (tylko jeśli dane są aktualizowane, D051), `/kontakt`, `/przewodnik`, `/przewodnik/atrakcje-batumi`, `/przewodnik/batumi-z-dziecmi`, `/przewodnik/dojazd-do-batumi`, `/faq`, `/polityka-prywatnosci`. Dopasowanie do rzeczywistych danych; strony bez wartości usuwamy. Regulamin dochodzi w Fazie C.
- **Specyfikacja każdej podstrony:** intencja, główna fraza, title, meta description, H1, struktura H2/H3, CTA, linki wewnętrzne, wymagane zdjęcia, źródła.
- **Keyword map:** intencje transakcyjne oddzielone od informacyjnych; woluminy/trudność/sezonowość tylko z narzędziem, krajem, datą i ograniczeniami, inaczej „do weryfikacji”.
- **Konkurencja:** minimum 8–12 rzeczywistych konkurentów (strony niezależne i portale rezerwacyjne): architektura, unikalne treści, słabe punkty, wiarygodność.
- **Plan redakcyjny:** 20–30 tematów z oceną intencji, wartości, unikalności, kosztu i priorytetu; 5 najlepszych szkiców do akceptacji GPT/właściciela przed resztą. Priorytety: szybkie wygrane, filary długoterminowe, tematy wymagające doświadczeń lokalnych.
- **Treści dla gości:** co obejmuje cena, odbiór kluczy, transfer, parking, internet, wyposażenie, sprzątanie, anulacja, płatność, język obsługi – z `[DO POTWIERDZENIA]` do czasu danych właściciela. Reguły biznesowe z `DECISIONS.md` oznaczone `Open` nie są prezentowane jako obowiązujące.
- **Przewodnik:** atrakcje, plaże, promenada, komunikacja, restauracje, aktywności rodzinne, sezonowość, wycieczki po Adżarii, praktyczne kwestie podróży; ceny/godziny/warunki z oficjalnych stron i data aktualizacji.
- **Treści w repozytorium (D040):** pliki MDX/TS z frontmatter (data aktualizacji, źródła); bez CMS.

## 18. SEO techniczne
`sitemap.xml`, `robots.txt`, `canonical`, breadcrumbs, Open Graph, poprawne 404 i przekierowania, semantyczny HTML, obrazy WebP/AVIF z responsywnym `srcset`, lazy loading poza hero, cache. **Dane strukturalne (D058)** wyłącznie zgodne z realną zawartością i aktualnymi wytycznymi Google (np. Organization/Person, BreadcrumbList, FAQPage tylko jeśli zasadne); bez fałszywych ocen i bez obietnic rich results. Formularze: walidacja serwerowa, ochrona antyspamowa, rate limiting. Do czasu zgody na publikację środowiska nieprodukcyjne mają `noindex`.

## 19. Dostępność, wydajność, UX
- WCAG 2.2 AA jako cel (D041).
- Core Web Vitals (D042): dobre wyniki w danych terenowych; w testach orientacyjnie LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; mobile i desktop, warunki testu raportowane bez fałszowania wyników.
- Mobilny, prosty interfejs; widoczny kontakt po polsku; czytelne warunki i odpowiedzi na obawy turystów. Ścieżka: Google → podstrona → wiarygodna oferta → sprawdzenie terminu/ceny → kontakt lub rezerwacja.
- Język: polski (D045); inne wersje językowe poza zakresem do osobnej decyzji.

## 20. Analityka i prywatność
GA4 i Search Console (D043). Zdarzenia: kliknięcie telefonu, WhatsApp, wysłanie formularza, rozpoczęcie rezerwacji, potwierdzona rezerwacja (jeśli technicznie możliwe; potwierdzenie zdarzenia pochodzi z serwera po `CONFIRMED`, nie z przekierowania). Analityka i znaczniki niekonieczne technicznie ładują się dopiero po zgodzie na cookies; baner z możliwością odmowy i cofnięcia zgody; polityka prywatności opisuje cele, dostawców i okresy. Bez PII w zdarzeniach i logach. Jurysdykcja i podstawy prawne: D049.

## 21. Testy, wydanie, utrzymanie
- **Macierz testów:** min. 3 szerokości ekranu; przeglądarki mobilne i desktopowe; formularze, linki, indeksowanie, meta, przekierowania, a11y, SEO, obrazy, błędy konsoli i sieci; działanie bez JavaScript tam, gdzie istotne (treści i nawigacja).
- Porównanie środowiska testowego z produkcyjnym przed publikacją.
- **Publikacja** tylko przez Roberta lub Konrada, po jawnym potwierdzeniu w prompcie/czacie, przez zmergowanie `main` → `production` (D033, D068).
- **Rollback, backup, monitoring** (PostgreSQL i Storage osobno) i checklista po publikacji (indeksacja, konwersje, formularze) przygotowane przed publikacją.
- **30/60/90 dni:** Search Console, CTR, zapytania, rezerwacje, treści, linkowanie, sezonowość; bez gwarancji pozycji.
- Testy z §10 pozostają obowiązkowe dla Fazy C.

## 22. Proces i raportowanie
Etapy 0–5 z bramkami GPT, dwa artefakty po etapie (ZIP + PDF) i formuła zakończenia raportu – `PROCESS.md` (D035, D036). Nowy etap startuje po akceptacji GPT i właściciela (dla decyzji biznesowych).

## 23. Prostota obsługi środowiska (D059)
Środowisko deweloperskie i wdrożeniowe ma być możliwe do obsługi przez osobę nietechniczną lub niespecjalistę (Robert) na podstawie dokumentacji na poziomie runbooka:
- krótka instrukcja uruchomienia lokalnego i wdrożenia krok po kroku (README / `docs/RUNBOOK.md`, tworzony przez Konrada w Etapie 4),
- jedna komenda lub jeden przycisk do typowych czynności (uruchomienie, testy, podgląd, edycja treści), bez ręcznej konfiguracji poza opisaną,
- `.env.example` z opisem każdej zmiennej; sekrety poza repozytorium,
- edycja treści w plikach repozytorium (D040) opisana tak, by zmianę mógł wykonać Robert i obejrzeć w Vercel Preview,
- opis rollbacku i zasad publikacji (jawne potwierdzenie Roberta lub Konrada, merge `main` → `production`, D033, D068) w prostych krokach,
- brak nowych reguł biznesowych wynikających z tego wymagania.

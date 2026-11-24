# Batumi – DECISIONS

## Zasady
- `Accepted`: obowiązuje w implementacji.
- `Open`: nie wolno samodzielnie założyć wartości biznesowej.
- `Superseded`: zastąpione późniejszą decyzją.

| ID | Decyzja | Status | Uzasadnienie / uwagi |
|---|---|---|---|
| D001 | Next.js + TypeScript | Accepted | Jeden stack dla UI i backendu aplikacyjnego |
| D002 | Vercel | Accepted | Hosting i Preview Deployments (Cron nieużywany – D063) |
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
| D025 | Zakres = suma obu źródeł: serwis treściowo-SEO + przewodnik (PL) ORAZ moduł rezerwacji bezpośrednich, w jednej aplikacji Next.js | Accepted | Konflikt: repo = tylko booking app; Master Prompt = serwis SEO/przewodnik. Rozstrzygnięcie: oba, fazowo (D026) |
| D026 | Fazowanie: A = serwis treściowo-SEO (Etapy 0–3 + implementacja), B = kontakt i pomiar, C = rezerwacje bezpośrednie | Accepted | Ruch i wiarygodność przed płatnościami; Faza C po spełnieniu §11 i D037 |
| D027 | Potwierdzenie stacku (D001–D006) po analizie potrzeb | Accepted | Master Prompt: stos po analizie, bez narzucania. Stack Next.js/Vercel/Supabase potwierdzony przez Konrada (właściciela technicznego) 2026-11-24; D001–D006 pozostają Accepted |
| D028 | Zakaz zmyślania faktów (adres, odległości, widok, standard, dostępność, ceny, opinie, atrakcje, czasy dojścia, parametry) | Accepted | Master Prompt – zasada niepodlegająca negocjacji |
| D029 | Rejestr faktów (`potwierdzone` / `hipoteza` / `wymaga_właściciela`) i znacznik `[DO POTWIERDZENIA]`; publikacja treści ze znacznikiem zablokowana | Accepted | `stage-0/rejestr_faktow.csv`; REQUIREMENTS §16 |
| D030 | Zewnętrzne źródła cytowane z URL, datą dostępu i oceną wiarygodności; weryfikacja aktualności transportu/wjazdów/atrakcji | Accepted | SEO-CONTENT §7 |
| D031 | Brak założeń: lokalizacja przy bulwarze ≠ widok na morze/dostęp do plaży; brak fikcyjnych opinii i ocen | Accepted | Weryfikacja mapy i trasy pieszej |
| D032 | Brak obietnic dostępności bez aktualnego kalendarza | Accepted | Spójne z D007 (źródło prawdy dostępności = PostgreSQL w Fazie C) |
| D033 | Publikację produkcyjną i podpięcie domeny przeprowadza wyłącznie Robert albo Konrad, po jawnym potwierdzeniu w prompcie/czacie; potwierdzenie = zatwierdzenie PR do `main` (D068); agenci AI nigdy nie mergują do `main` samodzielnie | Accepted | Konflikt: README „merge do main = deployment produkcyjny” vs Master Prompt. Rozstrzygnięcie użytkownika: potwierdzenie promptem zamiast pisemnej zgody; ostatecznie (D068) merge do `main` = publikacja, więc musi być zatwierdzony przez Roberta/Konrada |
| D034 | Bez odrębnej zgody: zakup domen, wydatki, wiadomości do gości, zmiany w systemach zewnętrznych | Accepted | Dotyczy także agentów AI |
| D035 | Proces etapów 0–5 z bramkami GPT-0..3, współistnieje z CI/Vercel Preview | Accepted | `PROCESS.md` |
| D036 | Po każdym etapie ZIP (dla ChatGPT) + PDF (dla właściciela); raport kończy się formułą STATUS/DOWODY/PROBLEMY/DECYZJE DO GPT/DECYZJE DO WŁAŚCICIELA/NASTĘPNY ETAP | Accepted | Brak sekretów/PII/danych płatniczych w artefaktach; ZIP/PDF poza Git (D055) |
| D037 | Kanał sprzedaży: bezpośrednia rezerwacja online / formularz / WhatsApp / telefon / zewnętrzny silnik | Open | Wymaga decyzji właściciela w Etapie 2; nie zmienia planu modułu Faza C |
| D038 | Telefon, WhatsApp i formularz jako obsługiwana ścieżka przejściowa do czasu Fazy C | Accepted | Rezerwacja bezpośrednia z płatnością online pozostaje planowanym modułem |
| D039 | Mapa witryny, specyfikacja stron, keyword map, research konkurencji (8–12), plan redakcyjny 20–30 tematów | Accepted | `SEO-CONTENT.md`; strony bez wartości usuwane |
| D040 | Treści stron i przewodnika jako pliki w repozytorium (MDX/TS), bez CMS | Accepted | Zgodne z „poza MVP: rozbudowany CMS”; rewizja po Etapie 2 |
| D041 | WCAG 2.2 AA jako cel | Accepted | |
| D042 | Cele wydajności: dobre CWV w danych terenowych; orientacyjnie LCP ≤2,5 s, INP ≤200 ms, CLS ≤0,1 | Accepted | Raportowanie bez fałszowania wyników |
| D043 | Analityka GA4 + Search Console, zdarzenia: telefon, WhatsApp, formularz, rozpoczęcie rezerwacji, potwierdzona rezerwacja; ładowanie po zgodzie cookies | Accepted | Włączenie po publikacji za zgodą i po polityce prywatności |
| D044 | Macierz testów (≥3 szerokości, przeglądarki, bez JS), rollback, backup, monitoring, checklista po publikacji, 30/60/90 dni | Accepted | REQUIREMENTS §21 |
| D045 | Język serwisu: polski; inne wersje językowe poza zakresem do osobnej decyzji | Accepted | |
| D046 | Waluty informacyjne obok PLN (np. GEL/EUR/USD) | Open | D008 (PLN) obowiązuje dla cen dla gościa |
| D047 | Podatki w Gruzji i podmiot prawny prowadzący wynajem | Open | Rozszerza D018; blokuje treści prawne i ostateczne twierdzenia cenowe |
| D048 | Przydatność operatora płatności (Stripe vs Przelewy24) do rozliczeń w PLN dla obiektu w Gruzji | Open | Doprecyzowuje D011; blokuje płatności Faza C |
| D049 | Jurysdykcja i podstawy prawne regulaminu i polityki prywatności (PL/GE/UE) | Open | Wymagane przed analityką i Fazą C |
| D050 | Domena i hosting (posiadana/zakup, konta) | Open | Zakup tylko po zgodzie (D034) |
| D051 | Strona `/cennik-i-dostepnosc` | Open | Tylko przy aktualizowanych danych/żywym kalendarzu |
| D052 | Prawa do zdjęć i treści, anonimizacja materiałów | Open | Przed publikacją galerii |
| D053 | Przechowywanie zapytań z formularza i retencja | Open | Do czasu decyzji brak tabeli z PII (DATA-MODEL §14); powiązane z D022 |
| D054 | Role procesu: właściciel (Robert) = decydent biznesowy i zatwierdzający publikację; Konrad = konfiguracja techniczna (D056); Claude Code = wykonawca; ChatGPT = koordynator/audytor; własny raport nie jest niezależną kontrolą | Accepted | `PROCESS.md` §1 |
| D055 | Artefakty raportowe (ZIP/PDF) nie są commitowane do repozytorium, chyba że właściciel zdecyduje inaczej | Accepted | Ochrona przed wyciekiem danych |
| D056 | Podział ról: Robert = właściciel obiektu (decyzje biznesowe, dane o ofercie, rozstrzyganie `Open`, jawne potwierdzenie publikacji D033, sam lub przez Konrada); Konrad = brat właściciela, właściciel techniczny (konfiguracja środowiska i narzędzi dla prostego rozwoju i wdrożeń przez Roberta; może przeprowadzić publikację po jawnym potwierdzeniu, D033) | Accepted | Potwierdzone przez użytkownika; „właściciel” w Master Prompt = Robert |
| D057 | Brak sekretów, tokenów, PII gości i danych płatniczych w repozytorium, raportach i ZIP | Accepted | Rozszerza README (sekrety server-only) |
| D058 | Dane strukturalne tylko zgodne z realną zawartością i wytycznymi Google; bez fałszywych ocen i obietnic rich results | Accepted | Organization/Person, BreadcrumbList, FAQPage tylko jeśli zasadne |
| D059 | Środowisko deweloperskie i wdrożeniowe ma być proste w obsłudze dla niespecjalisty (Robert), z dokumentacją na poziomie runbooka | Accepted | REQUIREMENTS §23; bez nowych reguł biznesowych |
| D060 | ~~Wdrożenie produkcyjne przez GitHub Actions (`workflow_dispatch` / Environment `production`)~~ | Superseded | Zastąpione przez D068 (brak workflow deploy; Vercel wdraża z gałęzi `main`) |
| D061 | ~~Integracja GitHub Actions z Vercel~~ | Superseded | Zastąpione przez D068; Actions służy tylko do CI |
| D062 | Plan Vercel Hobby (darmowy): wg Terms of Service tylko do użytku osobistego/niekomercyjnego | Accepted | Decyzja użytkownika (2026-11-24): projekt na razie hobbystyczny, więc Hobby wystarcza. Źródło: https://vercel.com/legal/terms §Hobby Plan (dostęp 2026-11-24). **Przy komercjalizacji wrócić do tej decyzji** (Vercel Pro lub inny hosting). |
| D063 | Wygasanie hold bez crona: leniwie, przez timestamp (`hold_expires_at`) w bazie, sprawdzany przy odczycie/zapisie i przy tworzeniu nowej rezerwacji | Accepted | Decyzja użytkownika (2026-11-24): ok. 100 rezerwacji rocznie, cron zbędny. Powód: Vercel Cron na Hobby działa max 1x dziennie (https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing, dostęp 2026-11-24). Zastępuje cron z ARCHITECTURE §6; `CRON_SECRET` opcjonalny. Wymóg: idempotencja i bezpieczeństwo wobec równoległego webhooka. |
| D064 | Supabase Free: projekty z niską aktywnością są pauzowane po 7 dniach; limity m.in. 500 MB bazy, 1 GB plików, 2 projekty aktywne | Open | Źródło: https://supabase.com/docs/guides/platform/free-project-pausing (dostęp 2026-11-24); limity do ponownej weryfikacji na https://supabase.com/pricing. Free tylko dla dev/preview; produkcja z rezerwacjami wymaga planu bez pauzowania lub decyzji o ryzyku. |
| D065 | Osobne projekty Supabase dla staging i production (Free pozwala na 2 aktywne projekty na organizację) | Open | Konrad potwierdza. Lokalny Supabase CLI jako trzecie środowisko (ARCHITECTURE §7). |
| D066 | Domena: start na darmowej subdomenie `*.vercel.app`; własna domena (np. .pl/.com, ewentualnie .ge) to osobny zakup wymagający zgody Roberta | Open | D034: bez wydatków bez zgody. Darmowe domeny zewnętrzne (np. dostawcy „free TLD”) mają ryzyko reputacji/SEO i niestabilności – tylko jako notatka. Wpływa na canonical, sitemap, GA4/Search Console (SEO-CONTENT). |
| D067 | Scaffold aplikacji (Next.js App Router, TypeScript, Vitest, ESLint) i workflow CI (`ci.yml`) w repozytorium | Accepted | Workflowy deploy (`deploy-preview.yml`, `deploy-production.yml`) usunięte na rzecz D068. Kroki: docs/SETUP.md. |
| D068 | **Jeden projekt Vercel** (`sunrise-batumi`): gałąź `main` = Production (`sunrise-batumi.vercel.app`; merge do `main` = publikacja), gałąź `staging` = Preview z domeną `test-sunrise-batumi.vercel.app` przypiętą do gałęzi `staging` (Domains → Connect to Git Branch). Domyślnie wszystkie zmiany idą PR-ami do `staging`; promocja `staging` → `main` tylko na wyraźne życzenie Roberta lub Konrada, z ochroną `main` (PR, recenzent, zielone CI) | Accepted | Decyzja użytkownika (2026-11-24); zastępuje D060/D061 i wcześniejsze warianty (gałąź `production`, dwa projekty Vercel). Zmienne środowiskowe osobno dla Production i Preview; Vercel Authentication wyłączone dla preview, aby Robert wchodził bez konta. Osobny projekt Supabase dla staging i production (D065). Własna domena później, za zgodą Roberta (D034, D066). Hobby = projekt hobbystyczny (D062); przy komercjalizacji wrócić do planu/hostingu. |
| D069 | **Rezerwacja bez płatności online (Faza B, zaimplementowana na staging):** formularz `/rezerwacja`, walidacja serwerowa (zod), RPC `create_pending_reservation` (blokada 15 min przez `hold_expires_at`, leniwe wygasanie D063, kontrola `calendar_blocks`, constraint przeciw nakładaniu), publiczne zajęte terminy przez `get_unavailable_ranges` (bez PII), zapisy tylko serwerowo z `service_role` (RLS bez zmian), e-mail Resend opcjonalny (`RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL`). Brak cen/opłat; wersje regulaminu i polityki = `[DO POTWIERDZENIA]` do czasu D047/D049. Otwarte: potwierdzanie rezerwacji (ręcznie przez admina – brak panelu), treści prawne, ceny, operator płatności (D011), retencja PII (D053), mechanizm antyspamowy. | Accepted (zakres) / Open (elementy wyżej) | Zakres wybrany przez użytkownika; migracja `20261124140000_create_reservation_rpc.sql` |
| D070 | **Panel administracyjny (`/admin`, PL):** Supabase Auth (e-mail + hasło), dostęp tylko dla `admin_profiles` (`is_admin()`), middleware + `requireAdmin()` na każdej stronie i akcji; zapisy server actions przez sesję admina i RLS (bez `service_role`, bez luzowania polityk); zakres: dane apartamentu (tylko nazwa) i udogodnienia, lista rezerwacji z filtrem i zmianą statusu (potwierdź/anuluj/zakończ wg dozwolonych przejść), blokady terminów. Pierwszy admin: migracja `20261124150000_bootstrap_admin.sql` nadaje rolę użytkownikowi `sunriseapartmentbatumi@gmail.com` (trigger + backfill, bez haseł w repo); konto tworzy się ręcznie w Supabase Auth (SETUP §6b); adres zmienia się nową migracją. Otwarte: reguły cenowe/opłaty/min. pobyt (decyzje Open – pola nieedytowalne), edycja zdjęć/opisów, audit trail zmian statusu, MFA. | Accepted (zakres) / Open (elementy wyżej) | Zakres wskazany przez użytkownika; D069 |
| D071 | **Fazowanie:** rezerwacja z blokadą terminu BEZ płatności online jest wdrożona przed Fazą C (D069); płatności, webhook, ceny i opłaty pozostają w Fazie C po decyzjach Open (D011, D048 i in.). Do czasu płatności rezerwacja ma status `pending_payment` i jest potwierdzana ręcznie w panelu. | Accepted | Prośba użytkownika (zakres „bez płatności”) |
| D072 | **Migracje stosowane ręcznie** (SQL Editor lub `supabase db push`), najpierw staging, potem produkcja; CI/Vercel ich nie uruchamiają. Po zmianie funkcji ewentualnie `notify pgrst, 'reload schema'`. | Accepted | Prostota dla właściciela (D059); brak zdalnych migracji z agenta (D034) |
| D073 | **Pierwszy admin:** konto tworzone ręcznie w Supabase Auth z hasłem i *Auto Confirm* (domyślny SMTP Supabase ma niski limit maili); migracja `bootstrap_admin` nadaje rolę adresowi `sunriseapartmentbatumi@gmail.com`; rejestracja publiczna wyłączona. Zmiana adresu = nowa migracja. | Accepted | Lekcja ze stagingu 2026-11-24 |
| D074 | **Diagnostyka i logi:** błędy DB logowane strukturalnie (`[db-error]` itd., bez PII/sekretów), formularz zawsze pokazuje wynik, `/admin/diagnostyka` pokazuje stan konfiguracji (env tylko true/false). Lekcja: ogólny komunikat bez logów uniemożliwiał diagnozę; działanie na stagingu najpierw sprawdzaj w diagnostyce i logach Vercel. | Accepted | PR #9, #10 |
| D075 | **Zasady współpracy PR:** wszystkie zmiany PR-em do `staging`; brak auto-merge, merge ręczny po zielonym CI; `main` chroniony (PR + recenzent + CI, D068); agenci nie mergują. Praca z dowolnym agentem AI (Claude, Copilot) wg `CLAUDE.md`; Robert nie zakłada dostępu do GitHub Copilot (`docs/HANDOVER.md`). | Accepted | Prośba użytkownika; D033, D068 |
| D076 | Ochrona gałęzi w GitHub (wymagany recenzent/CI dla `main` i `staging`) – faktyczny stan ustawień do potwierdzenia przez Konrada. | Open | SETUP §2 |

## Guardrail
Pole istniejące w schemacie nie jest równoznaczne z zatwierdzoną funkcją. Treść publiczna nie może prezentować jako obowiązującej reguły oznaczonej `Open`. Dla decyzji `Open` kod nie może wprowadzać reguły biznesowej poza neutralnym defaultem potrzebnym do działania schematu.

## Source reconciliation (traceability)
Źródła: **PDF** = `Batumi_Claude_Code_Master_Prompt_v2.pdf`; **Repo** = dokumenty `docs/` przed scaleniem. Konflikty i rozstrzygnięcia: D025–D058.

| Wymaganie ze źródła | Gdzie w dokumentacji | Decyzje |
|---|---|---|
| PDF: cel – polskojęzyczny serwis jednego apartamentu, okolica bulwaru Lecha i Marii Kaczyńskich, przewodnik, proces zapytań | PRODUCT „Cel”, „Fazy produktu” | D025, D026 |
| PDF: role (wykonawca/GPT/właściciel), GPT jako bramka | PROCESS §1; REQUIREMENTS §1a | D054, D056 |
| PDF: zakaz zmyślania faktów; brak założeń o widoku/plaży; brak fikcyjnych opinii | REQUIREMENTS §16.1, 16.5–16.6; PRODUCT „Zasady twarde” | D028, D031 |
| PDF: rozróżnienie potwierdzone/hipoteza/dane od właściciela; rejestr faktów | REQUIREMENTS §16.2; `stage-0/rejestr_faktow.csv` | D029 |
| PDF: `[DO POTWIERDZENIA]` | REQUIREMENTS §16.3; ARCHITECTURE §10 | D029 |
| PDF: cytowanie źródeł z datą i wiarygodnością | REQUIREMENTS §16.4; SEO-CONTENT §7 | D030 |
| PDF: brak zakupów/wydatków/publikacji/wiadomości bez zgody | REQUIREMENTS §16.7; PROCESS §5, §7 | D033, D034 |
| PDF: Git, changelog, ryzyka, backlog; brak sekretów | PROCESS §10; `stage-0/ryzyka.md`; README | D057 |
| PDF Etap 0: pytania BLOKUJE/WAŻNE/OPCJONALNE; 5 dokumentów | `stage-0/*`; REQUIREMENTS §11 | D035 |
| PDF Etap 1: intencje, klastry, metryki z narzędziem/datą, 8–12 konkurentów, priorytety | SEO-CONTENT §5; REQUIREMENTS §17 | D039 |
| PDF Etap 2: ścieżka użytkownika, kanał sprzedaży, mapa witryny, specyfikacja stron, mobilny UX, brak obietnic dostępności | SEO-CONTENT §1–§3; REQUIREMENTS §17, §19 | D037, D038, D039, D032, D051 |
| PDF Etap 3: plan 20–30 tematów, 5 szkiców, pytania gości, przewodnik, daty aktualizacji | SEO-CONTENT §4, §6; REQUIREMENTS §17 | D039, D040 |
| PDF Etap 4: stos po analizie | ARCHITECTURE §1; REQUIREMENTS nagłówek | D027 |
| PDF Etap 4: semantyczny HTML, WCAG 2.2 AA, formularze/antyspam, obrazy, sitemap/robots/canonical/breadcrumbs/OG/404/przekierowania | REQUIREMENTS §18–§19; SEO-CONTENT §8 | D041 |
| PDF Etap 4: dane strukturalne tylko realne | REQUIREMENTS §18; SEO-CONTENT §3, §8 | D058 |
| PDF Etap 4: CWV (LCP/INP/CLS) | REQUIREMENTS §19 | D042 |
| PDF Etap 4: GA4/Search Console, zdarzenia, zgoda cookies, prywatność | REQUIREMENTS §20; ARCHITECTURE §11; SEO-CONTENT §9 | D043, D049 |
| PDF Etap 5: testy (3 szerokości, przeglądarki, formularze, a11y, bez JS), porównanie test/prod, publikacja za zgodą, rollback, backup, monitoring, 30/60/90 | REQUIREMENTS §21; PROCESS §7–§9; SEO-CONTENT §10 | D033, D044 |
| PDF: protokół ZIP + PDF, formuła STATUS…NASTĘPNY ETAP, brak sekretów w ZIP | PROCESS §3–§4 | D036, D055, D057 |
| PDF: pierwsze polecenie (pytania, harmonogram, metodologia, narzędzia, zakres Etapu 0) | PROCESS §6; `stage-0/*` | D035 |
| PDF: język polski | REQUIREMENTS §19 | D045 |
| Repo: bezpośrednia rezerwacja online, hold 15 min, exclusion constraint, webhook, panel admina, Resend | Bez zmian: REQUIREMENTS §2–§10, ARCHITECTURE, DATA-MODEL; Faza C | D001–D024, D026 |
| Repo: PLN, operator płatności Open | REQUIREMENTS §6, §11 | D008, D011, D046, D048 |
| Repo: „merge do main = deployment produkcyjny” | README, ARCHITECTURE §8, PROCESS §7 | D033, D068 |
| Repo: podstawowe SEO w MVP | rozszerzone do REQUIREMENTS §17–§19 | D039 |
| Repo: poza MVP rozbudowany CMS | REQUIREMENTS §12 – treści w repozytorium | D040 |
| Wymóg: prosta obsługa środowiska dla Roberta | REQUIREMENTS §23 | D059 |

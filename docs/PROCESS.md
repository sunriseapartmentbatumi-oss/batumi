# Batumi – PROCESS

Dokument operacyjny (poniżej `REQUIREMENTS.md` w hierarchii): opisuje role, etapy z bramkami, protokół raportowania i zasady publikacji. Źródło: Master Prompt v2 („Projekt strony i SEO”), uzgodniony z procesem inżynierskim repozytorium (CI, Vercel Preview). Decyzje: D025–D059 w [`DECISIONS.md`](DECISIONS.md).

## 1. Role
| Rola | Odpowiedzialność |
|---|---|
| Właściciel apartamentu (Robert) | Decydent biznesowy i jedyne źródło danych o ofercie; rozstrzyga decyzje `Open`; pisemnie zatwierdza publikację produkcyjną i wszelkie wydatki. W dokumentach „właściciel” = Robert. |
| Właściciel techniczny (Konrad, brat właściciela) | Konfiguracja i utrzymanie środowiska projektowego (repozytorium, CI, Vercel, Supabase) tak, by Robert mógł je prosto rozwijać i wdrażać (D056, D059). Nie zatwierdza publikacji ani decyzji biznesowych za Roberta. |
| Wykonawca (Claude Code) | Analiza SEO, research, UX/UI, treści, implementacja, testy. Nie ogłasza końcowej akceptacji. |
| Koordynator/audytor (ChatGPT, „GPT”) | Niezależna bramka: weryfikuje dowody, proponuje korekty, przedstawia decyzje właścicielowi. Nie jest podwykonawcą. |

Własny raport wykonawcy nie jest niezależną kontrolą.

## 2. Etapy i bramki
| Etap | Zakres | Wyniki | Bramka |
|---|---|---|---|
| 0 Discovery | Brief, materiały, domena, hosting, konkurenci, istniejące rezerwacje; lista braków BLOKUJE/WAŻNE/OPCJONALNE | `docs/stage-0/*` | GPT-0: zatwierdzenie zakresu i kolejności |
| 1 Research SEO | Intencje, klastry, konkurenci (min. 8–12), priorytety | `analiza_rynku.md`, `keyword_map.csv`, `konkurencja.csv`, `content_gap.md` | GPT-1: przegląd metodologii przed strukturą |
| 2 Strategia/UX/architektura | Ścieżka Google→oferta→kontakt/rezerwacja, mapa witryny, makiety, komunikacja, kanał sprzedaży | spec stron wg `SEO-CONTENT.md` | GPT-2: mapa witryny, makiety, komunikacja |
| 3 Treści i przewodnik | Plan 20–30 tematów, 5 szkiców, odpowiedzi na pytania gości | treści z datami i źródłami | GPT-3: fact-check, użyteczność, spójność oferty |
| 4 Implementacja i SEO techniczne | Kod, a11y, wydajność, dane strukturalne, analityka | PR-y, wyniki pomiarów | review PR + raport |
| 5 Testy, publikacja, rozwój | Testy, porównanie test/prod, rollback, backup, monitoring, 30/60/90 | raport testów, plan wdrożenia | pisemna zgoda właściciela |

Następny etap nie startuje bez akceptacji GPT i – dla decyzji biznesowych – właściciela. Etapy 0–3 dotyczą Fazy A, Etap 4–5 Fazy A i późniejszych (patrz `PRODUCT.md`). Faza C (rezerwacje) ma dodatkowe bramki z `REQUIREMENTS.md` §11.

## 3. Dwa artefakty po każdym etapie
1. **ZIP dla ChatGPT**: README, raport techniczny, wyniki badań, źródła i daty, pliki konfiguracyjne/zmiany, diffy, wyniki testów, błędy, ryzyka, lista decyzji, rekomendacja następnego etapu.
2. **Krótki PDF dla właściciela**: co zrobiono, co działa, co nie działa, wymagane decyzje, koszt/ryzyko, kolejny krok.

Zasady: brak haseł, tokenów, danych osobowych gości i danych płatniczych; screenshoty zanonimizowane; identyfikatory wersji, daty i sumy kontrolne ważnych artefaktów. ZIP/PDF są artefaktami raportowymi – nie commitujemy ich do repozytorium, chyba że właściciel zdecyduje inaczej.

## 4. Formuła zakończenia raportu
Każdy raport kończy się sekcjami: `STATUS` (PASS / WARUNKOWO / BLOCKED), `DOWODY`, `PROBLEMY`, `DECYZJE DO GPT`, `DECYZJE DO WŁAŚCICIELA`, `NASTĘPNY ETAP`.

Gdy GPT wykryje błąd: plan korekty, diff, ponowne testy, nowy ZIP/PDF.

## 5. Czynności wymagające odrębnej zgody właściciela
Bez wyraźnej (pisemnej) zgody nie wolno: kupować domen, ponosić wydatków (płatne narzędzia, hosting, reklamy), publikować na produkcji, wysyłać wiadomości do gości, zmieniać systemów zewnętrznych. Dotyczy także agentów AI. Sekretów nie przechowuje się w repozytorium ani raportach.

## 6. Pierwsze polecenie (start Etapu 0)
Nie zaczynać od kodowania. Kolejno: (1) pytania blokujące do właściciela – `stage-0/pytania_do_wlasciciela.md`, (2) harmonogram etapów z bramkami – `stage-0/plan_etapow.md`, (3) metodologia audytu SEO i konkurencji – `SEO-CONTENT.md` §5, (4) narzędzia i ograniczenia – `stage-0/00_zalozenia.md` §5, (5) zakres Etapu 0 do akceptacji; ocena kompletności briefu.

## 7. Współistnienie z procesem repozytorium
- PR → lint/typecheck/test/build → Vercel Preview (patrz `README.md`) jest mechanizmem technicznym; bramki GPT/właściciela są bramkami decyzyjnymi. Oba obowiązują.
- Merge do `main` **nie oznacza** automatycznej publikacji dla odbiorców: wdrożenie produkcyjne i podpięcie domeny wymaga pisemnej zgody właściciela (D033). Do czasu zgody `main` jest wdrażany wyłącznie do środowiska nieindeksowanego (noindex, bez publicznej domeny) lub produkcyjne wdrożenie jest wstrzymane w ustawieniach Vercel.
- Zgodę wydaje Robert; Konrad wykonuje wdrożenie dopiero po niej.
- Zgoda właściciela jest rejestrowana (data, zakres, wersja/commit) w changelogu wydania.

## 8. Rollback, backup, monitoring, po publikacji
Wymagania szczegółowe: `REQUIREMENTS.md` §21. Plan rollback (Vercel promote poprzedniego deploymentu, migracje expand-and-contract), backup (PostgreSQL i Storage osobno), monitoring i checklista po publikacji (indeksacja, konwersje, formularze) są przygotowywane w Etapie 5 i zatwierdzane przed publikacją.

## 9. Plan 30/60/90 dni po uruchomieniu
Obserwacja Search Console, CTR, zapytań, zapytań/rezerwacji, treści, linkowania i sezonowości; przegląd po 30, 60 i 90 dniach. Bez gwarancji pozycji w Google.

## 10. Prowadzenie dokumentów projektowych
Repozytorium Git, changelog (`CHANGELOG.md`, tworzony w Etapie 4 – do tego czasu historia w Git), lista ryzyk (`stage-0/ryzyka.md`) i backlog (GitHub Issues) są obowiązkowe.

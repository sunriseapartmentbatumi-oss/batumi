# SETUP – uruchomienie środowiska i CI/CD (runbook)

Dla: Konrad (konfiguracja), Robert (wiedza, jak to działa). Zasady: D034 (bez wydatków bez zgody), D057 (żadnych sekretów w repozytorium), D068 (merge do `main` = publikacja, tylko po zatwierdzeniu przez Roberta lub Konrada).

Konta zakłada Konrad samodzielnie. Agent/automatyzacja nie zakłada kont, nie kupuje domen i nie wdraża na produkcję.

## 0. Najważniejsze ostrzeżenia (stan na 2026-11-24)

| Temat | Fakt | Źródło | Decyzja |
|---|---|---|---|
| Vercel Hobby a użycie komercyjne | Plan Hobby wolno używać „wyłącznie do użytku osobistego lub niekomercyjnego”. Projekt jest na razie hobbystyczny (D062 Accepted); przy komercjalizacji wrócić do decyzji. | https://vercel.com/legal/terms (sekcja Hobby Plan, aktualizacja 2026-10-19) | D062 |
| Vercel Hobby – limity | m.in. 1 mln wywołań funkcji, 100 GB transferu; po przekroczeniu funkcja bywa niedostępna przez 30 dni. | https://vercel.com/docs/plans/hobby, https://vercel.com/docs/limits/fair-use-guidelines | D062 |
| Vercel Cron na Hobby | Tylko 1x dziennie, dokładność ±59 min. Nie używamy crona: wygasanie hold leniwe przez `hold_expires_at` (D063). | https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing | D063 |
| Supabase Free | Pauzowanie projektu po 7 dniach niskiej aktywności; ok. 500 MB bazy, 1 GB plików, 2 aktywne projekty. | https://supabase.com/docs/guides/platform/free-project-pausing, https://supabase.com/pricing | D064 |

Wniosek: projekt jest na razie hobbystyczny, więc darmowe plany wystarczają (D062, D063 Accepted). Przy komercjalizacji wróć do D062 i D064 (pauzowanie Supabase, Open).

## 1. Model środowisk (D068)

| Środowisko | Projekt Vercel | Gałąź | Supabase | Wdrożenie |
|---|---|---|---|---|
| Production | `sunrise-batumi` (`sunrise-batumi.vercel.app`) | `main` | projekt Supabase produkcyjny | automatyczne po merge do `main` = publikacja |
| Staging (Preview) | ten sam projekt `sunrise-batumi` | `staging` | projekt Supabase staging | automatyczne po merge do `staging`; domena `test-sunrise-batumi.vercel.app` |

Jeden projekt Vercel; staging to wdrożenie Preview gałęzi `staging` z przypiętą domeną.

Domyślny przepływ: **wszystkie zmiany idą PR-ami do `staging`**; promocja `staging` → `main` (publikacja) tylko na wyraźne życzenie Roberta lub Konrada. Szczegółowo: zmiany → PR do `staging` → test na stagingu → PR `staging` → `main`, zatwierdzany przez Roberta lub Konrada po jawnym potwierdzeniu w prompcie/czacie (D033). Agenci AI nie mergują do `main`.

## 2. Kroki ręczne Konrada (checklista)

Nic z tego nie robi agent; żadnych kosztów bez zgody Roberta (D034).

GitHub:
- [x] Gałąź `staging` istnieje (utworzona z `main`); nowe PR-y kieruj do `staging`. Repozytorium nie ma auto-merge – PR merguje człowiek po zielonym CI.
- [ ] Settings → Branches → reguła dla `main`: wymagany Pull Request, min. 1 recenzent (Robert/Konrad), wymagane zielone CI (`checks`), zakaz force-push.
- [ ] Opcjonalnie lżejsza reguła dla `staging` (wymagane CI).

Vercel – jeden projekt `sunrise-batumi`:
- [ ] Settings → Git: Production Branch = `main` (bez zmiany nazwy projektu).
- [ ] Settings → Domains → Add `test-sunrise-batumi.vercel.app` → **Connect to Git Branch** = `staging` (po utworzeniu gałęzi `staging`).
- [ ] Settings → Environment Variables: osobne wartości dla **Production** (Supabase produkcyjny, osobne sekrety i webhooki) i **Preview** (Supabase staging; ewentualnie tylko dla gałęzi `staging`).
- [ ] Settings → Deployment Protection → **Vercel Authentication: wyłącz dla Preview**, aby Robert wchodził na staging bez konta Vercel (strona ma `noindex`; nie wkładaj do stagingu danych wrażliwych).
- [ ] Jeśli domena `test-sunrise-batumi.vercel.app` jest zajęta, wybierz inną i zaktualizuj dokumentację.

Supabase:
- [ ] Dwa osobne projekty: staging i production (D065). `SUPABASE_SERVICE_ROLE_KEY` tylko po stronie serwera (bez `NEXT_PUBLIC_`).

Domena: zostaje `*.vercel.app`; własna domena dopiero za zgodą Roberta (D034, D066).

## 3. Ostrzeżenia dot. darmowych planów (stan na 2026-11-24)

| Temat | Fakt | Źródło | Decyzja |
|---|---|---|---|
| Vercel Hobby a użycie komercyjne | Plan Hobby wolno używać „wyłącznie do użytku osobistego lub niekomercyjnego”. Projekt jest na razie hobbystyczny; przy komercjalizacji wrócić do planu/hostingu. | https://vercel.com/legal/terms (sekcja Hobby Plan, aktualizacja 2026-10-19) | D062 |
| Vercel Hobby – limity | m.in. 1 mln wywołań funkcji, 100 GB transferu; po przekroczeniu funkcja bywa niedostępna przez 30 dni. | https://vercel.com/docs/plans/hobby, https://vercel.com/docs/limits/fair-use-guidelines | D062 |
| Vercel Cron na Hobby | Tylko 1x dziennie. Nie używamy crona: wygasanie hold leniwe przez `hold_expires_at`. | https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing | D063 |
| Supabase Free | Pauzowanie po 7 dniach niskiej aktywności; ok. 500 MB bazy, 1 GB plików, 2 aktywne projekty. | https://supabase.com/docs/guides/platform/free-project-pausing, https://supabase.com/pricing | D064 |

Uwaga: Supabase Free pozwala na 2 aktywne projekty na organizację – staging + production mieszczą się dokładnie w limicie.

## 4. CI

`.github/workflows/ci.yml` – przy każdym PR oraz pushu do `main` i `staging`: lint, typecheck, test, build. Nie wymaga sekretów i niczego nie wdraża. Wdrożeniami zajmuje się integracja Git Vercel (podgląd PR, staging z `staging`, produkcja z `main`).

## 5. Publikacja produkcyjna

Wykonuje Robert lub Konrad, po jawnym potwierdzeniu w prompcie/czacie (D033):
1. Zmiany zmergowane do `staging` i sprawdzone na `test-sunrise-batumi.vercel.app`.
2. Otwórz PR `staging` → `main`; recenzent zatwierdza, CI jest zielone, merge.
3. Vercel (Production) wdraża automatycznie z `main` – to jest publikacja.
4. Rollback: Vercel → Deployments → poprzednie wdrożenie → Instant Rollback, albo revert merge na `main`.

## 6. Lokalnie

```bash
cp .env.example .env.local   # uzupełnij lokalnie
npm install
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck && npm run test && npm run build
```

Wymagany Node.js 20.9+ (CI używa 22).

## 6a. Migracje bazy (Supabase)

Schemat: `supabase/migrations/*.sql` (szkic wg `docs/DATA-MODEL.md`: apartament, udogodnienia, blokady, rezerwacje, `admin_profiles`; RLS włączone, brak reguł cenowych i płatności – decyzje Open; wygasanie leniwe przez `hold_expires_at`, D063). Migracje **nie są** uruchamiane automatycznie przez CI ani Vercel. Pliki: `20261124120000_initial_schema.sql`, `20261124140000_create_reservation_rpc.sql`, `20261124150000_bootstrap_admin.sql` – stosuj w tej kolejności.

**Najprościej (bez CLI):** Supabase → SQL Editor → New query → wklej zawartość kolejnego pliku `.sql` → Run, po kolei dla każdego pliku, najpierw na stagingu, potem na produkcji. Po zmianie funkcji w bazie, jeśli API zgłasza brak funkcji, odśwież cache schematu (`notify pgrst, 'reload schema';`).

Zastosowanie przez CLI (alternatywa; najpierw staging, po sprawdzeniu produkcja):
1. `npm i -g supabase` (lub `npx supabase`), `supabase login`.
2. `supabase link --project-ref <ref projektu staging>` → `supabase db push`.
3. Sprawdź w Dashboard → Table Editor, że tabele istnieją i mają włączone RLS.
4. Po akceptacji powtórz dla projektu produkcyjnego (`supabase link --project-ref <ref produkcji>` → `supabase db push`).
5. Klucze: `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publiczne) oraz `SUPABASE_SERVICE_ROLE_KEY` (**tylko serwer**, bez `NEXT_PUBLIC_`) ustaw w Vercel osobno dla Production i Preview. Nigdy nie commituj wartości (D034, D057).

Druga migracja (`..._create_reservation_rpc.sql`) dodaje funkcje używane przez formularz rezerwacji (tylko `service_role`). Opcjonalny e-mail: `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL` w Vercel (bez nich powiadomienie jest pomijane).

Po zmianie schematu zaktualizuj `src/types/database.ts` (`supabase gen types typescript`) w tym samym PR.

## 6b. Panel administracyjny i pierwszy admin

Panel: `/admin` (logowanie e-mail + hasło przez Supabase Auth, bez publicznej rejestracji). Dostęp mają tylko użytkownicy z aktywnym wierszem w `admin_profiles`. Zapisy idą przez sesję zalogowanego admina i RLS (`is_admin()`); `service_role` nie jest używany w panelu.

**Przed pierwszym użyciem na stagingu** zastosuj obie migracje (`supabase db push`, §6a) – w tym `..._create_reservation_rpc.sql`, bez której formularz rezerwacji nie działa. Jeśli tego jeszcze nie zrobiono, zrób to teraz.

Pierwszy admin (raz na staging i raz na production): migracja `20261124150000_bootstrap_admin.sql` automatycznie nadaje rolę admina użytkownikowi o e-mailu `sunriseapartmentbatumi@gmail.com` (backfill, jeśli już istnieje, oraz trigger przy tworzeniu konta). Hasła nie ma w repozytorium.
1. Zastosuj migracje (§6a) na danym środowisku.
2. Supabase → Authentication → Users → **Add user** (e-mail powyżej, **ustaw hasło** i zaznacz *Auto Confirm User*) – to zalecana ścieżka, bo domyślny wbudowany SMTP Supabase ma bardzo niski limit wiadomości i maile z zaproszeniem/resetem bywają blokowane. **Invite user** / magic link używaj tylko jeśli maile dochodzą. Trigger doda wpis w `admin_profiles`.
3. Authentication → Sign In / Providers: wyłącz **Allow new users to sign up**.
4. Authentication → URL Configuration: **Site URL** i **Redirect URLs** ustaw na adres środowiska (staging: `https://test-sunrise-batumi.vercel.app`, production: `https://sunrise-batumi.vercel.app`), inaczej linki z zaproszeń/resetu hasła nie zadziałają.
5. Wejdź na `/admin/login`. Najpierw zapisz dane apartamentu (Apartament → „Utwórz apartament"); bez tego formularz rezerwacji i blokady nie zadziałają.

Inny admin: dodaj użytkownika w Auth i wstaw wiersz ręcznie: `insert into admin_profiles (user_id) select id from auth.users where email = '...';`.

## 6c. Diagnostyka

Gdy formularz rezerwacji zwraca błąd: zaloguj się do `/admin/diagnostyka` – pokazuje, które zmienne środowiskowe są ustawione (bez wartości), host Supabase, istnienie wiersza `properties` i funkcji z migracji, wraz z podpowiedzią naprawy. Szczegóły błędów baz danych są w logach serwera Vercel (Logs → szukaj `[db-error]` lub `[config-error]`); logi nie zawierają danych gości ani kluczy.

## 6d. Zmienne środowiskowe (komplet)

| Zmienna | Gdzie | Uwagi |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel Production i Preview (osobno) | publiczne; ustawiają, z którą bazą łączy się środowisko |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Production i Preview (osobno) | **tylko serwer**, bez `NEXT_PUBLIC_`; używany wyłącznie przez formularz rezerwacji |
| `NEXT_PUBLIC_APP_URL` | Vercel | bazowy adres (sitemap) |
| `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL` | opcjonalne | bez nich e-mail jest pomijany |

Po zmianie zmiennych w Vercel wymagany jest redeploy. Brak zmiennych płatności i cron (D011 Open, D063).

## 7. Otwarte punkty

D064 (pauzowanie Supabase), D066 (domena). Szczegóły: `docs/DECISIONS.md`.

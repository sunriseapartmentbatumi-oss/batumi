# SETUP – uruchomienie środowiska i CI/CD (runbook)

Dla: Konrad (konfiguracja), Robert (wiedza, jak to działa). Zasady: D034 (bez wydatków bez zgody), D057 (żadnych sekretów w repozytorium), D068 (produkcja tylko przez merge `main` → `production`).

Konta zakłada Konrad samodzielnie. Agent/automatyzacja nie zakłada kont, nie kupuje domen i nie wdraża na produkcję.

## 0. Najważniejsze ostrzeżenia (stan na 2026-11-24)

| Temat | Fakt | Źródło | Decyzja |
|---|---|---|---|
| Vercel Hobby a użycie komercyjne | Plan Hobby wolno używać „wyłącznie do użytku osobistego lub niekomercyjnego”. Projekt jest na razie hobbystyczny (D062 Accepted); przy komercjalizacji wrócić do decyzji. | https://vercel.com/legal/terms (sekcja Hobby Plan, aktualizacja 2026-10-19) | D062 |
| Vercel Hobby – limity | m.in. 1 mln wywołań funkcji, 100 GB transferu; po przekroczeniu funkcja bywa niedostępna przez 30 dni. | https://vercel.com/docs/plans/hobby, https://vercel.com/docs/limits/fair-use-guidelines | D062 |
| Vercel Cron na Hobby | Tylko 1x dziennie, dokładność ±59 min. Nie używamy crona: wygasanie hold leniwe przez `expires_at` (D063). | https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing | D063 |
| Supabase Free | Pauzowanie projektu po 7 dniach niskiej aktywności; ok. 500 MB bazy, 1 GB plików, 2 aktywne projekty. | https://supabase.com/docs/guides/platform/free-project-pausing, https://supabase.com/pricing | D064 |

Wniosek: projekt jest na razie hobbystyczny, więc darmowe plany wystarczają (D062, D063 Accepted). Przy komercjalizacji wróć do D062 i D064 (pauzowanie Supabase, Open).

## 1. Model środowisk (D068)

| Środowisko | Projekt Vercel | Gałąź | Supabase | Wdrożenie |
|---|---|---|---|---|
| Staging | `sunrise-batumi` (`sunrise-batumi.vercel.app`) | `main` | projekt preview/staging | automatyczne po merge do `main` |
| Production | osobny projekt Vercel (np. `sunrise-batumi-prod`) | `production` | osobny projekt produkcyjny | po merge `main` → `production` (Robert lub Konrad, po jawnym potwierdzeniu w prompcie/czacie, D033) |

Merge do `main` nigdy nie publikuje produkcji. Agenci AI nie mergują do `production`.

## 2. Kroki ręczne Konrada (checklista)

Nic z tego nie robi agent; żadnych kosztów bez zgody Roberta (D034).

GitHub:
- [ ] Settings → Branches → utwórz gałąź `production` z `main` (`git push origin main:production`), jeśli nie istnieje.
- [ ] Settings → Branches → reguła dla `production`: wymagany Pull Request, min. 1 recenzent (Robert/Konrad), wymagane zielone CI, zakaz force-push; opcjonalnie ogranicz, kto może mergować.
- [ ] Ochrona `main`: wymagany PR i zielone CI (zalecane).

Vercel – projekt staging (istniejący):
- [ ] Settings → Environments/Git: Production Branch = `main`.
- [ ] Zmienne środowiskowe (staging) wskazują projekt Supabase staging.
- [ ] Ewentualnie `noindex` zostaje do publikacji.

Vercel – nowy projekt production:
- [ ] Add New → Project → to samo repo `sunriseapartmentbatumi-oss/batumi`.
- [ ] Settings → Environments → Production → Production Branch = `production` (nazwa opcji może się różnić – potwierdź w panelu).
- [ ] Zmienne środowiskowe produkcji wskazują osobny projekt Supabase produkcyjny; oddzielne sekrety i webhooki (README, sekcja Environment).
- [ ] Domena: zostaje `*.vercel.app`; własna domena dopiero za zgodą Roberta (D034, D066).

Supabase:
- [ ] Dwa osobne projekty: staging i production (D065). Klucz `SUPABASE_SERVICE_ROLE_KEY` tylko po stronie serwera (bez `NEXT_PUBLIC_`).

## 3. Ostrzeżenia dot. darmowych planów (stan na 2026-11-24)

| Temat | Fakt | Źródło | Decyzja |
|---|---|---|---|
| Vercel Hobby a użycie komercyjne | Plan Hobby wolno używać „wyłącznie do użytku osobistego lub niekomercyjnego”. Projekt jest na razie hobbystyczny; przy komercjalizacji wrócić do planu/hostingu. | https://vercel.com/legal/terms (sekcja Hobby Plan, aktualizacja 2026-10-19) | D062 |
| Vercel Hobby – limity | m.in. 1 mln wywołań funkcji, 100 GB transferu; po przekroczeniu funkcja bywa niedostępna przez 30 dni. | https://vercel.com/docs/plans/hobby, https://vercel.com/docs/limits/fair-use-guidelines | D062 |
| Vercel Cron na Hobby | Tylko 1x dziennie. Nie używamy crona: wygasanie hold leniwe przez `expires_at`. | https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing | D063 |
| Supabase Free | Pauzowanie po 7 dniach niskiej aktywności; ok. 500 MB bazy, 1 GB plików, 2 aktywne projekty. | https://supabase.com/docs/guides/platform/free-project-pausing, https://supabase.com/pricing | D064 |

Uwaga: Supabase Free pozwala na 2 aktywne projekty na organizację – staging + production mieszczą się dokładnie w limicie.

## 4. CI

`.github/workflows/ci.yml` – przy każdym PR i pushu do `main`: lint, typecheck, test, build. Nie wymaga sekretów i niczego nie wdraża. Wdrożeniami zajmuje się integracja Git Vercel (podgląd PR i staging).

## 5. Publikacja produkcyjna

Wykonuje Robert lub Konrad, po jawnym potwierdzeniu w prompcie/czacie (D033):
1. Otwórz PR `main` → `production` (GitHub → Pull requests → base: `production`, compare: `main`).
2. Recenzent zatwierdza, CI jest zielone, merge.
3. Vercel (projekt production) wdraża automatycznie z gałęzi `production`.
4. Rollback: w Vercel → Deployments → poprzednie wdrożenie → Promote/Instant Rollback, albo revert merge na `production`.

## 6. Lokalnie

```bash
cp .env.example .env.local   # uzupełnij lokalnie
npm install
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck && npm run test && npm run build
```

Wymagany Node.js 20.9+ (CI używa 22).

## 7. Otwarte punkty

D064 (pauzowanie Supabase), D066 (domena). Szczegóły: `docs/DECISIONS.md`.

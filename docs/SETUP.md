# SETUP – uruchomienie środowiska i CI/CD (runbook)

Dla: Konrad (konfiguracja), Robert (wiedza, jak to działa). Zasady: D034 (bez wydatków bez zgody), D057 (żadnych sekretów w repozytorium), D068 (merge do `main` = publikacja, tylko po zatwierdzeniu przez Roberta lub Konrada).

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
| Production | `sunrise-batumi` (`sunrise-batumi.vercel.app`) | `main` | projekt Supabase produkcyjny | automatyczne po merge do `main` = publikacja |
| Staging (Preview) | ten sam projekt `sunrise-batumi` | `staging` | projekt Supabase staging | automatyczne po merge do `staging`; domena `test-sunrise-batumi.vercel.app` |

Jeden projekt Vercel; staging to wdrożenie Preview gałęzi `staging` z przypiętą domeną.

Domyślny przepływ: **wszystkie zmiany idą PR-ami do `staging`**; promocja `staging` → `main` (publikacja) tylko na wyraźne życzenie Roberta lub Konrada. Szczegółowo: zmiany → PR do `staging` → test na stagingu → PR `staging` → `main`, zatwierdzany przez Roberta lub Konrada po jawnym potwierdzeniu w prompcie/czacie (D033). Agenci AI nie mergują do `main`.

## 2. Kroki ręczne Konrada (checklista)

Nic z tego nie robi agent; żadnych kosztów bez zgody Roberta (D034).

GitHub:
- [ ] Po merge tego PR utwórz gałąź `staging` z `main`: `git push origin main:staging` (ustaw ją też jako domyślną gałąź docelową dla nowych PR, jeśli chcesz).
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
| Vercel Cron na Hobby | Tylko 1x dziennie. Nie używamy crona: wygasanie hold leniwe przez `expires_at`. | https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing | D063 |
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

## 7. Otwarte punkty

D064 (pauzowanie Supabase), D066 (domena). Szczegóły: `docs/DECISIONS.md`.

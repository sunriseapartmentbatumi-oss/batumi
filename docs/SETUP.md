# SETUP – uruchomienie środowiska i CI/CD (runbook)

Dla: Konrad (konfiguracja), Robert (wiedza, jak to działa). Zasady: D034 (bez wydatków bez zgody), D057 (żadnych sekretów w repozytorium), D060 (produkcja tylko ręcznie przez GitHub Actions).

Konta zakłada Konrad samodzielnie. Agent/automatyzacja nie zakłada kont, nie kupuje domen i nie wdraża na produkcję.

## 0. Najważniejsze ostrzeżenia (stan na 2026-11-24)

| Temat | Fakt | Źródło | Decyzja |
|---|---|---|---|
| Vercel Hobby a użycie komercyjne | Plan Hobby wolno używać „wyłącznie do użytku osobistego lub niekomercyjnego”. Strona wynajmu jest komercyjna. | https://vercel.com/legal/terms (sekcja Hobby Plan, aktualizacja 2026-10-19) | D062 |
| Vercel Hobby – limity | m.in. 1 mln wywołań funkcji, 100 GB transferu; po przekroczeniu funkcja bywa niedostępna przez 30 dni. | https://vercel.com/docs/plans/hobby, https://vercel.com/docs/limits/fair-use-guidelines | D062 |
| Vercel Cron na Hobby | Tylko 1x dziennie, dokładność ±59 min. Hold 15 min wymaga częstszego wyzwalacza. | https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing | D063 |
| Supabase Free | Pauzowanie projektu po 7 dniach niskiej aktywności; ok. 500 MB bazy, 1 GB plików, 2 aktywne projekty. | https://supabase.com/docs/guides/platform/free-project-pausing, https://supabase.com/pricing | D064 |

Wniosek: darmowe plany nadają się do dev/preview i testów. Przed prawdziwą publikacją komercyjną trzeba rozstrzygnąć D062–D064 (Open).

## 1. Repozytorium i GitHub Environments

1. GitHub → repo → Settings → Environments → **New environment** → `production`.
2. W `production` włącz **Required reviewers** i dodaj Roberta i/lub Konrada. Opcjonalnie ogranicz „Deployment branches” do `main`.
3. Utwórz też Environment `preview` (bez reviewerów) – tylko jeśli chcesz podglądy z GitHub Actions.
4. Settings → Branches: ochrona `main` (wymagany przegląd PR i zielone CI) – zalecane.

## 2. Vercel (darmowe konto, projekt)

1. Załóż konto na https://vercel.com (Konrad). Plan Hobby = tylko test (patrz D062).
2. Add New → Project → zaimportuj repo `sunriseapartmentbatumi-oss/batumi`. Framework: Next.js (wykryje sam).
3. **Wyłącz automatyczne wdrożenie produkcyjne z `main`**: Project → Settings → Environments → Production → Branch Tracking wyłączone (lub Settings → Git → odpowiednik; nazwa opcji może się zmieniać – potwierdź w panelu, D061). Cel: scalenie do `main` nie publikuje strony.
4. Zbierz identyfikatory: `VERCEL_ORG_ID` i `VERCEL_PROJECT_ID` (lokalnie `npx vercel link` tworzy `.vercel/project.json` – ten katalog jest w `.gitignore`, nie commituj go) oraz token: Account Settings → Tokens → `VERCEL_TOKEN`.
5. Zmienne środowiskowe aplikacji (Supabase itd.) wpisz w Vercel → Settings → Environment Variables (osobno Preview i Production).

## 3. Sekrety GitHub

GitHub → Settings → Environments → `production` → Environment secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Opcjonalnie te same trzy w Environment `preview`. Nigdy w kodzie, README, czacie ani PR.

## 4. Supabase (darmowe konta/projekty)

1. https://supabase.com → New project, **dwa osobne projekty**: `batumi-preview` i `batumi-prod` (D065). Region bliski użytkownikom (decyzja Konrada).
2. Z Project Settings → API skopiuj URL i klucze do Vercel (Preview / Production) oraz lokalnie do `.env.local` (wzór: `.env.example`).
3. `SUPABASE_SERVICE_ROLE_KEY` jest tajny – tylko po stronie serwera, nigdy z prefiksem `NEXT_PUBLIC_`.
4. Free pauzuje się po 7 dniach bez aktywności – projekt można wznowić w panelu (D064). Migracje: katalog `supabase/migrations` (na razie pusty).

## 5. Domena

- Start: darmowa subdomena `<projekt>.vercel.app` (Project → Settings → Domains). Zero kosztu.
- Własna domena = zakup (D034, D066) – tylko za zgodą Roberta. Po zakupie: dodaj w Vercel → Domains i ustaw rekordy DNS wg podpowiedzi Vercel.
- Darmowe domeny od zewnętrznych dostawców (darmowe TLD) są niestabilne i mogą mieć gorszą reputację w SEO/e-mailach – traktuj tylko jako notatkę, nie rekomendację.
- Do czasu wyboru domeny strona ma `noindex` (zob. `src/app/layout.tsx`); usuń to dopiero przy zatwierdzonej publikacji.

## 6. CI (automatyczne)

`.github/workflows/ci.yml` – przy każdym PR i pushu do `main`: lint, typecheck, test, build. Nie wymaga sekretów. Nie wdraża niczego.

## 7. Podgląd PR (opcjonalny)

`.github/workflows/deploy-preview.yml` – wdraża podgląd tylko gdy w Environment `preview` są sekrety Vercel; bez nich krok jest pomijany. Jeśli używasz integracji Git Vercel do podglądów, wyłącz ten workflow (Actions → Deploy preview → Disable workflow).

## 8. Wdrożenie produkcyjne (ręczne)

Wykonuje Robert lub Konrad, po jawnym potwierdzeniu w prompcie/czacie (D033):
1. GitHub → Actions → **Deploy production** → Run workflow, gałąź `main`.
2. W polu `confirm` wpisz `PUBLISH`.
3. Wskazany reviewer zatwierdza wdrożenie w Environment `production`.
4. Workflow sprawdza sekrety (czytelny błąd, gdy ich brak), uruchamia lint/typecheck/test i wdraża przez Vercel CLI.

Scalenie do `main` samo w sobie **nie** wdraża na produkcję. Agenci nigdy nie uruchamiają tego workflow samodzielnie.

## 9. Lokalnie

```bash
cp .env.example .env.local   # uzupełnij lokalnie
npm install
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck && npm run test && npm run build
```

Wymagany Node.js 20.9+ (CI używa 22).

## 10. Otwarte punkty

D061 (integracja Actions ↔ Vercel, wyłączenie auto-deploy), D062 (Hobby vs komercja), D063 (cron), D064 (pauzowanie Supabase), D065 (osobne projekty), D066 (domena). Szczegóły: `docs/DECISIONS.md`.

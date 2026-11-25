# CLAUDE.md – kontekst projektu dla agentów AI

Dotyczy dowolnego agenta (Claude Code, Claude w przeglądarce, inne). Repo jest agent-agnostyczne; `AGENTS.md` wskazuje ten plik.

## Projekt
Polskojęzyczny serwis jednego apartamentu w Batumi (okolice bulwaru Lecha i Marii Kaczyńskich): strona oferty/SEO, przewodnik, formularz rezerwacji z blokadą terminu (bez płatności online), panel `/admin`. Stack: Next.js 15 (App Router) + TypeScript, Vercel, Supabase (Postgres/Auth/RLS), Resend (powiadomienie e-mail dla właściciela; maile do gości niezaimplementowane, wymagają własnej domeny – D077/D078), Vitest. Projekt hobbystyczny (D062).

Role: **Robert** – właściciel obiektu, decyzje biznesowe, dane oferty, zgoda na publikację. **Konrad** – właściciel techniczny (konta, środowiska, narzędzia).

## Zasady pracy (obowiązkowe)
1. Język: polski (dokumenty, UI, komunikaty). Kod i identyfikatory po angielsku.
2. **Nie wymyślaj faktów** o apartamencie (adres, ceny, metraż, widok, odległości, wyposażenie, opinie). Brakujące dane = `[DO POTWIERDZENIA]` (D028–D032), trzymane w jednym miejscu: `src/lib/site.ts`. Rejestr: `docs/stage-0/rejestr_faktow.csv`.
3. Nie aktywuj reguł biznesowych oznaczonych `Open` w `docs/DECISIONS.md` (neutralne domyślne: min. pobyt 1, opłaty 0, brak cen).
4. **D033/D034:** agent nigdy sam nie publikuje na produkcję, nie zakłada kont, nie kupuje domen, nie wydaje pieniędzy, nie pisze do gości. Publikacja = merge `staging` → `main`, tylko po jawnym potwierdzeniu Roberta lub Konrada w rozmowie. Agent nie merguje PR-ów.
5. Sekrety nigdy w repo (D057); `.env.local` lokalnie. `SUPABASE_SERVICE_ROLE_KEY` tylko serwer. PII gości nie trafia do logów.
6. Przepływ: nowa gałąź od `staging` → PR do `staging` (D068, D075). Zmiany schematu = **nowy** plik w `supabase/migrations` (nie edytuj istniejących); migracje stosuje człowiek ręcznie (D072).
7. Przed PR: `npm run lint && npm run typecheck && npm run test && npm run build`.
8. Zmiana decyzji/architektury = aktualizacja `docs/DECISIONS.md` (nowe ID od D084; istniejących nie zmieniaj).

## Mapa dokumentów (hierarchia)
`docs/PRODUCT.md` → `docs/REQUIREMENTS.md` → `docs/ARCHITECTURE.md` → `docs/DATA-MODEL.md` → `docs/DECISIONS.md`. Operacyjne: `docs/SETUP.md` (runbook środowisk, migracje, admin), `docs/PROCESS.md`, `docs/SEO-CONTENT.md`, `docs/HANDOVER.md` (jak Robert pracuje z Claude), `docs/stage-0/` (pytania do Roberta, rejestr faktów, ryzyka).

## Stan (2026-11-24)
- Środowiska (D068): jeden projekt Vercel; `main` = Production (`sunrise-batumi.vercel.app`), `staging` = Preview (`test-sunrise-batumi.vercel.app`); dwa projekty Supabase (staging/production). Wygasanie hold leniwe (D063); jedyny cron to dzienne przypomnienia o zameldowaniu (D083, tylko Production). CI: `.github/workflows/ci.yml`.
- Zrobione: strona z treściami ogólnymi, `/rezerwacja`, sitemap/robots, panel `/admin` (apartament, rezerwacje, blokady), `/admin/diagnostyka`, trzy migracje (`initial_schema`, `create_reservation_rpc`, `bootstrap_admin`), RPC `create_pending_reservation(..., p_hold_minutes)`, logi `[db-error]`/`[validation-error]`/`[action-error]`/`[config-error]`.
- Niezrobione: płatności (D011 Open), ceny/opłaty, treści z potwierdzonych faktów, zdjęcia, analityka + zgoda cookies, polityki prawne, własna domena.

## Następne kroki
1. Robert odpowiada na `docs/stage-0/pytania_do_wlasciciela.md` (część A); odpowiedzi → `rejestr_faktow.csv`, `src/lib/site.ts`, `docs/DECISIONS.md`.
2. Uzupełnić apartament w `/admin` na stagingu; przetestować rezerwację end-to-end.
3. Konrad: potwierdzić ochronę gałęzi (D076), migracje na produkcji, zmienne środowiskowe (`docs/SETUP.md` §6d).
4. Kolejne fazy wg `docs/PRODUCT.md` po zamknięciu decyzji Open.

# Jak Robert kontynuuje pracę z Claude

Nie zakładamy dostępu do GitHub Copilot ani do wcześniejszych sesji – całą wiedzę zawiera repozytorium.

## 1. Start sesji
- **Claude Code** (terminal): `git clone` repo, `cd`, `npm install`, `cp .env.example .env.local` (wartości od Konrada), uruchom `claude`. Claude sam wczyta `CLAUDE.md`.
- **Claude w przeglądarce**: dołącz repo/pliki lub wklej `CLAUDE.md` i `docs/DECISIONS.md` na początku rozmowy.
- Pierwsza wiadomość, np.: „Przeczytaj CLAUDE.md i docs/DECISIONS.md, podsumuj stan projektu i następne kroki.”

## 2. Co przeczytać najpierw
`CLAUDE.md` → `README.md` → `docs/DECISIONS.md` (co ustalone, co `Open`) → `docs/stage-0/pytania_do_wlasciciela.md` (Twoja część A).

## 3. Odpowiedzi na listę pytań
Wklej Claude odpowiedzi przy numerach pytań (np. „6. Cena: … PLN za noc”). Poproś: „Zaktualizuj `rejestr_faktow.csv` (status potwierdzone, źródło, data), `src/lib/site.ts` i `docs/DECISIONS.md`, zrób PR do `staging`.” Dane faktów podawaj sam – Claude ma nie zgadywać; brak odpowiedzi zostaje `[DO POTWIERDZENIA]`.

## 4. Zmiany krok po kroku
1. Claude pracuje na gałęzi od `staging` i otwiera PR do `staging` (D075).
2. Poczekaj na zielone CI, sprawdź efekt na `https://test-sunrise-batumi.vercel.app`.
3. PR merguje człowiek (Ty lub Konrad) w GitHub – repo nie ma auto-merge.
4. Zmiany schematu bazy: Claude dodaje nowy plik migracji; Ty/Konrad wklejacie go w Supabase → SQL Editor (najpierw staging) – `docs/SETUP.md` §6a.

## 5. Zatwierdzanie publikacji (produkcja)
Publikacja = PR `staging` → `main`. Powiedz wprost w rozmowie z Claude: „Zatwierdzam publikację na produkcję (Robert)” i zmerguj PR w GitHub. Claude sam nigdy nie merguje ani nie publikuje (D033). Własna domena, płatne plany i konta – tylko po Twojej zgodzie (D034).

Gość widzi potwierdzenie z numerem rezerwacji i może sprawdzić status na `/rezerwacja/status` (numer + e-mail). Ceny i zasady to nadal `[DO POTWIERDZENIA]`.

W panelu `/admin`: pulpit (liczniki, najbliższe przyjazdy/wyjazdy), Rezerwacje (filtry, szczegóły, „Pobierz CSV”), Kalendarz (rezerwacje i blokady).

## 6. Powiadomienia e-mail
Nowa rezerwacja wysyła mail do właściciela przez Resend (konfiguracja: `docs/SETUP.md` §6e). Na razie dochodzi tylko na adres konta Resend; maile do gości wymagają własnej domeny (pytanie 23). Jeśli maila nie ma: spam, zakładka Emails w Resend, `/admin/diagnostyka`.

## 7. Gdy coś nie działa
Zaloguj się do `/admin/diagnostyka` na danym środowisku; błędy szczegółowe: Vercel → Logs, szukaj `[db-error]`. Konfiguracja środowisk i admina: `docs/SETUP.md`.

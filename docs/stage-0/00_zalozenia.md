# 00 – Założenia (Etap 0, szkic do bramki GPT-0)

Dokument roboczy, nienormatywny. Wszystkie dane konkretne: `[DO POTWIERDZENIA]`.

## 1. Cel
Polskojęzyczny serwis jednego apartamentu w Batumi (okolica bulwaru Lecha i Marii Kaczyńskich – wg briefu), z przewodnikiem turystycznym, SEO i procesem zapytań/rezerwacji (`../PRODUCT.md`).

## 2. Zakres Etapu 0
Analiza briefu i materiałów, domeny, hostingu, konkurentów i istniejących rezerwacji; lista braków BLOKUJE/WAŻNE/OPCJONALNE; dokumenty: ten plik, `rejestr_faktow.csv`, `pytania_do_wlasciciela.md`, `ryzyka.md`, `plan_etapow.md`. Bez kompletu krytycznych danych nie powstają ostateczne twierdzenia sprzedażowe.

## 3. Ocena kompletności briefu
| Obszar | Stan |
|---|---|
| Dane o apartamencie | brak – `rejestr_faktow.csv` |
| Cennik i zasady | brak (D012–D021) |
| Kanał sprzedaży | nieustalony (D037) |
| Domena / hosting | nieustalone (D050) |
| Materiały (zdjęcia, opinie) | nieustalone; prawa do użycia (D052) |
| Istniejące rezerwacje | nieustalone |
| Konkurenci | do zbadania w Etapie 1 |
| Aspekty prawne/podatkowe (GE/PL) | nieustalone (D047, D049) |

## 4. Założenia robocze (do potwierdzenia na GPT-0)
- Faza A (treści/SEO) przed Fazą C (rezerwacje), w jednej aplikacji Next.js (D025, D026).
- Do czasu decyzji D037 kontakt przez telefon, WhatsApp i formularz (D038).
- Brak publikacji, zakupów i wiadomości do gości bez zgody (D033, D034).

## 5. Narzędzia i ograniczenia
| Obszar | Stan |
|---|---|
| Narzędzia SEO (wolumeny, trudność) | `[DO POTWIERDZENIA]` – bez narzędzia metryki oznaczane „do weryfikacji” |
| Dostęp do Search Console / GA4 / domeny | `[DO POTWIERDZENIA]` |
| Dostęp do kalendarzy i rezerwacji | `[DO POTWIERDZENIA]` |
| Środowisko | repozytorium GitHub, Vercel Preview, Supabase (konta wg decyzji D050) |
| Ograniczenia | brak zakupów, wydatków i publikacji produkcyjnej bez jawnego potwierdzenia Roberta lub Konrada |

## 6. Bramka GPT-0
Przekazać: ten plik, rejestr faktów, pytania, ryzyka, plan etapów. Czekać na zatwierdzenie zakresu i kolejności.

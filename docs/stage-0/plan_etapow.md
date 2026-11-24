# Plan etapów z bramkami (propozycja do GPT-0)

Terminy: `[DO POTWIERDZENIA]` – ustalane z właścicielem po bramce GPT-0. Szczegóły procesu: `../PROCESS.md`.

| Etap | Faza | Zakres | Wyniki | Bramka | Warunek startu | Termin |
|---|---|---|---|---|---|---|
| 0 Discovery | A | brief, materiały, braki | pliki w `stage-0/` | GPT-0 | – | [DO POTWIERDZENIA] |
| 1 Research SEO | A | intencje, klastry, 8–12 konkurentów | `analiza_rynku.md`, `keyword_map.csv`, `konkurencja.csv`, `content_gap.md` | GPT-1 | akceptacja GPT-0 | [DO POTWIERDZENIA] |
| 2 Strategia/UX | A | mapa witryny, specyfikacje stron, makiety, kanał sprzedaży | spec stron | GPT-2 | akceptacja GPT-1, D037 | [DO POTWIERDZENIA] |
| 3 Treści | A | plan 20–30 tematów, 5 szkiców, FAQ | treści + źródła | GPT-3 | akceptacja GPT-2, dane właściciela | [DO POTWIERDZENIA] |
| 4 Implementacja | A/B | Next.js, SEO techniczne, a11y, analityka, zgoda cookies, formularz | PR-y, pomiary | review + raport | akceptacja GPT-3, D027 | [DO POTWIERDZENIA] |
| 5 Testy i publikacja | A/B | testy, rollback, backup, monitoring | raport testów | pisemna zgoda właściciela | etap 4 | [DO POTWIERDZENIA] |
| Po starcie | A/B | 30/60/90 dni: Search Console, CTR, zapytania | przeglądy | – | publikacja | +30/60/90 dni |
| Faza C | C | rezerwacje bezpośrednie wg `../REQUIREMENTS.md` §2–§10 | moduł rezerwacji | wg §11 | D011–D021, D037, D048 | [DO POTWIERDZENIA] |

Po każdym etapie: ZIP dla ChatGPT + PDF dla właściciela; raport kończy się `STATUS / DOWODY / PROBLEMY / DECYZJE DO GPT / DECYZJE DO WŁAŚCICIELA / NASTĘPNY ETAP`.

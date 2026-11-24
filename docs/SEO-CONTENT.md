# Batumi – SEO-CONTENT

Dokument operacyjny pod `REQUIREMENTS.md` §16–§20. Zawiera mapę witryny, szablon specyfikacji stron, metodologię research, plan redakcyjny, zasady przewodnika i specyfikację pomiarów. **Nie zawiera żadnych faktów o apartamencie** – wszystkie dane konkretne to `[DO POTWIERDZENIA]` do czasu wpisu `potwierdzone` w `stage-0/rejestr_faktow.csv`.

## 1. Cel i ścieżka użytkownika
Google → odpowiednia podstrona → wiarygodna oferta → sprawdzenie terminu/ceny → kontakt lub rezerwacja. Kanał sprzedaży: D037 (Open); do rozstrzygnięcia obsługujemy telefon, WhatsApp i formularz (D038).

## 2. Mapa witryny (propozycja do GPT-2)
| URL | Rola | Faza | Warunek |
|---|---|---|---|
| `/` | Strona główna, propozycja wartości, CTA | A | – |
| `/apartament` | Opis, udogodnienia, zasady | A | fakty `potwierdzone` |
| `/galeria` | Zdjęcia | A | prawa do zdjęć (D052) |
| `/lokalizacja` | Lokalizacja, mapa, trasa piesza | A | weryfikacja mapy i trasy; bez założeń o widoku/plaży (D031) |
| `/cennik-i-dostepnosc` | Ceny i terminy | A/C | tylko przy aktualizowanych danych/żywym kalendarzu (D032, D051) |
| `/kontakt` | Telefon, WhatsApp, formularz | B | dane kontaktowe od właściciela |
| `/przewodnik` | Hub przewodnika | A | – |
| `/przewodnik/atrakcje-batumi` | Atrakcje | A | źródła + daty |
| `/przewodnik/batumi-z-dziecmi` | Rodziny | A | źródła + daty |
| `/przewodnik/dojazd-do-batumi` | Dojazd | A | weryfikacja aktualności |
| `/faq` | Odpowiedzi na pytania gości | A | dane właściciela; FAQPage tylko jeśli zasadne |
| `/polityka-prywatnosci` | Prywatność i cookies | B | jurysdykcja D049 |
| `/regulamin` | Warunki rezerwacji | C | D013, D049 |

Strony bez wartości usuwamy; dodatkowe z planu redakcyjnego (§6) powstają w `/przewodnik/*`.

## 3. Specyfikacja każdej podstrony (szablon)
| Pole | Opis |
|---|---|
| URL / faza | |
| Intencja | transakcyjna / informacyjna / nawigacyjna |
| Główna fraza (+ poboczne) | ze `keyword_map.csv`; wolumen „do weryfikacji” bez narzędzia |
| Title / Meta description | unikalne, bez upychania |
| H1; struktura H2/H3 | |
| CTA | telefon / WhatsApp / formularz / rezerwacja |
| Linki wewnętrzne | |
| Wymagane zdjęcia | z opisem alt; prawa do użycia |
| Źródła | URL, data dostępu, wiarygodność |
| Fakty użyte (ID z rejestru) | tylko `potwierdzone` |
| Data aktualizacji treści | |
| Dane strukturalne | tylko jeśli zgodne z zawartością (D058) |

## 4. Zasady treści
Po polsku, naturalnie, konkretnie. Wyróżnik: polski właściciel, realne informacje o apartamencie, lokalna użyteczność. Bez „luksusowy raj”, bez fikcyjnych opinii. Ceny, godziny i warunki atrakcji weryfikowane na stronach oficjalnych, z datą aktualizacji. Treści o apartamencie z `[DO POTWIERDZENIA]` nie przechodzą bramki publikacji. Nie kopiować tekstów konkurencji.

Pytania gości, na które odpowiadamy (dane od właściciela): co obejmuje cena, odbiór kluczy, transfer, parking, internet, wyposażenie, sprzątanie, zasady anulacji, płatność, język obsługi.

## 5. Metodologia research (Etap 1)
1. **Intencje** (hipotezy startowe, nie zweryfikowana lista): apartament Batumi, noclegi Batumi, Batumi apartament przy plaży, Batumi z dziećmi, co zobaczyć w Batumi, atrakcje Batumi, pogoda/sezon, dojazd, wycieczki, jedzenie, praktyczne porady.
2. **Mapa tematów i klastrów**; rozdzielenie fraz transakcyjnych i informacyjnych.
3. **Metryki** (wolumen, trudność, sezonowość): tylko z podaniem narzędzia, kraju, daty i ograniczeń; w przeciwnym razie „do weryfikacji”.
4. **Konkurencja**: min. 8–12 podmiotów (niezależne strony i portale rezerwacyjne) – architektura, unikalne treści, słabe punkty, wiarygodność.
5. **Priorytety**: szybkie wygrane, filary długoterminowe, tematy wymagające doświadczeń lokalnych.
6. **Wyniki**: `analiza_rynku.md`, `keyword_map.csv`, `konkurencja.csv`, `content_gap.md` (w pakiecie Etapu 1; zatwierdza GPT-1).

Kolumny `keyword_map.csv`: fraza, klaster, intencja, strona docelowa, wolumen, narzędzie, kraj, data, trudność, sezonowość, status weryfikacji, uwagi. Kolumny `konkurencja.csv`: domena, typ, architektura, unikalne treści, słabe punkty, wiarygodność, data przeglądu.

## 6. Plan redakcyjny (Etap 3)
20–30 tematów; kolumny: temat, intencja, wartość dla czytelnika, unikalność, koszt opracowania, priorytet, wymagane źródła/dane lokalne, status. Najpierw 5 najlepszych szkiców do akceptacji GPT/właściciela. Zakres tematyczny: atrakcje Batumi i okolic, plaże, promenada, komunikacja, restauracje, rodzinne aktywności, sezonowość, wycieczki po Adżarii, praktyczne kwestie podróży.

## 7. Cytowanie źródeł
Wpis źródła: tytuł, URL, data dostępu, typ (oficjalne / media / blog / konkurent), ocena wiarygodności, uwagi. Informacje o transporcie, wjazdach i atrakcjach mają datę weryfikacji i okres, po którym wymagają przeglądu.

## 8. SEO techniczne (checklista)
sitemap.xml, robots.txt, canonical, breadcrumbs, Open Graph, poprawne 404 i przekierowania, semantyczny HTML, obrazy WebP/AVIF, `srcset`, lazy loading poza hero, cache, `noindex` na środowiskach nieprodukcyjnych, dane strukturalne zgodne z zawartością (Organization/Person, BreadcrumbList; FAQPage tylko jeśli zasadne; bez fałszywych ocen). Wymagania jakości i a11y: `REQUIREMENTS.md` §18–§19.

## 9. Pomiar
| Zdarzenie | Wyzwalacz | Warunek |
|---|---|---|
| `click_phone` | klik w link telefoniczny | zgoda cookies |
| `click_whatsapp` | klik w link WhatsApp | zgoda cookies |
| `submit_contact_form` | poprawne wysłanie formularza | zgoda cookies |
| `begin_booking` | start procesu rezerwacji | Faza C, zgoda cookies |
| `booking_confirmed` | `CONFIRMED` po webhooku | Faza C, jeśli technicznie możliwe |

Parametry bez PII. GA4 i Search Console konfigurowane po publikacji za zgodą właściciela; polityka prywatności i baner zgody przed włączeniem analityki.

## 10. Test matrix (skrót)
3 szerokości ekranu; Chrome/Safari/Firefox mobilnie i desktopowo (lista końcowa w Etapie 5); formularze; linki; indeksowanie i meta; przekierowania; a11y WCAG 2.2 AA; obrazy; błędy konsoli i sieci; bez JS dla treści i nawigacji; LCP/INP/CLS (cele orientacyjne ≤2,5 s / ≤200 ms / ≤0,1).

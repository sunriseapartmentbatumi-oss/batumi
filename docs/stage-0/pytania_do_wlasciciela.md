# Pytania Etapu 0 – Robert (obiekt i rezerwacje) oraz Konrad (technika)

Priorytety: **BLOKUJE** – bez odpowiedzi nie ma ostatecznych twierdzeń/publikacji; **WAŻNE** – wpływa na jakość lub kolejny etap; **OPCJONALNE**. Odpowiedzi Roberta wpisz do `rejestr_faktow.csv` (status `potwierdzone`, źródło, data) i, jeśli to decyzja, do `../DECISIONS.md`.

Podział (D056): **Część A – Robert** (właściciel obiektu: oferta, ceny, zasady, kanał sprzedaży, kontakt, prawo, zdjęcia, opinie, lokalne wskazówki, źródła kalendarza). **Część B – Konrad** (konfiguracja techniczna). Stack Next.js/Vercel/Supabase potwierdzony przez Konrada 2026-11-24 (D027) – pytanie zamknięte.

# Część A – pytania do Roberta

## BLOKUJE
1. Nazwa handlowa i podmiot prawny prowadzący wynajem (D047, F001–F002).
2. Dokładny adres/pinezka apartamentu; piętro, dostęp (F003–F004).
3. Widok z okien oraz rzeczywista odległość/trasa do morza i plaży – nic nie zakładamy (D031, F005–F008).
4. Maksymalna liczba gości, układ, łóżka, wyposażenie (D019, F010–F012).
5. Check-in/check-out i zasady odbioru kluczy (D020).
6. Ceny (PLN) i okresy; opłaty dodatkowe; podatki lokalne (D008, D015, D016, D018, D047).
7. Preferowany kanał sprzedaży: bezpośrednia rezerwacja online, formularz, WhatsApp, telefon, zewnętrzny silnik; jak dziś przyjmujesz rezerwacje (D037).
8. Dane kontaktowe do publikacji: telefon, WhatsApp, e-mail, godziny odpowiedzi.
9. Jurysdykcja regulaminu i polityki prywatności (PL/GE/UE) oraz kto jest administratorem danych (D049).
10. Zdjęcia: materiały i prawa do ich publikacji (D052).

## WAŻNE
11. Źródło prawdy kalendarza i istniejące rezerwacje (Airbnb/Booking/własne); czy podawać dostępność online (D032, D051).
12. Zasady anulacji/zwrotów, zaliczka vs pełna płatność, minimum stay (D012–D014).
13. Zwierzęta, dzieci, udogodnienia dla rodzin (D021).
14. Transfer, parking, internet, sprzątanie, język obsługi (F013–F022).
15. Istniejące opinie gości i zgoda na ich użycie; brak fikcyjnych opinii.
16. Doświadczenia lokalne do przewodnika (miejsca, które polecasz) – do zweryfikowania w źródłach.
17. Retencja danych gości i zapytań (D022, D053) – decyzja biznesowa; technikę wdroży Konrad.
18. Konto firmowe/rozliczenia płatności w PLN dla obiektu w Gruzji – informacje o podmiocie (D048, wspólnie z Konradem, patrz B2).

## OPCJONALNE
19. Inne wersje językowe (D045).
20. Waluty informacyjne oprócz PLN (D046).
21. Materiały marki (logo, kolory, ton komunikacji).
22. Preferowany język i długość raportów PDF.

## Zamknięte
- ~~Potwierdzenie stacku Next.js/Vercel/Supabase~~ – potwierdził Konrad, 2026-11-24 (D027).
- ~~Tryb publikacji~~ – publikację robi Robert lub Konrad, potwierdzenie promptem, technicznie GitHub Actions (D033, D060).

# Część B – pytania/zadania techniczne Konrada

## BLOKUJE (przed Etapem 4)
B1. Domena: posiadana czy do zakupu, rejestrator, DNS; zakup tylko po jawnym potwierdzeniu (D034, D050).
B2. Operator płatności: Stripe vs Przelewy24 – kwestie techniczne (waluta PLN dla obiektu w Gruzji, wymagania konta, webhooki) – przed Fazą C (D011, D048).
B3. Wdrożenie przez GitHub Actions: workflow `workflow_dispatch` / Environment `production` z reviewerem, integracja z Vercel i wyłączenie auto-deployu z `main` (D060, D061).

## WAŻNE
B4. Dostęp do Search Console i GA4 (właściciel konta, weryfikacja domeny) – konfiguracja po publikacji (D043).
B5. Hosting i konta usług: Vercel, Supabase (Preview vs Production), Resend; sekrety poza repozytorium (D050, D057).
B6. Prosty runbook dla Roberta: uruchomienie, edycja treści, podgląd, rollback (D059).
B7. Ochrona antyspamowa formularza i monitoring (REQUIREMENTS §18, §21).
B8. Dostęp do narzędzi SEO (wolumeny, trudność) lub decyzja, że metryki pozostają „do weryfikacji” (SEO-CONTENT §5).

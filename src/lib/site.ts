export const TBC = "[DO POTWIERDZENIA]";

export const siteConfig = {
  name: "Apartament w Batumi",
  locale: "pl",
} as const;

// Treści ogólne. Wszystko konkretne czeka na odpowiedzi Roberta (D028–D032) – podmieniaj tylko tutaj.
export const content = {
  about: {
    title: "O apartamencie",
    text: "Apartament do wynajmu krótkoterminowego w Batumi. Szczegóły obiektu zostaną uzupełnione po potwierdzeniu przez właściciela.",
    details: [
      { label: "Metraż", value: TBC },
      { label: "Liczba osób", value: TBC },
      { label: "Piętro i widok", value: TBC },
    ],
  },
  location: {
    title: "Lokalizacja",
    text: "Apartament znajduje się w okolicy bulwaru Lecha i Marii Kaczyńskich w Batumi. Dokładny adres, odległości i czasy dojścia będą podane po weryfikacji.",
    details: [
      { label: "Adres", value: TBC },
      { label: "Odległość od morza i atrakcji", value: TBC },
    ],
  },
  amenities: {
    title: "Udogodnienia",
    text: "Lista wyposażenia pojawi się po potwierdzeniu przez właściciela.",
    items: [TBC],
  },
  contact: {
    title: "Kontakt",
    text: "Dane kontaktowe i sposób rezerwacji zostaną podane wkrótce.",
    details: [
      { label: "Telefon / WhatsApp", value: TBC },
      { label: "E-mail", value: TBC },
      { label: "Ceny i dostępność", value: TBC },
    ],
  },
} as const;

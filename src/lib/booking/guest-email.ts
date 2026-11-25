import { TBC } from "@/lib/site";

export type GuestEmailInput = {
  reference: string;
  firstName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  holdExpiresAtLabel: string;
  statusUrl: string | null;
};

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Wysyłka do gości działa tylko po jawnym włączeniu i z nadawcą z własnej domeny (onboarding@resend.dev dostarcza wyłącznie na adres konta Resend).
export function guestEmailEnabled(env: Record<string, string | undefined>): boolean {
  if (env.GUEST_EMAIL_ENABLED !== "true") return false;
  const from = env.BOOKING_FROM_EMAIL;
  if (!env.RESEND_API_KEY || !from) return false;
  const domain = /@([^>\s]+)>?\s*$/.exec(from)?.[1]?.toLowerCase();
  return Boolean(domain) && domain !== "resend.dev" && !domain!.endsWith(".resend.dev");
}

export function buildGuestEmail(i: GuestEmailInput): { subject: string; text: string; html: string } {
  const subject = `Zgłoszenie rezerwacji ${i.reference} – oczekuje na potwierdzenie`;
  const lines = [
    `Dzień dobry ${i.firstName},`,
    "",
    "dziękujemy za zgłoszenie rezerwacji apartamentu w Batumi. Zgłoszenie oczekuje na potwierdzenie przez właściciela – to jeszcze nie jest potwierdzona rezerwacja.",
    "",
    `Numer referencyjny: ${i.reference}`,
    "Status: oczekuje na potwierdzenie",
    `Termin: ${i.checkIn} – ${i.checkOut}`,
    `Liczba osób: dorośli ${i.adults}, dzieci ${i.children}`,
    `Termin jest wstępnie zablokowany do: ${i.holdExpiresAtLabel}`,
    `Cena, opłaty i zasady pobytu: ${TBC}`,
    ...(i.statusUrl ? ["", `Sprawdź status rezerwacji (numer + Twój e-mail): ${i.statusUrl}`] : []),
    "",
    `Kontakt: ${TBC}`,
  ];
  const text = lines.join("\n");
  const e = escapeHtml;
  const html =
    `<p>Dzień dobry ${e(i.firstName)},</p>` +
    "<p>dziękujemy za zgłoszenie rezerwacji apartamentu w Batumi. Zgłoszenie oczekuje na potwierdzenie przez właściciela – to jeszcze nie jest potwierdzona rezerwacja.</p>" +
    `<ul><li>Numer referencyjny: <strong>${e(i.reference)}</strong></li>` +
    "<li>Status: oczekuje na potwierdzenie</li>" +
    `<li>Termin: ${e(i.checkIn)} – ${e(i.checkOut)}</li>` +
    `<li>Liczba osób: dorośli ${i.adults}, dzieci ${i.children}</li>` +
    `<li>Termin jest wstępnie zablokowany do: ${e(i.holdExpiresAtLabel)}</li>` +
    `<li>Cena, opłaty i zasady pobytu: ${e(TBC)}</li></ul>` +
    (i.statusUrl ? `<p><a href="${e(i.statusUrl)}">Sprawdź status rezerwacji</a> (numer + Twój e-mail)</p>` : "") +
    `<p>Kontakt: ${e(TBC)}</p>`;
  return { subject, text, html };
}

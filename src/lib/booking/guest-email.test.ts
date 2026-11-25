import { describe, expect, it } from "vitest";
import { buildGuestEmail, escapeHtml, guestEmailEnabled } from "./guest-email";

const env = { GUEST_EMAIL_ENABLED: "true", RESEND_API_KEY: "k", BOOKING_FROM_EMAIL: "Sunrise <rezerwacje@example.pl>" };

describe("guestEmailEnabled", () => {
  it("działa tylko z flagą i własną domeną", () => {
    expect(guestEmailEnabled(env)).toBe(true);
    expect(guestEmailEnabled({ ...env, GUEST_EMAIL_ENABLED: undefined })).toBe(false);
    expect(guestEmailEnabled({ ...env, GUEST_EMAIL_ENABLED: "1" })).toBe(false);
    expect(guestEmailEnabled({ ...env, BOOKING_FROM_EMAIL: "Sunrise <onboarding@resend.dev>" })).toBe(false);
    expect(guestEmailEnabled({ ...env, BOOKING_FROM_EMAIL: "rezerwacje@example.pl" })).toBe(true);
    expect(guestEmailEnabled({ ...env, RESEND_API_KEY: undefined })).toBe(false);
    expect(guestEmailEnabled({ ...env, BOOKING_FROM_EMAIL: undefined })).toBe(false);
  });
});

describe("buildGuestEmail", () => {
  const base = { reference: "BAT-ABCD2345", firstName: "Jan", checkIn: "2099-03-01", checkOut: "2099-03-04", adults: 2, children: 1, holdExpiresAtLabel: "01.03, 12:00", statusUrl: "https://x.pl/rezerwacja/status" };
  it("zawiera kluczowe dane, status i markery", () => {
    const m = buildGuestEmail(base);
    for (const part of ["BAT-ABCD2345", "oczekuje na potwierdzenie", "2099-03-01", "https://x.pl/rezerwacja/status", "[DO POTWIERDZENIA]"]) {
      expect(m.text).toContain(part);
      expect(m.html).toContain(part);
    }
  });
  it("escapuje dane gościa w HTML", () => {
    const m = buildGuestEmail({ ...base, firstName: '<script>alert("x")</script>' });
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain("&lt;script&gt;");
    expect(escapeHtml(`a&b'"`)).toBe("a&amp;b&#39;&quot;");
  });
  it("pomija link gdy brak adresu aplikacji", () => {
    expect(buildGuestEmail({ ...base, statusUrl: null }).html).not.toContain("<a ");
  });
});

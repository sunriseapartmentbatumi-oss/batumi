"use client";
import { useActionState } from "react";
import { submitBooking, type BookingState } from "./actions";
import { TBC } from "@/lib/site";

const initial: BookingState = {};

export function BookingForm() {
  const [state, action, pending] = useActionState(submitBooking, initial);
  if (state.ok) {
    return (
      <p role="status">
        Dziękujemy! Zgłoszenie <strong>{state.reference}</strong> zostało zapisane, termin jest wstępnie zablokowany na 15 minut.
        Potwierdzenie i dalsze kroki: {TBC}.
      </p>
    );
  }
  const err = (k: string) => (state.fieldErrors?.[k] ? <small role="alert"> {state.fieldErrors[k]}</small> : null);
  return (
    <form action={action} style={{ display: "grid", gap: "0.75rem" }}>
      {state.error && <p role="alert">{state.error}</p>}
      <label>Przyjazd <input type="date" name="check_in" required />{err("check_in")}</label>
      <label>Wyjazd <input type="date" name="check_out" required />{err("check_out")}</label>
      <label>Dorośli <input type="number" name="adults" min={1} defaultValue={2} required />{err("adults")}</label>
      <label>Dzieci <input type="number" name="children" min={0} defaultValue={0} />{err("children")}</label>
      <label>Imię <input name="first_name" required autoComplete="given-name" />{err("first_name")}</label>
      <label>Nazwisko <input name="last_name" required autoComplete="family-name" />{err("last_name")}</label>
      <label>E-mail <input type="email" name="email" required autoComplete="email" />{err("email")}</label>
      <label>Telefon <input type="tel" name="phone" required autoComplete="tel" />{err("phone")}</label>
      <label>Wiadomość <textarea name="message" rows={3} /></label>
      <label><input type="checkbox" name="accept_terms" /> Akceptuję regulamin {TBC}{err("accept_terms")}</label>
      <label><input type="checkbox" name="accept_privacy" /> Zapoznałem(-am) się z polityką prywatności {TBC}{err("accept_privacy")}</label>
      <p>Cena i opłaty: {TBC}. Płatność online nie jest jeszcze dostępna.</p>
      <button type="submit" disabled={pending}>{pending ? "Wysyłanie…" : "Zarezerwuj termin"}</button>
    </form>
  );
}

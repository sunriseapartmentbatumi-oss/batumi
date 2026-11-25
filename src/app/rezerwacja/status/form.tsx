"use client";
import { useActionState } from "react";
import { checkStatus, type StatusState } from "./actions";
import { formatHold } from "@/lib/booking/status";

const initial: StatusState = {};

export function StatusForm() {
  const [state, action, pending] = useActionState(checkStatus, initial);
  const v = state.view;
  return (
    <>
      <form action={action} style={{ display: "grid", gap: "0.75rem" }}>
        {state.error && <div role="alert" style={{ border: "2px solid #b91c1c", padding: "0.75rem" }}><strong>{state.error}</strong></div>}
        <label>Numer rezerwacji <input name="reference" defaultValue={state.values?.reference ?? ""} placeholder="BAT-XXXXXXXX" required autoComplete="off" /></label>
        <label>E-mail podany w rezerwacji <input type="email" name="email" defaultValue={state.values?.email ?? ""} required autoComplete="email" /></label>
        <button type="submit" disabled={pending}>{pending ? "Sprawdzanie…" : "Sprawdź status"}</button>
      </form>
      {v && (
        <section role="status" aria-live="polite">
          <h2>Rezerwacja {v.reference}</h2>
          <p>Status: <strong>{v.label}</strong></p>
          <p>Termin: {v.check_in} – {v.check_out}; dorośli: {v.adults}, dzieci: {v.children}</p>
          {v.holdExpiresAt && <p>Termin jest wstępnie zablokowany do: {formatHold(v.holdExpiresAt)}.</p>}
        </section>
      )}
    </>
  );
}

"use client";
import { useActionState } from "react";
import { sendTestEmail, type TestEmailState } from "./actions";

export function TestEmailButton() {
  const [state, action, pending] = useActionState<TestEmailState>(sendTestEmail, {});
  return (
    <form action={action}>
      <button type="submit" disabled={pending}>{pending ? "Wysyłanie…" : "Wyślij testowy e-mail"}</button>
      {state.done && (
        <p role="status">{state.sent ? "✅" : "❌"} {state.reason}</p>
      )}
    </form>
  );
}

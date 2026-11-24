import { login } from "./actions";

const messages: Record<string, string> = {
  invalid: "Niepoprawny e-mail lub hasło.",
  denied: "To konto nie ma uprawnień administratora.",
  config: "Brak konfiguracji Supabase (zmienne środowiskowe).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  return (
    <main>
      <h1>Logowanie administratora</h1>
      {msg && messages[msg] && <p role="alert">{messages[msg]}</p>}
      <form action={login} style={{ display: "grid", gap: "0.75rem" }}>
        <label>E-mail <input type="email" name="email" required autoComplete="username" /></label>
        <label>Hasło <input type="password" name="password" required autoComplete="current-password" /></label>
        <button type="submit">Zaloguj</button>
      </form>
    </main>
  );
}

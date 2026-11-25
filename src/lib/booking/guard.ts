export const HONEYPOT_FIELD = "website";
export const STARTED_FIELD = "form_started";
export const MIN_FILL_MS = 3000;

export type BotVerdict = "ok" | "honeypot" | "too_fast";

// Pole-pułapka musi zostać puste; czas wypełnienia liczony od wyrenderowania formularza.
export function botVerdict(formData: FormData, now: number = Date.now()): BotVerdict {
  const trap = formData.get(HONEYPOT_FIELD);
  if (typeof trap === "string" && trap.trim() !== "") return "honeypot";
  const started = Number(formData.get(STARTED_FIELD));
  if (!Number.isFinite(started) || started <= 0) return "too_fast";
  const age = now - started;
  return age < MIN_FILL_MS ? "too_fast" : "ok";
}

export function clientIp(h: { get(name: string): string | null }): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

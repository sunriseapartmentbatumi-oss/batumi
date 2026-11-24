import { z } from "zod";
import { nightsBetween } from "./availability";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Podaj datę");

export function bookingSchema(today: string, minNights = 1) {
  return z
    .object({
      check_in: isoDate,
      check_out: isoDate,
      adults: z.coerce.number().int().min(1, "Min. 1 osoba dorosła").max(20),
      children: z.coerce.number().int().min(0).max(20).default(0),
      first_name: z.string().trim().min(1, "Podaj imię").max(100),
      last_name: z.string().trim().min(1, "Podaj nazwisko").max(100),
      email: z.string().trim().email("Niepoprawny e-mail").max(200),
      phone: z.string().trim().min(5, "Podaj telefon").max(40),
      message: z.string().trim().max(2000).optional(),
      accept_terms: z.literal("on", "Wymagana zgoda"),
      accept_privacy: z.literal("on", "Wymagana zgoda"),
    })
    .superRefine((v, ctx) => {
      if (v.check_in < today) ctx.addIssue({ code: "custom", path: ["check_in"], message: "Data w przeszłości" });
      if (v.check_out <= v.check_in) ctx.addIssue({ code: "custom", path: ["check_out"], message: "Wyjazd musi być po przyjeździe" });
      else if (nightsBetween(v.check_in, v.check_out) < minNights)
        ctx.addIssue({ code: "custom", path: ["check_out"], message: `Minimalny pobyt: ${minNights}` });
    });
}

export function makeReference(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(random() * alphabet.length)];
  return `BAT-${s}`;
}

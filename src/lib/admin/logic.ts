import { z } from "zod";
import type { ReservationStatus } from "@/types/database";

// Dozwolone ręczne zmiany statusu przez admina. Wygasłe/anulowane/zakończone nie wracają do gry (blokada terminu).
const transitions: Record<ReservationStatus, readonly ReservationStatus[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "completed"],
  cancelled: [],
  expired: [],
  completed: [],
};

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  return transitions[from].includes(to);
}

export function statusTimestampColumn(to: ReservationStatus): "confirmed_at" | "cancelled_at" | "completed_at" | null {
  if (to === "confirmed") return "confirmed_at";
  if (to === "cancelled") return "cancelled_at";
  if (to === "completed") return "completed_at";
  return null;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Podaj datę");

export const loginSchema = z.object({
  email: z.string().trim().email("Niepoprawny e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});

export const propertySchema = z.object({ name: z.string().trim().min(1, "Podaj nazwę").max(200) });
export const amenitySchema = z.object({ name: z.string().trim().min(1, "Podaj nazwę").max(200) });

export const blockSchema = z
  .object({ from: isoDate, to: isoDate, reason: z.string().trim().max(500).optional() })
  .refine((v) => v.to > v.from, { message: "Koniec blokady musi być po początku", path: ["to"] });

export function toDateRange(from: string, to: string): string {
  return `[${from},${to})`;
}

export const reservationStatusSchema = z.enum(["pending_payment", "confirmed", "cancelled", "expired", "completed"]);
export const idSchema = z.string().uuid();

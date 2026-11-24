import { describe, expect, it } from "vitest";
import { isAvailable, nightsBetween, rangesOverlap } from "./availability";
import { bookingSchema, makeReference } from "./validation";

const ok = {
  check_in: "2027-01-10", check_out: "2027-01-12", adults: "2", children: "0",
  first_name: "A", last_name: "B", email: "a@b.pl", phone: "123456",
  accept_terms: "on", accept_privacy: "on",
};

describe("availability", () => {
  it("dopuszcza dotykające się terminy", () => {
    expect(rangesOverlap({ check_in: "2027-01-10", check_out: "2027-01-12" }, { check_in: "2027-01-12", check_out: "2027-01-14" })).toBe(false);
  });
  it("wykrywa nakładanie", () => {
    expect(isAvailable({ check_in: "2027-01-11", check_out: "2027-01-13" }, [{ check_in: "2027-01-10", check_out: "2027-01-12" }])).toBe(false);
  });
  it("liczy noce", () => expect(nightsBetween("2027-01-10", "2027-01-12")).toBe(2));
});

describe("validation", () => {
  const schema = bookingSchema("2027-01-01");
  it("przyjmuje poprawne dane", () => expect(schema.safeParse(ok).success).toBe(true));
  it("odrzuca wyjazd przed przyjazdem", () => expect(schema.safeParse({ ...ok, check_out: "2027-01-09" }).success).toBe(false));
  it("odrzuca przeszłość", () => expect(bookingSchema("2027-02-01").safeParse(ok).success).toBe(false));
  it("wymaga zgód", () => expect(schema.safeParse({ ...ok, accept_terms: undefined }).success).toBe(false));
  it("respektuje minimalny pobyt", () => expect(bookingSchema("2027-01-01", 3).safeParse(ok).success).toBe(false));
  it("generuje numer referencyjny", () => expect(makeReference()).toMatch(/^BAT-[A-Z2-9]{8}$/));
});

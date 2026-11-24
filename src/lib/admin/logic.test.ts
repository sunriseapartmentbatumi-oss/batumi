import { describe, expect, it } from "vitest";
import { blockSchema, canTransition, statusTimestampColumn, toDateRange } from "./logic";

describe("admin logic", () => {
  it("pozwala potwierdzić i anulować oczekującą", () => {
    expect(canTransition("pending_payment", "confirmed")).toBe(true);
    expect(canTransition("pending_payment", "cancelled")).toBe(true);
  });
  it("nie wskrzesza wygasłych i anulowanych", () => {
    expect(canTransition("expired", "confirmed")).toBe(false);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
    expect(canTransition("pending_payment", "completed")).toBe(false);
  });
  it("mapuje znaczniki czasu", () => {
    expect(statusTimestampColumn("confirmed")).toBe("confirmed_at");
    expect(statusTimestampColumn("expired")).toBeNull();
  });
  it("waliduje blokadę i buduje daterange", () => {
    expect(blockSchema.safeParse({ from: "2027-01-10", to: "2027-01-10" }).success).toBe(false);
    expect(blockSchema.safeParse({ from: "2027-01-10", to: "2027-01-12" }).success).toBe(true);
    expect(toDateRange("2027-01-10", "2027-01-12")).toBe("[2027-01-10,2027-01-12)");
  });
});

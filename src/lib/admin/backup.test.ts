import { describe, expect, it } from "vitest";
import { buildJsonBackup, parseBackupTable, rowsToCsv } from "./backup";

describe("backup", () => {
  it("CSV: suma kolumn, JSON dla obiektów, ochrona przed formułami", () => {
    const csv = rowsToCsv([{ a: "=1+1", b: { x: 1 } }, { a: "ok", c: "@cmd" }]);
    const [head, r1, r2] = csv.replace("\uFEFF", "").trim().split("\r\n");
    expect(head).toBe("a,b,c");
    expect(r1).toBe("'=1+1,\"{\"\"x\"\":1}\",");
    expect(r2).toBe("ok,,'@cmd");
  });
  it("whitelist tabel", () => {
    expect(parseBackupTable("reservations")).toBe("reservations");
    expect(parseBackupTable("auth.users")).toBeNull();
    expect(parseBackupTable(null)).toBeNull();
  });
  it("JSON zawiera liczniki", () => {
    const b = buildJsonBackup({ reservations: [{ id: 1 }], calendar_blocks: [], properties: [], amenities: [] }, new Date("2026-01-01T00:00:00Z"));
    expect(b.counts).toEqual({ reservations: 1, calendar_blocks: 0, properties: 0, amenities: 0 });
    expect(b.exported_at).toBe("2026-01-01T00:00:00.000Z");
  });
});

import { describe, expect, it } from "vitest";
import { countByStatus, csvCell, itemsForDay, monthGrid, parseDaterange, parseFilters, searchTerm, shiftMonth, toCsv } from "./reports";

describe("CSV", () => {
  it("prefiksuje potencjalne formuły", () => {
    for (const v of ["=1+1", "+48123", "-2", "@SUM(A1)", " =x", "\t=x"]) expect(csvCell(v).replace(/^"/, "").startsWith("'")).toBe(true);
  });
  it("cytuje przecinki, cudzysłowy i nowe linie", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("a\nb")).toBe('"a\nb"');
    expect(csvCell(null)).toBe("");
  });
  it("buduje plik z BOM i CRLF", () => {
    expect(toCsv(["a"], [["x"]])).toBe("\uFEFFa\r\nx\r\n");
  });
});

describe("filtry", () => {
  it("odrzuca niepoprawne wartości", () => {
    expect(parseFilters({ status: "x", from: "2020-1-1", to: "2020-01-02", q: "  " })).toEqual({ to: "2020-01-02" });
  });
  it("czyści frazę wyszukiwania ze składni PostgREST", () => {
    expect(searchTerm("a,b)%_c")).toBe("a b c");
  });
});

describe("kalendarz", () => {
  it("siatka zaczyna się w poniedziałek i pokrywa miesiąc", () => {
    const g = monthGrid("2026-11");
    expect(g[0][0].date).toBe("2026-10-26");
    expect(g.flat().some((d) => d.date === "2026-11-30")).toBe(true);
    expect(g.every((w) => w.length === 7)).toBe(true);
  });
  it("przesuwa miesiące przez granicę roku", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
  it("dzień wyjazdu nie jest zajęty", () => {
    const it1 = [{ kind: "block" as const, label: "x", from: "2026-11-10", to: "2026-11-12" }];
    expect(itemsForDay(it1, "2026-11-11")).toHaveLength(1);
    expect(itemsForDay(it1, "2026-11-12")).toHaveLength(0);
  });
  it("parsuje daterange", () => {
    expect(parseDaterange("[2026-11-10,2026-11-12)")).toEqual({ from: "2026-11-10", to: "2026-11-12" });
    expect(parseDaterange("empty")).toBeNull();
  });
  it("liczy statusy", () => {
    expect(countByStatus([{ status: "confirmed" }, { status: "confirmed" }, { status: "expired" }]).confirmed).toBe(2);
  });
});

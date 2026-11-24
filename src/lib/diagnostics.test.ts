import { describe, expect, it, vi } from "vitest";
import { adminHint, classifyDbError, logDbError, userMessage } from "./diagnostics";

describe("diagnostics", () => {
  it("klasyfikuje błędy domenowe", () => {
    expect(classifyDbError({ message: "dates_unavailable" })).toBe("dates_unavailable");
    expect(classifyDbError({ message: "min_stay" })).toBe("min_stay");
    expect(classifyDbError({ message: "no_property" })).toBe("no_property");
  });
  it("rozpoznaje brak funkcji, uprawnień, klucza i sieci", () => {
    expect(classifyDbError({ code: "PGRST202", message: "x" })).toBe("function_missing");
    expect(classifyDbError({ code: "42501", message: "permission denied for table" })).toBe("permission");
    expect(classifyDbError({ message: "Invalid API key" })).toBe("bad_key");
    expect(classifyDbError({ message: "TypeError: fetch failed" })).toBe("network");
    expect(classifyDbError({ message: "coś innego" })).toBe("unknown");
  });
  it("komunikat dla gościa nie zawiera szczegółów technicznych", () => {
    expect(userMessage("function_missing")).not.toMatch(/migrac|PGRST|funkcj/i);
    expect(adminHint("function_missing")).toMatch(/migracje/);
  });
  it("loguje strukturę bez dodatkowych danych", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logDbError("op", { code: "1", message: "m", details: "d", hint: "h" }, { reference: "BAT-X" });
    const out = JSON.parse(String(spy.mock.calls[0][1]));
    expect(out).toMatchObject({ operation: "op", code: "1", hint: "h", reference: "BAT-X" });
    spy.mockRestore();
  });
});

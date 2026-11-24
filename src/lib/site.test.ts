import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";

describe("smoke", () => {
  it("ma język polski i nazwę strony", () => {
    expect(siteConfig.locale).toBe("pl");
    expect(siteConfig.name.length).toBeGreaterThan(0);
  });
});

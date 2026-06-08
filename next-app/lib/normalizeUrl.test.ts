import { describe, expect, it } from "vitest";
import { normalizeUrl } from "./normalizeUrl";

describe("normalizeUrl", () => {
  it("returns empty for blank input", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });

  it("preserves https URLs", () => {
    expect(normalizeUrl("https://gridz.bio/for-ai")).toBe("https://gridz.bio/for-ai");
  });

  it("adds https when scheme missing", () => {
    expect(normalizeUrl("gridz.bio")).toBe("https://gridz.bio");
  });
});

import { describe, expect, it } from "vitest";
import { estimatePublishMs, formatPublishEta } from "./publishEstimate";

describe("estimatePublishMs", () => {
  it("scales with cell count", () => {
    expect(estimatePublishMs(1)).toBe(45_000);
    expect(estimatePublishMs(3)).toBe(3 * 2 * 14_000);
    expect(estimatePublishMs(50)).toBe(20 * 60_000);
  });
});

describe("formatPublishEta", () => {
  it("formats ETAs", () => {
    expect(formatPublishEta(0)).toBe("~1s remaining");
    expect(formatPublishEta(60)).toBe("~1 min remaining");
    expect(formatPublishEta(125)).toBe("~3 min remaining");
  });
});

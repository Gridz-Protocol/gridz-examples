import { describe, expect, it } from "vitest";
import { estimatePublishMs, estimatePublishTxCount } from "./publishEstimate";

describe("publishEstimate", () => {
  it("counts EAS attest plus resolver link txs per field", () => {
    expect(estimatePublishTxCount(0)).toBe(0);
    expect(estimatePublishTxCount(1)).toBe(2);
    expect(estimatePublishTxCount(5)).toBe(10);
  });

  it("estimates duration from tx count", () => {
    expect(estimatePublishMs(1)).toBeGreaterThanOrEqual(30_000);
    expect(estimatePublishMs(5)).toBe(10 * 14_000);
  });
});

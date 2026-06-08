import { describe, expect, it } from "vitest";
import { estimatePublishMs, estimatePublishTxCount } from "./publishEstimate";

describe("publishEstimate", () => {
  it("counts attest txs plus batched link multicalls", () => {
    expect(estimatePublishTxCount(0)).toBe(0);
    expect(estimatePublishTxCount(1)).toBe(2);
    expect(estimatePublishTxCount(5)).toBe(6);
  });

  it("estimates duration from tx count", () => {
    expect(estimatePublishMs(1)).toBeGreaterThanOrEqual(30_000);
    expect(estimatePublishMs(5)).toBe(6 * 14_000);
  });
});

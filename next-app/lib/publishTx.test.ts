import { describe, expect, it } from "vitest";
import { friendlyPublishError } from "./publishTx";

describe("friendlyPublishError", () => {
  it("shortens replacement transaction underpriced", () => {
    const msg = friendlyPublishError(new Error("replacement transaction underpriced\nlong viem dump"));
    expect(msg).toContain("pending on Base");
  });
});

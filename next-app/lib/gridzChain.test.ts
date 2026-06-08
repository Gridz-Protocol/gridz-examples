import { describe, expect, it } from "vitest";
import { easExplorerUrl, gridzChainForId, gridzChainLabel } from "./gridzChain";

describe("gridzChain", () => {
  it("resolves Base", () => {
    expect(gridzChainForId(8453).id).toBe(8453);
    expect(gridzChainLabel(8453)).toBe("Base");
    expect(easExplorerUrl(8453)).toBe("https://base.easscan.org");
  });
});

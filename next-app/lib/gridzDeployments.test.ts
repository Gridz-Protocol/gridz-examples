import { describe, expect, it } from "vitest";
import { GRIDZ_BASE_MAINNET } from "./gridzDeployments";

const BASE_EAS = "0x4200000000000000000000000000000000000021";
const BASE_RESOLVER = "0x73c5e3944B780D4927c403d351A4F94875DC57B3";

describe("gridzDeployments", () => {
  it("documents Base production addresses", () => {
    expect(GRIDZ_BASE_MAINNET.chainId).toBe(8453);
    expect(GRIDZ_BASE_MAINNET.gridzResolver.toLowerCase()).toBe(BASE_RESOLVER.toLowerCase());
    expect(GRIDZ_BASE_MAINNET.easSchemaRegistry).toBe("0x4200000000000000000000000000000000000020");
    // EAS may come from env in local dev; production default is Base predeploy.
    expect([BASE_EAS, process.env.NEXT_PUBLIC_EAS_ADDRESS?.toLowerCase()].filter(Boolean)).toContain(
      GRIDZ_BASE_MAINNET.eas.toLowerCase(),
    );
  });
});

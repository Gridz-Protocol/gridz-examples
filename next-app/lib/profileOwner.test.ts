import { describe, expect, it } from "vitest";
import type { Grid } from "@gridz/core";
import { ownerDidFromGrid, isProfileOwner, OWNER_KEY } from "./profileOwner";

const WALLET = "0x3BB765B970B7Ca503dc26573f9E07cA1E88A218D";
const REGISTRAR = "0xEBE4ceb499Ad95DC1e5662E3a223Ec8cc0a555d9";
const CHAIN = 8453;

describe("ownerDidFromGrid", () => {
  it("reads gridz.owner cell", () => {
    const ownerDid = `did:pkh:eip155:${CHAIN}:${WALLET.toLowerCase()}`;
    const grid = {
      schema_version: "gridz/1.0.0",
      subject: { type: "human", did: "did:ens:test.gridz.eth", ens: "test.gridz.eth" },
      theme: {} as Grid["theme"],
      cells: [
        {
          id: OWNER_KEY,
          key: OWNER_KEY,
          value: ownerDid,
          position: { x: 0, y: 0, w: 0, h: 0 },
          size: "0x0",
          is_visible: false,
          attestation: {
            format: "eas-onchain",
            uid: "0x" + "a".repeat(64),
            uri: "eas://x",
            attester: `did:pkh:eip155:${CHAIN}:${REGISTRAR.toLowerCase()}`,
            iat: "2026-01-01T00:00:00.000Z",
            value_hash: "0x" + "0".repeat(64),
          },
        },
      ],
      root_attestation: {} as Grid["root_attestation"],
    } as Grid;
    expect(ownerDidFromGrid(grid, CHAIN, REGISTRAR)).toBe(ownerDid);
    expect(isProfileOwner(grid, WALLET, CHAIN, REGISTRAR)).toBe(true);
    expect(isProfileOwner(grid, REGISTRAR, CHAIN, REGISTRAR)).toBe(false);
  });

  it("returns null when only registrar attested on-chain", () => {
    const grid = {
      schema_version: "gridz/1.0.0",
      subject: { type: "human", did: "did:ens:test.gridz.eth", ens: "test.gridz.eth" },
      theme: {} as Grid["theme"],
      cells: [
        {
          id: "alias",
          key: "alias",
          value: "Test",
          position: { x: 0, y: 0, w: 1, h: 1 },
          size: "1x1",
          is_visible: true,
          attestation: {
            format: "eas-onchain",
            uid: "0x" + "a".repeat(64),
            uri: "eas://x",
            attester: `did:pkh:eip155:${CHAIN}:${REGISTRAR.toLowerCase()}`,
            iat: "2026-01-01T00:00:00.000Z",
            value_hash: "0x" + "0".repeat(64),
          },
        },
      ],
      root_attestation: {} as Grid["root_attestation"],
    } as Grid;
    expect(ownerDidFromGrid(grid, CHAIN, REGISTRAR)).toBeNull();
  });
});

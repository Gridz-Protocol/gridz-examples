import { describe, expect, it } from "vitest";
import type { Grid } from "@gridz/core";
import { SCHEMA_VERSION } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { resolveProfileSource } from "./profileSource";

const ENS = "kevin.gridz.eth";

function chainGrid(): Grid {
  return {
    schema_version: SCHEMA_VERSION,
    subject: { type: "human", did: "did:pkh:eip155:8453:0xabc", ens: ENS },
    theme: {
      background_type: "solid",
      background_value: "#000",
      accent_color: "#fff",
      text_color: "#fff",
      card_style: "rounded",
      card_background: "#111",
      font_family: "sans",
    },
    cells: [
      {
        id: "alias",
        key: "alias",
        value: "Kevin",
        position: { x: 0, y: 0, w: 1, h: 1 },
        size: "1x1",
        is_visible: true,
        attestation: {
          format: "eas-onchain",
          uid: "0x1111111111111111111111111111111111111111111111111111111111111111",
          uri: "eas://8453/0x1111",
          attester: "did:pkh:eip155:8453:0xabc",
          iat: "2025-01-01T00:00:00Z",
          value_hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
        },
      },
    ],
    root_attestation: {
      format: "eas-onchain",
      uid: "0x3333333333333333333333333333333333333333333333333333333333333333",
      uri: "eas://8453/0x3333",
      attester: "did:pkh:eip155:8453:0xabc",
      iat: "2025-01-01T00:00:00Z",
      value_hash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    },
  };
}

describe("resolveProfileSource", () => {
  it("shows on-chain when local bundle matches published grid", () => {
    const chain = chainGrid();
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Kevin" },
      signedBaseline: chain,
      savedAt: new Date().toISOString(),
    };
    const { source } = resolveProfileSource(chain, bundle, ENS);
    expect(source).toBe("chain");
  });

  it("shows draft when local fields differ from chain", () => {
    const chain = chainGrid();
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Draft Name" },
      signedBaseline: chain,
      savedAt: new Date().toISOString(),
    };
    const { source } = resolveProfileSource(chain, bundle, ENS);
    expect(source).toBe("draft");
  });

  it("shows on-chain from signed baseline while server has not refreshed yet", () => {
    const chain = chainGrid();
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Kevin" },
      signedBaseline: chain,
      savedAt: new Date().toISOString(),
    };
    const { source, grid } = resolveProfileSource(null, bundle, ENS);
    expect(source).toBe("chain");
    expect(grid?.cells[0]?.attestation.format).toBe("eas-onchain");
  });
});

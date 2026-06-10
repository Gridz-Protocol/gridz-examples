import { describe, expect, it } from "vitest";
import type { Grid } from "@gridz/core";
import { SCHEMA_VERSION } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { resolveProfileSource, bundleIsPublished } from "./profileSource";

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

describe("bundleIsPublished", () => {
  it("returns true when bundle fields match a published baseline", () => {
    const chain = chainGrid();
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Kevin" },
      signedBaseline: chain,
      savedAt: new Date().toISOString(),
    };
    expect(bundleIsPublished(bundle)).toBe(true);
  });

  it("returns false when bundle fields differ from baseline", () => {
    const chain = chainGrid();
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Different" },
      signedBaseline: chain,
      savedAt: new Date().toISOString(),
    };
    expect(bundleIsPublished(bundle)).toBe(false);
  });

  it("returns false when baseline has no real attestations", () => {
    const ZERO = `0x${"0".repeat(64)}`;
    const draftGrid: Grid = {
      schema_version: SCHEMA_VERSION,
      subject: { type: "human", did: "did:ens:kevin.gridz.eth", ens: ENS },
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
            format: "eip712-raw",
            uid: ZERO,
            uri: "draft://kevin.gridz.eth/alias",
            attester: "kevin.gridz.eth",
            iat: "2025-01-01T00:00:00Z",
            value_hash: ZERO,
          },
        },
      ],
      root_attestation: {
        format: "eip712-raw",
        uid: ZERO,
        uri: "draft://kevin.gridz.eth",
        attester: "kevin.gridz.eth",
        iat: "2025-01-01T00:00:00Z",
        value_hash: ZERO,
      } as Grid["root_attestation"],
    };
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Kevin" },
      signedBaseline: draftGrid,
      savedAt: new Date().toISOString(),
    };
    expect(bundleIsPublished(bundle)).toBe(false);
  });

  it("returns false for null bundle", () => {
    expect(bundleIsPublished(null)).toBe(false);
  });
});

describe("resolveProfileSource stale localStorage", () => {
  it("shows on-chain when fields lag chain but signed baseline matches (e.g. missing description in fields)", () => {
    const chain = chainGrid();
    const chainWithDesc: Grid = {
      ...chain,
      cells: [
        ...chain.cells,
        {
          id: "description",
          key: "description",
          value: "Bio text",
          position: { x: 1, y: 0, w: 2, h: 1 },
          size: "2x1",
          is_visible: true,
          attestation: {
            format: "eas-onchain",
            uid: "0x5555555555555555555555555555555555555555555555555555555555555555",
            uri: "eas://8453/0x5555",
            attester: "did:pkh:eip155:8453:0xabc",
            iat: "2025-01-01T00:00:00Z",
            value_hash: "0x6666666666666666666666666666666666666666666666666666666666666666",
          },
        },
      ],
    };
    const bundle: DraftBundle = {
      version: 2,
      fields: { ...DEFAULT_PROFILE_FIELDS, alias: "Kevin", description: "" },
      signedBaseline: chainWithDesc,
      savedAt: new Date().toISOString(),
    };
    const { source } = resolveProfileSource(chainWithDesc, bundle, ENS);
    expect(source).toBe("chain");
  });

  it("shows on-chain when widget toggles are enabled locally but not published", () => {
    const chain = chainGrid();
    const bundle: DraftBundle = {
      version: 2,
      fields: {
        ...DEFAULT_PROFILE_FIELDS,
        alias: "Kevin",
        statsEnabled: true,
        pollEnabled: true,
      },
      signedBaseline: chain,
      savedAt: new Date().toISOString(),
    };
    const { source } = resolveProfileSource(chain, bundle, ENS);
    expect(source).toBe("chain");
  });
});

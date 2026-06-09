import { describe, expect, it, beforeEach } from "vitest";
import type { Grid } from "@gridz/core";
import { SCHEMA_VERSION } from "@gridz/core";
import { saveDraftFields, saveSignedBaseline } from "./drafts";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { listMyProfileSubjects, listOwnedProfileSubjects } from "./listMyProfiles";
import { rememberProfile } from "./recentProfiles";

const WALLET = "0x3BB765B970B7Ca503dc26573f9E07cA1E88A218D";
const OTHER = "0x1111111111111111111111111111111111111111";
const CHAIN = 8453;
const ENS_MINE = "kevin.gridz.eth";
const ENS_OTHER = "darkclaw.gridz.eth";

function signedGrid(attester: string, ens: string): Grid {
  const did = `did:pkh:eip155:${CHAIN}:${attester.toLowerCase()}`;
  return {
    schema_version: SCHEMA_VERSION,
    subject: { type: "human", did, ens, display_name: "Test" },
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
        value: "Test",
        position: { x: 0, y: 0, w: 1, h: 1 },
        size: "1x1",
        is_visible: true,
        attestation: {
          format: "eip712-raw",
          uid: "0x" + "a".repeat(64),
          uri: "data://inline/test",
          attester: did,
          iat: "2026-01-01T00:00:00.000Z",
          value_hash: "0x" + "b".repeat(64),
          payload: "c2lnbmVk",
        },
      },
    ],
    root_attestation: {
      format: "eip712-raw",
      uid: "0x" + "c".repeat(64),
      uri: "data://inline/root",
      attester: did,
      iat: "2026-01-01T00:00:00.000Z",
      value_hash: "0x" + "d".repeat(64),
      payload: "c2lnbmVk",
    },
  };
}

describe("listMyProfileSubjects", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("includes owned profiles from signed baseline, not recently viewed", () => {
    saveSignedBaseline(ENS_MINE, { ...DEFAULT_PROFILE_FIELDS, alias: "Kevin" }, signedGrid(WALLET, ENS_MINE));
    rememberProfile(ENS_OTHER);

    const { drafts, owned } = listMyProfileSubjects({
      walletAddress: WALLET,
      chainId: CHAIN,
    });

    expect(owned).toEqual([ENS_MINE]);
    expect(owned).not.toContain(ENS_OTHER);
    expect(drafts).toEqual([]);
  });

  it("excludes another wallet's published baseline when connected", () => {
    saveSignedBaseline(ENS_OTHER, { ...DEFAULT_PROFILE_FIELDS, alias: "Darkclaw" }, signedGrid(OTHER, ENS_OTHER));

    expect(
      listOwnedProfileSubjects({ walletAddress: WALLET, chainId: CHAIN }),
    ).toEqual([]);
  });

  it("lists unpublished drafts separately from owned", () => {
    saveDraftFields(ENS_MINE, { ...DEFAULT_PROFILE_FIELDS, alias: "Draft" }, null);

    const { drafts, owned } = listMyProfileSubjects({ walletAddress: WALLET, chainId: CHAIN });
    expect(drafts).toEqual([ENS_MINE]);
    expect(owned).toEqual([]);
  });
});

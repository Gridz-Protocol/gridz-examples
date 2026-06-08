import { describe, expect, it } from "vitest";
import type { Grid } from "@gridz/core";
import { canEditProfile, isProfileSigner } from "./canEditProfile";
import type { DraftBundle } from "./drafts";

const WALLET = "0x3BB765B970B7Ca503dc26573f9E07cA1E88A218D";
const REGISTRAR = "0xEBE4ceb499Ad95DC1e5662E3a223Ec8cc0a555d9";
const CHAIN = 1;

function gridWithAttester(attester: string): Grid {
  return {
    schema_version: "gridz/1.0.0",
    subject: { type: "human", did: "did:ens:1claw.gridz.eth", ens: "1claw.gridz.eth" },
    theme: {} as Grid["theme"],
    cells: [
      {
        id: "alias",
        key: "alias",
        value: "1Claw",
        position: { x: 0, y: 0, w: 1, h: 1 },
        size: "1x1",
        is_visible: true,
        attestation: {
          format: "eas-onchain",
          uid: "0x" + "a".repeat(64),
          uri: "eas://x",
          attester: `did:pkh:eip155:1:${attester.toLowerCase()}`,
          iat: "2026-01-01T00:00:00.000Z",
          value_hash: "0x" + "0".repeat(64),
        },
      },
    ],
    root_attestation: {
      format: "eip712-raw",
      uid: "0x" + "0".repeat(64),
      uri: "ens://1claw.gridz.eth",
      attester: "1claw.gridz.eth",
      iat: "2026-01-01T00:00:00.000Z",
      value_hash: "0x" + "0".repeat(64),
    },
  };
}

const draftFields = {
  displayName: "1Claw",
  bio: "",
  url: "",
  avatar: "",
  twitter: "",
  github: "",
  widgets: [],
} as DraftBundle["fields"];

describe("canEditProfile", () => {
  it("allows claim when nothing is on-chain", () => {
    expect(canEditProfile({ chainGrid: null, draftBundle: null, walletAddress: null, chainId: CHAIN })).toBe(
      true,
    );
  });

  it("blocks strangers on a fully published profile", () => {
    const chainGrid = gridWithAttester(WALLET);
    expect(
      canEditProfile({ chainGrid, draftBundle: null, walletAddress: REGISTRAR, chainId: CHAIN }),
    ).toBe(false);
  });

  it("allows edit when this browser has a local draft despite registrar on-chain attester", () => {
    const chainGrid = gridWithAttester(REGISTRAR);
    const draftBundle: DraftBundle = {
      version: 2,
      fields: draftFields,
      signedBaseline: null,
      savedAt: new Date().toISOString(),
    };
    expect(
      canEditProfile({ chainGrid, draftBundle, walletAddress: WALLET, chainId: CHAIN }),
    ).toBe(true);
  });

  it("allows on-chain owner without a draft", () => {
    const chainGrid = gridWithAttester(WALLET);
    expect(
      canEditProfile({ chainGrid, draftBundle: null, walletAddress: WALLET, chainId: CHAIN }),
    ).toBe(true);
  });
});

describe("isProfileSigner", () => {
  it("detects signer from signed draft baseline when chain has registrar attester", () => {
    const chainGrid = gridWithAttester(REGISTRAR);
    const signedBaseline = gridWithAttester(WALLET);
    const draftBundle: DraftBundle = {
      version: 2,
      fields: draftFields,
      signedBaseline,
      savedAt: new Date().toISOString(),
    };
    expect(isProfileSigner({ chainGrid, draftBundle, walletAddress: WALLET, chainId: CHAIN })).toBe(true);
    expect(isProfileSigner({ chainGrid, draftBundle, walletAddress: REGISTRAR, chainId: CHAIN })).toBe(
      false,
    );
  });
});

  it("allows reclaim when on-chain cells are registrar-only (no local draft)", () => {
    const chainGrid = gridWithAttester(REGISTRAR);
    expect(
      canEditProfile({
        chainGrid,
        draftBundle: null,
        walletAddress: WALLET,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(true);
  });

import { describe, expect, it } from "vitest";
import type { Grid } from "@gridz/core";
import { canEditProfile, canPublishProfile, isProfileSigner, isRegistrarOnlyPublish } from "./canEditProfile";
import type { DraftBundle } from "./drafts";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { OWNER_KEY } from "./profileOwner";

const WALLET = "0x3BB765B970B7Ca503dc26573f9E07cA1E88A218D";
const OTHER = "0x1111111111111111111111111111111111111111";
const REGISTRAR = "0xEBE4ceb499Ad95DC1e5662E3a223Ec8cc0a555d9";
const CHAIN = 8453;

function gridWithAttester(attester: string, extraCells: Grid["cells"] = []): Grid {
  const did = `did:pkh:eip155:${CHAIN}:${attester.toLowerCase()}`;
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
          attester: did,
          iat: "2026-01-01T00:00:00.000Z",
          value_hash: "0x" + "0".repeat(64),
        },
      },
      ...extraCells,
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

const draftFields = { ...DEFAULT_PROFILE_FIELDS, alias: "1Claw" };

describe("canEditProfile", () => {
  it("allows claim when nothing is on-chain", () => {
    expect(canEditProfile({ chainGrid: null, draftBundle: null, walletAddress: null, chainId: CHAIN })).toBe(
      true,
    );
  });

  it("blocks strangers on a registrar-published profile without owner cell", () => {
    const chainGrid = gridWithAttester(REGISTRAR);
    expect(
      canEditProfile({
        chainGrid,
        draftBundle: null,
        walletAddress: OTHER,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(false);
  });

  it("blocks strangers with a stale local draft on a published profile", () => {
    const chainGrid = gridWithAttester(REGISTRAR);
    const draftBundle: DraftBundle = {
      version: 2,
      fields: draftFields,
      signedBaseline: null,
      savedAt: new Date().toISOString(),
    };
    expect(
      canEditProfile({
        chainGrid,
        draftBundle,
        walletAddress: OTHER,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(false);
  });

  it("allows edit when wallet matches signed baseline despite registrar on-chain attester", () => {
    const chainGrid = gridWithAttester(REGISTRAR);
    const signedBaseline = gridWithAttester(WALLET);
    const draftBundle: DraftBundle = {
      version: 2,
      fields: draftFields,
      signedBaseline,
      savedAt: new Date().toISOString(),
    };
    expect(
      canEditProfile({
        chainGrid,
        draftBundle,
        walletAddress: WALLET,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(true);
  });

  it("allows on-chain owner via gridz.owner cell", () => {
    const ownerDid = `did:pkh:eip155:${CHAIN}:${WALLET.toLowerCase()}`;
    const chainGrid = gridWithAttester(REGISTRAR, [
      {
        id: OWNER_KEY,
        key: OWNER_KEY,
        value: ownerDid,
        position: { x: 0, y: 0, w: 0, h: 0 },
        size: "0x0",
        is_visible: false,
        attestation: {
          format: "eas-onchain",
          uid: "0x" + "b".repeat(64),
          uri: "eas://owner",
          attester: `did:pkh:eip155:${CHAIN}:${REGISTRAR.toLowerCase()}`,
          iat: "2026-01-01T00:00:00.000Z",
          value_hash: "0x" + "1".repeat(64),
        },
      },
    ]);
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
});

describe("isRegistrarOnlyPublish", () => {
  it("is false once gridz.owner is recorded", () => {
    const ownerDid = `did:pkh:eip155:${CHAIN}:${WALLET.toLowerCase()}`;
    const chainGrid = gridWithAttester(REGISTRAR, [
      {
        id: OWNER_KEY,
        key: OWNER_KEY,
        value: ownerDid,
        position: { x: 0, y: 0, w: 0, h: 0 },
        size: "0x0",
        is_visible: false,
        attestation: {
          format: "eas-onchain",
          uid: "0x" + "b".repeat(64),
          uri: "eas://owner",
          attester: `did:pkh:eip155:${CHAIN}:${REGISTRAR.toLowerCase()}`,
          iat: "2026-01-01T00:00:00.000Z",
          value_hash: "0x" + "1".repeat(64),
        },
      },
    ]);
    expect(isRegistrarOnlyPublish(chainGrid, CHAIN, REGISTRAR)).toBe(false);
  });
});

describe("canPublishProfile", () => {
  it("allows first claim when nothing is on-chain", () => {
    const incoming = gridWithAttester(WALLET);
    expect(
      canPublishProfile({
        chainGrid: null,
        incomingGrid: incoming,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(true);
  });

  it("blocks stranger-signed publish over an owned profile", () => {
    const ownerDid = `did:pkh:eip155:${CHAIN}:${WALLET.toLowerCase()}`;
    const chainGrid = gridWithAttester(REGISTRAR, [
      {
        id: OWNER_KEY,
        key: OWNER_KEY,
        value: ownerDid,
        position: { x: 0, y: 0, w: 0, h: 0 },
        size: "0x0",
        is_visible: false,
        attestation: {
          format: "eas-onchain",
          uid: "0x" + "b".repeat(64),
          uri: "eas://owner",
          attester: `did:pkh:eip155:${CHAIN}:${REGISTRAR.toLowerCase()}`,
          iat: "2026-01-01T00:00:00.000Z",
          value_hash: "0x" + "1".repeat(64),
        },
      },
    ]);
    const incoming = gridWithAttester(OTHER);
    expect(
      canPublishProfile({
        chainGrid,
        incomingGrid: incoming,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(false);
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
    expect(
      isProfileSigner({
        chainGrid,
        draftBundle,
        walletAddress: WALLET,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(true);
    expect(
      isProfileSigner({
        chainGrid,
        draftBundle,
        walletAddress: OTHER,
        chainId: CHAIN,
        registrarAddress: REGISTRAR,
      }),
    ).toBe(false);
  });
});

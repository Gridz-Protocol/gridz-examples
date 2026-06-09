import { describe, expect, it, beforeEach } from "vitest";
import type { Grid } from "@gridz/core";
import { SCHEMA_VERSION } from "@gridz/core";
import { saveDraftFields, saveSignedBaseline } from "./drafts";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { listDraftSubjects } from "./listDrafts";

const ENS = "1claw.gridz.eth";

function publishedGrid(): Grid {
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
        value: "1Claw",
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

describe("listDraftSubjects", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists unsigned drafts only", () => {
    saveDraftFields(ENS, { ...DEFAULT_PROFILE_FIELDS, alias: "Draft" }, null);
    expect(listDraftSubjects()).toEqual([ENS]);
  });

  it("excludes published baselines kept for incremental sign", () => {
    const grid = publishedGrid();
    saveSignedBaseline(ENS, { ...DEFAULT_PROFILE_FIELDS, alias: "1Claw" }, grid);
    expect(listDraftSubjects()).toEqual([]);
  });

  it("includes profile again when fields diverge from published baseline", () => {
    const grid = publishedGrid();
    saveSignedBaseline(ENS, { ...DEFAULT_PROFILE_FIELDS, alias: "1Claw" }, grid);
    saveDraftFields(ENS, { ...DEFAULT_PROFILE_FIELDS, alias: "New name" }, grid);
    expect(listDraftSubjects()).toEqual([ENS]);
  });
});

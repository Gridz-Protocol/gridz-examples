import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { draftKey, loadDraftBundle, saveDraftFields } from "./drafts";

describe("drafts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores unsigned fields without requiring a signed grid", () => {
    saveDraftFields("alice.gridz.eth", { ...DEFAULT_PROFILE_FIELDS, alias: "Alice" }, null);
    const bundle = loadDraftBundle("alice.gridz.eth");
    expect(bundle?.version).toBe(2);
    expect(bundle?.fields.alias).toBe("Alice");
    expect(bundle?.signedBaseline).toBeNull();
    expect(draftKey("Alice.Gridz.ETH")).toBe("gridz:draft:alice.gridz.eth");
  });
});

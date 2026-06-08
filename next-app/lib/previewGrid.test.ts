import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import { mergeFieldPreview } from "./previewGrid";

describe("previewGrid", () => {
  it("overlays unsigned field values on chain cells", () => {
    const chain = mergeFieldPreview(null, { ...DEFAULT_PROFILE_FIELDS, alias: "Chain" }, "alice.gridz.eth");
    const merged = mergeFieldPreview(chain, { ...DEFAULT_PROFILE_FIELDS, alias: "Draft" }, "alice.gridz.eth");
    expect(merged?.cells.find((c) => c.key === "alias")?.value).toBe("Draft");
  });
});

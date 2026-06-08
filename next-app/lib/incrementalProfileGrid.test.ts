import { describe, expect, it } from "vitest";
import { algoForFormat, valueHash, type Cell, type Grid } from "@gridz/core";
import { profileCellsFromFields } from "./buildProfileGrid";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";
import {
  baselineCellByKey,
  canReuseCell,
  countCellsToPublish,
  countCellsToSign,
} from "./incrementalProfileGrid";

const DID = "did:pkh:eip155:1:0xabc";

function cell(key: string, value: unknown, widgetType?: string): Cell {
  const algo = algoForFormat("eip712-raw");
  return {
    id: key,
    key,
    value,
    ...(widgetType ? { widget_type: widgetType } : {}),
    position: { x: 0, y: 0, w: 1, h: 1 },
    size: "1x1",
    is_visible: true,
    attestation: {
      format: "eip712-raw",
      uid: `0x${key.padEnd(64, "0").slice(0, 64)}`,
      uri: "data://inline/test",
      attester: DID,
      iat: "2026-01-01T00:00:00.000Z",
      value_hash: valueHash(algo, value),
    },
  };
}

function grid(cells: Cell[]): Grid {
  return {
    schema_version: "gridz/1.0.0",
    subject: { type: "human", did: DID, display_name: "Test" },
    theme: {
      background_type: "solid",
      background_value: "#000",
      accent_color: "#7c5cff",
      text_color: "#fff",
      card_style: "rounded",
      card_background: "#111",
      font_family: "sans",
      show_gridz_badge: true,
    },
    cells,
    root_attestation: {
      format: "eip712-raw",
      uid: `0x${"f".repeat(64)}`,
      uri: "data://inline/root",
      attester: DID,
      iat: "2026-01-01T00:00:00.000Z",
      value_hash: `0x${"f".repeat(64)}`,
    },
  };
}

describe("incrementalProfileGrid", () => {
  it("reuses cells when value and attester are unchanged", () => {
    const baseline = grid([cell("alias", "Kevin"), cell("url", "https://gridz.bio")]);
    const drafts = profileCellsFromFields({
      ...DEFAULT_PROFILE_FIELDS,
      alias: "Kevin",
      url: "https://gridz.bio",
    });
    expect(canReuseCell(drafts[0]!, baseline.cells[0], DID)).toBe(true);
    expect(countCellsToSign(drafts, baseline, DID)).toBe(2);
  });

  it("requires new signatures when a value changes", () => {
    const baseline = grid([cell("alias", "Kevin")]);
    const drafts = profileCellsFromFields({ ...DEFAULT_PROFILE_FIELDS, alias: "Kev" });
    expect(canReuseCell(drafts[0]!, baseline.cells[0], DID)).toBe(false);
    expect(countCellsToSign(drafts, baseline, DID)).toBe(3);
  });

  it("counts only changed cells for publish", () => {
    const chain = grid([cell("alias", "Kevin"), cell("url", "https://old.example")]);
    const next = grid([cell("alias", "Kevin"), cell("url", "https://gridz.bio")]);
    expect(countCellsToPublish(next, chain)).toBe(1);
    expect(countCellsToPublish(next, null)).toBe(next.cells.length);
  });

  it("maps baseline cells by key", () => {
    const g = grid([cell("alias", "A"), cell("description", "Bio")]);
    const map = baselineCellByKey(g);
    expect(map.get("alias")?.value).toBe("A");
    expect(map.get("description")?.value).toBe("Bio");
  });
});

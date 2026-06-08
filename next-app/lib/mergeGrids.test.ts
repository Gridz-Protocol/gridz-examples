import { describe, expect, it } from "vitest";
import type { Cell, Grid } from "@gridz/core";
import { mergeGrids } from "./mergeGrids";

function cell(key: string, value: string, iat: string): Cell {
  return {
    id: key,
    key,
    value,
    position: { x: 0, y: 0, w: 1, h: 1 },
    size: "1x1",
    is_visible: true,
    attestation: {
      format: "eip712-raw",
      uid: `0x${"0".repeat(64)}`,
      uri: "data://inline/test",
      attester: "did:pkh:eip155:1:0xabc",
      iat,
      value_hash: `0x${"0".repeat(64)}`,
    },
  };
}

function grid(cells: Cell[]): Grid {
  return {
    schema_version: "gridz/1.0.0",
    subject: { type: "human", did: "did:pkh:eip155:1:0xabc", display_name: "Test" },
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
      uid: `0x${"0".repeat(64)}`,
      uri: "data://inline/root",
      attester: "did:pkh:eip155:1:0xabc",
      iat: "2026-01-01T00:00:00.000Z",
      value_hash: `0x${"0".repeat(64)}`,
    },
  };
}

describe("mergeGrids", () => {
  it("returns null when both inputs are null", () => {
    expect(mergeGrids(null, null)).toBeNull();
  });

  it("union keys and prefers newer draft attestation", () => {
    const chain = grid([
      cell("alias", "Old", "2026-01-01T00:00:00.000Z"),
      cell("description", "On chain only", "2026-01-01T00:00:00.000Z"),
    ]);
    const draft = grid([
      cell("alias", "New", "2026-01-03T00:00:00.000Z"),
      cell("url", "https://gridz.bio", "2026-01-03T00:00:00.000Z"),
    ]);
    const merged = mergeGrids(chain, draft)!;
    const byKey = Object.fromEntries(merged.cells.map((c) => [c.key, c.value]));
    expect(byKey.alias).toBe("New");
    expect(byKey.description).toBe("On chain only");
    expect(byKey.url).toBe("https://gridz.bio");
  });
});

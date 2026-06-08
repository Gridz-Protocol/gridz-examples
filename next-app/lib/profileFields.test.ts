import { describe, expect, it } from "vitest";
import type { Grid } from "@gridz/core";
import { DEFAULT_PROFILE_FIELDS, fieldsFromGrid, isWidgetEnabled, setWidgetEnabled } from "./profileFields";

const theme = {
  background_type: "solid" as const,
  background_value: "#0b0b0f",
  accent_color: "#7c5cff",
  text_color: "#f4f4f5",
  card_style: "rounded" as const,
  card_background: "#16161c",
  font_family: "sans" as const,
  show_gridz_badge: true,
};

describe("profileFields", () => {
  it("round-trips url from grid", () => {
    const grid: Grid = {
      schema_version: "gridz/1.0.0",
      subject: { type: "human", did: "did:ens:kevin.gridz.eth", ens: "kevin.gridz.eth", display_name: "Kevin" },
      theme,
      cells: [
        {
          id: "alias",
          key: "alias",
          value: "Kevin",
          position: { x: 0, y: 0, w: 1, h: 1 },
          size: "1x1",
          is_visible: true,
          attestation: { format: "eas-onchain", uid: "0x1", uri: "eas://1", attester: "a", iat: "t", value_hash: "0x0" },
        },
        {
          id: "url",
          key: "url",
          value: "https://gridz.bio",
          position: { x: 0, y: 1, w: 1, h: 1 },
          size: "1x1",
          is_visible: true,
          attestation: { format: "eas-onchain", uid: "0x2", uri: "eas://2", attester: "a", iat: "t", value_hash: "0x0" },
        },
      ],
      root_attestation: { format: "eas-onchain", uid: "0x0", uri: "eas://0", attester: "a", iat: "t", value_hash: "0x0" },
    };
    const fields = fieldsFromGrid(grid);
    expect(fields.alias).toBe("Kevin");
    expect(fields.url).toBe("https://gridz.bio");
  });

  it("toggles widget flags", () => {
    const on = setWidgetEnabled(DEFAULT_PROFILE_FIELDS, "poll", true);
    expect(isWidgetEnabled(on, "poll")).toBe(true);
    const off = setWidgetEnabled(on, "poll", false);
    expect(isWidgetEnabled(off, "poll")).toBe(false);
  });
});

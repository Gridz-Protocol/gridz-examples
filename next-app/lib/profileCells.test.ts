import { describe, expect, it } from "vitest";
import { profileCellsFromFields } from "./buildProfileGrid";
import { DEFAULT_PROFILE_FIELDS } from "./profileFields";

describe("profileCellsFromFields", () => {
  it("includes url when website is set", () => {
    const cells = profileCellsFromFields({
      ...DEFAULT_PROFILE_FIELDS,
      alias: "Kevin",
      url: "gridz.bio",
    });
    const url = cells.find((c) => c.key === "url");
    expect(url?.value).toBe("https://gridz.bio");
  });

  it("includes all core profile fields", () => {
    const cells = profileCellsFromFields({
      ...DEFAULT_PROFILE_FIELDS,
      alias: "Kevin",
      description: "Builder",
      url: "https://gridz.bio",
      avatar: "https://gateway.pinata.cloud/ipfs/QmTest",
      twitter: "@kevin",
      github: "kevin",
      statsEnabled: true,
      stats: [{ label: "Posts", value: "42" }],
      linkEnabled: true,
      linkLabel: "Blog",
      linkUrl: "blog.gridz.bio",
    });
    const keys = cells.map((c) => c.key);
    expect(keys).toContain("alias");
    expect(keys).toContain("description");
    expect(keys).toContain("url");
    expect(keys).toContain("avatar");
    expect(keys).toContain("com.twitter");
    expect(keys).toContain("com.github");
    expect(keys).toContain("gridz.stats");
    expect(keys).toContain("gridz.social_link");
    expect(keys).toContain("gridz.keys");
    const manifest = cells.find((c) => c.key === "gridz.keys");
    expect(JSON.parse(String(manifest?.value))).toContain("url");
  });
  it("includes org tokens when enabled", () => {
    const cells = profileCellsFromFields({
      ...DEFAULT_PROFILE_FIELDS,
      alias: "Acme Corp",
      tokensEnabled: true,
      tokens: [
        { chainId: 8453, address: "0x0000000000000000000000000000000000000001", symbol: "ACME", name: "Acme Token" },
      ],
    });
    const tokenCell = cells.find((c) => c.key === "gridz.tokens");
    expect(tokenCell?.widget_type).toBe("gridz.tokens");
    const value = tokenCell?.value as { tokens: { chainId: number; address: string }[] };
    expect(value.tokens[0]?.chainId).toBe(8453);
  });

});

import { describe, expect, it } from "vitest";
import { curlFetchSnippet, profileApiUrl } from "./profileVerifyGuide";

describe("profileVerifyGuide", () => {
  it("builds apex API URL for a subject", () => {
    expect(profileApiUrl("kevin.gridz.eth")).toBe("https://gridz.bio/api/profile/kevin.gridz.eth");
  });

  it("includes subject in curl snippet", () => {
    expect(curlFetchSnippet("kevin.gridz.eth")).toContain("kevin.gridz.eth");
  });
});

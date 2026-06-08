import { beforeEach, describe, expect, it } from "vitest";
import { listRecentProfiles, rememberProfile } from "./recentProfiles";

describe("recentProfiles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("remembers and dedupes subjects", () => {
    rememberProfile("kevin.gridz.eth");
    rememberProfile("demo.gridz.eth");
    rememberProfile("kevin.gridz.eth");
    expect(listRecentProfiles()).toEqual(["kevin.gridz.eth", "demo.gridz.eth"]);
  });
});

import { describe, expect, it, beforeEach } from "vitest";
import { DEMO_PROFILE_SUBJECT } from "./demoProfile";
import { rankLocalMatches, resolveSearchSubject, buildSearchPool } from "./profileSearch";
import { rememberProfile } from "./recentProfiles";

describe("profileSearch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resolves bare alias to ens subname", () => {
    expect(resolveSearchSubject("kevin")).toBe("kevin.gridz.eth");
  });

  it("ranks prefix matches and limits to five", () => {
    rememberProfile("kevin.gridz.eth");
    rememberProfile("kevlar.gridz.eth");
    const pool = buildSearchPool("kevin.gridz.eth");
    const matches = rankLocalMatches("kev", pool, 5);
    expect(matches[0]).toBe("kevin.gridz.eth");
    expect(matches).toContain("kevlar.gridz.eth");
    expect(matches.length).toBeLessThanOrEqual(5);
  });

  it("includes featured demo profile when query matches", () => {
    const matches = rankLocalMatches("demo", buildSearchPool());
    expect(matches[0]).toBe(DEMO_PROFILE_SUBJECT);
  });
});

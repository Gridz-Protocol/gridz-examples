import { describe, expect, it } from "vitest";
import { DEMO_PROFILE_SUBJECT, demoProfileUrl, isDemoProfile } from "./demoProfile";

describe("demoProfile", () => {
  it("detects demo subject case-insensitively", () => {
    expect(isDemoProfile("demo.gridz.eth")).toBe(true);
    expect(isDemoProfile("kevin.gridz.eth")).toBe(false);
  });

  it("builds demo profile URL", () => {
    expect(demoProfileUrl()).toBe("https://demo.gridz.bio");
  });

  it("uses configured subject", () => {
    expect(DEMO_PROFILE_SUBJECT).toBe("demo.gridz.eth");
  });
});

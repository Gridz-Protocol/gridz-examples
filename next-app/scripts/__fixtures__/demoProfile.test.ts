import { describe, expect, it } from "vitest";
import { profileCellsFromFields } from "../../lib/buildProfileGrid";
import { DEMO_ENS_SUBJECT, DEMO_PROFILE_FIELDS } from "./demoProfile";

describe("DEMO_PROFILE_FIELDS", () => {
  it("maps to a full Spritz-style widget grid", () => {
    const cells = profileCellsFromFields(DEMO_PROFILE_FIELDS);
    const keys = cells.map((c) => c.key);

    expect(DEMO_ENS_SUBJECT).toBe("demo.gridz.eth");
    expect(keys).toContain("alias");
    expect(keys).toContain("url");
    expect(keys).toContain("gridz.stats");
    expect(keys).toContain("gridz.poll");
    expect(keys).toContain("gridz.currently");
    expect(keys).toContain("gridz.countdown");
    expect(keys).toContain("gridz.guestbook");
    expect(keys).toContain("gridz.message_me");
    expect(keys).toContain("gridz.keys");

    const alias = cells.find((c) => c.key === "alias");
    expect(alias?.value).toBe("Nova Chen");
  });
});

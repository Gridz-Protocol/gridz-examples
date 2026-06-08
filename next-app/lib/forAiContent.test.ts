import { describe, expect, it } from "vitest";
import { buildLlmsTxt, buildSkillMd, FOR_AI_LINKS } from "./forAiContent";

describe("forAiContent", () => {
  it("buildLlmsTxt includes agent entrypoints and API", () => {
    const txt = buildLlmsTxt();
    expect(txt).toContain("# Gridz");
    expect(txt).toContain(FOR_AI_LINKS.forAi);
    expect(txt).toContain(FOR_AI_LINKS.skillMd);
    expect(txt).toContain("/api/profile/");
    expect(txt).toContain("@gridz/mcp");
    expect(txt).toContain("demo.gridz.eth");
  });

  it("buildSkillMd includes frontmatter and workflows", () => {
    const md = buildSkillMd();
    expect(md.startsWith("---")).toBe(true);
    expect(md).toContain("name: gridz");
    expect(md).toContain("verifyGrid");
    expect(md).toContain(FOR_AI_LINKS.llmsTxt);
  });
});

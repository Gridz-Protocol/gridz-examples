import { buildSkillMd } from "../../lib/forAiContent";

export const dynamic = "force-static";

export async function GET() {
  return new Response(buildSkillMd(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

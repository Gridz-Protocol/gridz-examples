import { NextResponse } from "next/server";
import { verifyGrid } from "@gridz/core";
import { loadGrid } from "../../../../lib/loadGrid";
import { productionVerifyContext } from "../../../../lib/verifyContext";

export const maxDuration = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subject: string }> },
) {
  const { subject } = await params;
  const decoded = decodeURIComponent(subject);

  if (!decoded.includes(".")) {
    return NextResponse.json(
      { ok: false, error: "Subject must be an ENS name (e.g. kevin.gridz.eth)" },
      { status: 400 },
    );
  }

  const grid = await loadGrid(decoded);

  if (!grid) {
    return NextResponse.json(
      { ok: false, subject: decoded, grid: null, report: null, error: "Profile not found" },
      { status: 404, headers: corsHeaders() },
    );
  }

  const report = await verifyGrid(grid, productionVerifyContext(decoded));

  return NextResponse.json(
    {
      ok: report.ok,
      subject: decoded,
      grid,
      report,
      api: {
        profile: `https://gridz.bio/api/profile/${encodeURIComponent(decoded)}`,
        docs: "https://gridz.bio/docs/verification",
      },
    },
    { headers: corsHeaders() },
  );
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

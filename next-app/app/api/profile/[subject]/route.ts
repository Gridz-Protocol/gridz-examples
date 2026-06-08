import { NextResponse } from "next/server";
import { loadGrid } from "../../../../lib/loadGrid";

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
      { ok: false, subject: decoded, grid: null, error: "Profile not found" },
      { status: 404, headers: corsHeaders() },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      subject: decoded,
      grid,
      api: {
        docs: "https://gridz.bio/docs",
        render: `https://gridz.bio/${encodeURIComponent(decoded)}`,
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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";
const ENS_BASE =
  process.env.GRIDZ_ENS_BASE ?? process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const suffix = `.${SITE_DOMAIN}`;

  if (host.endsWith(suffix) && host !== `www${suffix}` && host !== SITE_DOMAIN) {
    const alias = host.slice(0, -suffix.length);
    if (alias && !alias.includes(".")) {
      const clean = alias.replace(/[^a-z0-9-]/g, "");
      if (clean) {
        const ensSubject = `${clean}.${ENS_BASE}`;
        const path = request.nextUrl.pathname;
        if (path === "/" || path === "") {
          const url = request.nextUrl.clone();
          url.pathname = `/${encodeURIComponent(ensSubject)}`;
          return NextResponse.rewrite(url);
        }
      }
    }
  }

  if (host === `docs.${SITE_DOMAIN}`) {
    const url = request.nextUrl.clone();
    if (url.pathname === "/" || url.pathname === "") {
      url.pathname = "/docs";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

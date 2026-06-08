const ENS_BASE =
  process.env.GRIDZ_ENS_BASE ?? process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

/** kevin.gridz.bio → kevin.gridz.eth */
export function ensFromSubdomain(host: string): string | null {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  const suffix = `.${SITE_DOMAIN}`;
  if (!h.endsWith(suffix) || h === `www${suffix}` || h === SITE_DOMAIN) return null;
  const alias = h.slice(0, -suffix.length);
  if (!alias || alias.includes(".")) return null;
  const clean = alias.replace(/[^a-z0-9-]/g, "");
  if (!clean) return null;
  return `${clean}.${ENS_BASE}`;
}

export function siteHomeUrl(): string {
  return `https://${SITE_DOMAIN}`;
}

export function isApexSiteHost(host: string): boolean {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return h === SITE_DOMAIN || h === `www.${SITE_DOMAIN}`;
}

export function bioUrlForEns(ensName: string): string | null {
  const base = ENS_BASE.toLowerCase();
  if (!ensName.toLowerCase().endsWith(`.${base}`)) return null;
  const alias = ensName.slice(0, -(base.length + 1));
  return `https://${alias}.${SITE_DOMAIN}`;
}

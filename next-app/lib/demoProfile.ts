/** Public demo showcase profile (signed with GRIDZ_SIGNER_KEY, published by registrar). */
export const DEMO_PROFILE_SUBJECT =
  process.env.NEXT_PUBLIC_DEMO_PROFILE_SUBJECT ?? "demo.gridz.eth";

export function isDemoProfile(subject: string): boolean {
  return subject.toLowerCase() === DEMO_PROFILE_SUBJECT.toLowerCase();
}

export function demoProfileUrl(): string {
  const alias = DEMO_PROFILE_SUBJECT.split(".")[0] ?? "demo";
  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";
  return `https://${alias}.${domain}`;
}

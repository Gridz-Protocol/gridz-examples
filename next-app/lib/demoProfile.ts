/** Public demo showcase profile (signed with GRIDZ_SIGNER_KEY, published by registrar). */
export const DEMO_PROFILE_SUBJECT =
  process.env.NEXT_PUBLIC_DEMO_PROFILE_SUBJECT ?? "demo.gridz.eth";

/** Working Commons URL — crop1 path 404s on upload.wikimedia.org. */
export const DEMO_AVATAR_URL =
  "https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg";

export function isDemoProfile(subject: string): boolean {
  return subject.toLowerCase() === DEMO_PROFILE_SUBJECT.toLowerCase();
}

export function demoProfileUrl(): string {
  const alias = DEMO_PROFILE_SUBJECT.split(".")[0] ?? "demo";
  const domain = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";
  return `https://${alias}.${domain}`;
}

/** Override broken on-chain demo avatar until next demo:publish. */
export function demoAvatarForDisplay(subject: string, chainAvatar?: string): string | undefined {
  if (!isDemoProfile(subject)) return chainAvatar;
  if (!chainAvatar || chainAvatar.includes("crop1")) return DEMO_AVATAR_URL;
  return chainAvatar;
}

const DEFAULT_IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

/** Hostnames eligible for Next.js Image optimization (must match next.config remotePatterns). */
const OPTIMIZED_HOSTS = [
  /^gateway\.pinata\.cloud$/i,
  /^[a-z0-9-]+\.mypinata\.cloud$/i,
  /^upload\.wikimedia\.org$/i,
  /^ipfs\.io$/i,
  /^cloudflare-ipfs\.com$/i,
  /^[a-z0-9-]+\.ipfs\.dweb\.link$/i,
  /^[a-z0-9-]+\.ipfs\.nftstorage\.link$/i,
  /^avatars\.githubusercontent\.com$/i,
  /^lh3\.googleusercontent\.com$/i,
  /^i\.imgur\.com$/i,
  /^images\.unsplash\.com$/i,
];

export function resolveAvatarUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("ipfs://")) {
    const cid = trimmed.slice(7).replace(/^ipfs\//, "");
    const gateway = (process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? DEFAULT_IPFS_GATEWAY).replace(/\/$/, "");
    return `${gateway}/${cid}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function canOptimizeAvatarUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return OPTIMIZED_HOSTS.some((re) => re.test(host));
  } catch {
    return false;
  }
}

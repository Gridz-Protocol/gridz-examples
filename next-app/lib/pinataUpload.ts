const V3_UPLOAD = "https://uploads.pinata.cloud/v3/files";
const LEGACY_UPLOAD = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export interface PinataUploadResult {
  cid: string;
  url: string;
}

function gatewayHost(): string {
  const raw = process.env.PINATA_GATEWAY?.trim();
  if (!raw) return "gateway.pinata.cloud";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ipfsUrl(cid: string): string {
  return `https://${gatewayHost()}/ipfs/${cid}`;
}

function resolveBearer(): string | null {
  const jwt = process.env.PINATA_JWT?.trim();
  if (jwt) return jwt;

  const key = process.env.PINATA_API_KEY?.trim();
  if (key?.startsWith("eyJ")) return key;

  return null;
}

function resolveLegacyKeys(): { key: string; secret: string } | null {
  const key = process.env.PINATA_API_KEY?.trim();
  const secret = process.env.PINATA_API_SECRET?.trim();
  if (key && secret && !key.startsWith("eyJ")) return { key, secret };
  return null;
}

export function pinataConfigured(): boolean {
  return Boolean(resolveBearer() || resolveLegacyKeys());
}

export async function uploadToPinata(
  file: File,
  opts: { name: string; ensName: string },
): Promise<PinataUploadResult> {
  const bearer = resolveBearer();
  if (bearer) return uploadV3(file, bearer, opts);

  const keys = resolveLegacyKeys();
  if (keys) return uploadLegacy(file, keys, opts);

  throw new Error(
    "Pinata is not configured. Set PINATA_JWT, or PINATA_API_KEY + PINATA_API_SECRET.",
  );
}

async function uploadV3(
  file: File,
  bearer: string,
  opts: { name: string; ensName: string },
): Promise<PinataUploadResult> {
  const body = new FormData();
  body.set("file", file);
  body.set("network", "public");
  body.set("name", opts.name);
  body.set("keyvalues", JSON.stringify({ ens: opts.ensName, type: "gridz-avatar" }));

  const res = await fetch(V3_UPLOAD, {
    method: "POST",
    headers: { Authorization: `Bearer ${bearer}` },
    body,
  });

  const json = (await res.json()) as {
    data?: { cid?: string };
    error?: string | { message?: string };
    message?: string;
  };

  if (!res.ok) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : (json.error?.message ?? json.message ?? `Pinata upload failed (${res.status})`);
    throw new Error(msg);
  }

  const cid = json.data?.cid;
  if (!cid) throw new Error("Pinata response missing CID");

  return { cid, url: ipfsUrl(cid) };
}

async function uploadLegacy(
  file: File,
  keys: { key: string; secret: string },
  opts: { name: string; ensName: string },
): Promise<PinataUploadResult> {
  const body = new FormData();
  body.set("file", file);
  body.set(
    "pinataMetadata",
    JSON.stringify({
      name: opts.name,
      keyvalues: { ens: opts.ensName, type: "gridz-avatar" },
    }),
  );
  body.set("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const res = await fetch(LEGACY_UPLOAD, {
    method: "POST",
    headers: {
      pinata_api_key: keys.key,
      pinata_secret_api_key: keys.secret,
    },
    body,
  });

  const json = (await res.json()) as { IpfsHash?: string; error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Pinata upload failed (${res.status})`);
  }

  const cid = json.IpfsHash;
  if (!cid) throw new Error("Pinata response missing IpfsHash");

  return { cid, url: ipfsUrl(cid) };
}

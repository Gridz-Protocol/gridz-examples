import {
  algoForFormat,
  valueHash,
  SCHEMA_VERSION,
  type Cell,
  type Grid,
  type Hex,
  type Subject,
  type Theme,
} from "@gridz/core";
import type { PublicClient } from "viem";
import { namehash } from "viem";
import { DEFAULT_THEME } from "./defaultTheme";

const FALLBACK_KEYS = [
  "alias",
  "description",
  "url",
  "avatar",
  "header",
  "timezone",
  "gridz.message_me",
  "gridz.stats",
  "gridz.poll",
  "gridz.currently",
  "gridz.availability_status",
  "gridz.countdown",
  "gridz.clock",
  "gridz.social_link",
  "gridz.guestbook",
  "gridz.reaction_wall",
  "gridz.goals_checklist",
  "gridz.random_fact",
  "gridz.visitor_counter",
  "com.twitter",
  "com.github",
  "com.discord",
  "social.bsky",
  "org.telegram",
] as const;

const RESOLVER_ABI = [
  {
    name: "text",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    outputs: [{ type: "string" }],
  },
  {
    name: "cellAttestation",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    outputs: [{ type: "bytes32" }],
  },
] as const;


const EAS_ADDRESS = (process.env.EAS_ADDRESS ?? "") as Hex;
const GRIDZ_CHAIN_ID = Number(process.env.GRIDZ_CHAIN_ID ?? "1");

const EAS_ABI = [
  {
    name: "getAttestation",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "uid", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "uid", type: "bytes32" },
          { name: "schema", type: "bytes32" },
          { name: "time", type: "uint64" },
          { name: "expirationTime", type: "uint64" },
          { name: "revocationTime", type: "uint64" },
          { name: "refUID", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "attester", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "data", type: "bytes" },
        ],
      },
    ],
  },
] as const;

async function easAttesterDid(client: PublicClient, uid: Hex): Promise<string | null> {
  if (!EAS_ADDRESS.startsWith("0x") || uid === ZERO_UID) return null;
  try {
    const att = await client.readContract({
      address: EAS_ADDRESS,
      abi: EAS_ABI,
      functionName: "getAttestation",
      args: [uid],
    });
    const addr = att.attester as string;
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return null;
    return `did:pkh:eip155:${GRIDZ_CHAIN_ID}:${addr.toLowerCase()}`;
  } catch {
    return null;
  }
}

const ZERO_UID = `0x${"0".repeat(64)}` as Hex;

function defaultPosition(i: number) {
  const x = i % 3;
  const y = Math.floor(i / 3);
  return { x, y, w: 1, h: 1, size: "1x1" as const };
}

async function readResolverText(
  client: PublicClient,
  resolverAddress: Hex,
  node: `0x${string}`,
  key: string,
): Promise<string | null> {
  try {
    const value = await client.readContract({
      address: resolverAddress,
      abi: RESOLVER_ABI,
      functionName: "text",
      args: [node, key],
    });
    return value || null;
  } catch {
    return null;
  }
}

async function readKeys(
  client: PublicClient,
  resolverAddress: Hex,
  node: `0x${string}`,
): Promise<string[]> {
  const manifest = await readResolverText(client, resolverAddress, node, "gridz.keys");
  if (manifest) {
    try {
      const keys = JSON.parse(manifest) as string[];
      if (Array.isArray(keys) && keys.length) {
        return [...new Set([...keys, ...FALLBACK_KEYS])];
      }
    } catch {
      /* ignore */
    }
  }
  return [...FALLBACK_KEYS];
}

export async function loadGridFromResolver(
  client: PublicClient,
  subject: string,
  resolverAddress: Hex,
): Promise<Grid | null> {
  const node = namehash(subject);
  const keys = await readKeys(client, resolverAddress, node);
  const cells: Cell[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const value = await readResolverText(client, resolverAddress, node, key);
    if (!value) continue;

    let uid: Hex = ZERO_UID;
    try {
      uid = (await client.readContract({
        address: resolverAddress,
        abi: RESOLVER_ABI,
        functionName: "cellAttestation",
        args: [node, key],
      })) as Hex;
    } catch {
      /* optional */
    }

    const pos = defaultPosition(i);
    const widget_type = key.startsWith("gridz.") ? key : undefined;
    const parsed = tryParseJson(value);
    const format = uid === ZERO_UID ? "eip712-raw" : "eas-onchain";
    const algo = algoForFormat(format);
    cells.push({
      id: key,
      key,
      value: parsed,
      ...(widget_type ? { widget_type } : {}),
      position: { x: pos.x, y: pos.y, w: pos.w, h: pos.h },
      size: pos.size,
      is_visible: !key.startsWith("gridz.att[") && key !== "gridz.owner",
      attestation: {
        format,
        uid,
        uri: uid === ZERO_UID ? `ens://${subject}/${key}` : `eas://${uid}`,
        attester: (await easAttesterDid(client, uid)) ?? subject,
        iat: "1970-01-01T00:00:00.000Z",
        value_hash: valueHash(algo, parsed),
      },
    });
  }

  if (cells.length === 0) return null;

  const alias =
    (cells.find((c) => c.key === "alias")?.value as string | undefined) ?? subject.split(".")[0];
  const gridSubject: Subject = {
    type: "human",
    did: `did:ens:${subject}`,
    ens: subject,
    display_name: alias,
  };

  const theme: Theme = DEFAULT_THEME;

  return {
    schema_version: SCHEMA_VERSION,
    subject: gridSubject,
    theme,
    cells,
    root_attestation: {
      format: "eip712-raw",
      uid: ZERO_UID,
      uri: `ens://${subject}`,
      attester: subject,
      iat: new Date().toISOString(),
      value_hash: ZERO_UID,
    },
  };
}

function tryParseJson(value: string): unknown {
  if (!value.startsWith("{") && !value.startsWith("[")) return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

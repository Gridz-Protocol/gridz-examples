import {
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
] as const;

const RESOLVER_ABI = [
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

const ZERO_UID = `0x${"0".repeat(64)}` as Hex;

function defaultPosition(i: number) {
  const x = i % 3;
  const y = Math.floor(i / 3);
  return { x, y, w: 1, h: 1, size: "1x1" as const };
}

async function readKeys(client: PublicClient, subject: string): Promise<string[]> {
  const manifest = await client.getEnsText({ name: subject, key: "gridz.keys" });
  if (manifest) {
    try {
      const keys = JSON.parse(manifest) as string[];
      if (Array.isArray(keys) && keys.length) return keys;
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
  const keys = await readKeys(client, subject);
  const cells: Cell[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const value = await client.getEnsText({ name: subject, key });
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
    cells.push({
      id: key,
      key,
      value: tryParseJson(value),
      ...(widget_type ? { widget_type } : {}),
      position: { x: pos.x, y: pos.y, w: pos.w, h: pos.h },
      size: pos.size,
      is_visible: !key.startsWith("gridz.att["),
      attestation: {
        format: uid === ZERO_UID ? "eip712-raw" : "eas-onchain",
        uid,
        uri: uid === ZERO_UID ? `ens://${subject}/${key}` : `eas://${uid}`,
        attester: subject,
        iat: new Date().toISOString(),
        value_hash: ZERO_UID,
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

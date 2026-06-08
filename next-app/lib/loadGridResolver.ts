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

const STANDARD_KEYS = ["alias", "description", "url"] as const;

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

const POSITIONS: Record<string, { x: number; y: number; w: number; h: number; size: string }> = {
  alias: { x: 0, y: 0, w: 1, h: 1, size: "1x1" },
  description: { x: 1, y: 0, w: 2, h: 1, size: "2x1" },
  url: { x: 0, y: 1, w: 1, h: 1, size: "1x1" },
};

export async function loadGridFromResolver(
  client: PublicClient,
  subject: string,
  resolverAddress: Hex,
): Promise<Grid | null> {
  const node = namehash(subject);
  const cells: Cell[] = [];

  for (const key of STANDARD_KEYS) {
    const value = await client.getEnsText({ name: subject, key });
    if (!value) continue;

    const uid = (await client.readContract({
      address: resolverAddress,
      abi: RESOLVER_ABI,
      functionName: "cellAttestation",
      args: [node, key],
    })) as Hex;

    const pos = POSITIONS[key];
    cells.push({
      id: key,
      key,
      value,
      position: { x: pos.x, y: pos.y, w: pos.w, h: pos.h },
      size: pos.size,
      is_visible: true,
      attestation: {
        format: uid === `0x${"0".repeat(64)}` ? "eip712-raw" : "eas-onchain",
        uid,
        uri: uid === `0x${"0".repeat(64)}` ? `ens://${subject}/${key}` : `eas://${uid}`,
        attester: subject,
        iat: new Date().toISOString(),
        value_hash: `0x${"0".repeat(64)}` as Hex,
      },
    });
  }

  if (cells.length === 0) return null;

  const alias = (cells.find((c) => c.key === "alias")?.value as string | undefined) ?? subject.split(".")[0];
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
      uid: `0x${"0".repeat(64)}`,
      uri: `ens://${subject}`,
      attester: subject,
      iat: new Date().toISOString(),
      value_hash: `0x${"0".repeat(64)}` as Hex,
    },
  };
}

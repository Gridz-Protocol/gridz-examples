import { decodeBundle, type Cell, type Grid, type Hex } from "@gridz/core";
import { countCellsToPublish } from "./incrementalProfileGrid";
import { getUIDsFromAttestReceipt } from "@ethereum-attestation-service/eas-sdk";
import type { PublicClient, WalletClient } from "viem";
import {
  encodeAbiParameters,
  getAddress,
  namehash,
  parseAbiParameters,
  } from "viem";

const CELL_SCHEMA_PARAMS = parseAbiParameters(
  "bytes32 gridId, string key, string valueHashHex, uint64 expiresAt, bytes32 widgetTypeHash",
);

const EAS_ABI = [
  {
    type: "function",
    name: "attest",
    stateMutability: "payable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ type: "bytes32" }],
  },
] as const;


const RESOLVER_ABI = [
  {
    name: "setCellAttestation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "uid", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;


function shouldPublishCell(cell: Cell, chainBaseline: Grid | null | undefined): boolean {
  if (!chainBaseline) return true;
  const onChain = chainBaseline.cells.find((c) => c.key === cell.key);
  if (!onChain?.attestation?.value_hash || !cell.attestation?.value_hash) return true;
  return onChain.attestation.value_hash !== cell.attestation.value_hash;
}

function displayValue(cell: Cell): string {
  if (typeof cell.value === "string") return cell.value;
  return JSON.stringify(cell.value);
}

function easFieldsFromCell(cell: Cell): {
  gridId: Hex;
  key: string;
  valueHashHex: string;
  expiresAt: bigint;
  widgetTypeHash: Hex;
} {
  const payload = cell.attestation.payload;
  if (!payload) throw new Error(`Cell ${cell.key} missing attestation payload`);
  const bundle = decodeBundle(payload);
  if (bundle.kind !== "eip712" || bundle.primaryType !== "GridzCell") {
    throw new Error(`Cell ${cell.key} requires an EIP-712 payload`);
  }
  const msg = bundle.message;
  return {
    gridId: msg.gridId as Hex,
    key: msg.key,
    valueHashHex: displayValue(cell),
    expiresAt: BigInt(msg.expiresAt),
    widgetTypeHash: msg.widgetTypeHash as Hex,
  };
}

function encodeCellAttestationData(fields: ReturnType<typeof easFieldsFromCell>): Hex {
  return encodeAbiParameters(CELL_SCHEMA_PARAMS, [
    fields.gridId,
    fields.key,
    fields.valueHashHex,
    fields.expiresAt,
    fields.widgetTypeHash,
  ]);
}

export async function publishGridViaEas(
  grid: Grid,
  ensName: string,
  opts: {
    easAddress: Hex;
    cellSchema: Hex;
    resolverAddress: Hex;
    publicClient: PublicClient;
    walletClient: WalletClient;
    chainBaseline?: Grid | null;
  },
): Promise<{ txCount: number; uids: Hex[]; publishedCellCount: number; skippedCellCount: number }> {
  const { easAddress, cellSchema, resolverAddress, publicClient, walletClient } = opts;
  const account = walletClient.account;
  if (!account) throw new Error("Registrar wallet account required");

  const eas = getAddress(easAddress);
  const resolver = getAddress(resolverAddress);
  const node = namehash(ensName);
  const zero = getAddress("0x0000000000000000000000000000000000000000");

  // Publish sequentially — parallel txs from one registrar wallet cause nonce collisions
  // and partial publishes (e.g. alias saved but url missing).
  const chainBaseline = opts.chainBaseline;
  const ordered = [...grid.cells]
    .filter((cell) => shouldPublishCell(cell, chainBaseline))
    .sort((a, b) => {
      if (a.key === "gridz.keys") return 1;
      if (b.key === "gridz.keys") return -1;
      return 0;
    });

  const skippedCellCount = grid.cells.length - ordered.length;
  if (ordered.length === 0) {
    return { txCount: 0, uids: [], publishedCellCount: 0, skippedCellCount };
  }

  const uids: Hex[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const cell = ordered[i]!;
    console.log(`[publish] ${i + 1}/${ordered.length} ${cell.key}…`);
    const fields = easFieldsFromCell(cell);
    const encoded = encodeCellAttestationData(fields);
    const request = {
      schema: cellSchema,
      data: {
        recipient: zero,
        expirationTime: 0n,
        revocable: true,
        refUID: "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex,
        data: encoded,
        value: 0n,
      },
    } as const;

    const attestHash = await walletClient.writeContract({
      account,
      chain: walletClient.chain,
      address: eas,
      abi: EAS_ABI,
      functionName: "attest",
      args: [request],
    });
    const attestReceipt = await publicClient.waitForTransactionReceipt({ hash: attestHash, timeout: 600_000 });
    if (attestReceipt.status !== "success") {
      throw new Error(`EAS attest for ${cell.key} reverted (tx ${attestHash})`);
    }
    const uid = getUIDsFromAttestReceipt(attestReceipt as never)[0] as Hex | undefined;
    if (!uid) throw new Error(`EAS attest for ${cell.key} did not emit an Attested event`);

    const linkHash = await walletClient.writeContract({
      account,
      chain: walletClient.chain,
      address: resolver,
      abi: RESOLVER_ABI,
      functionName: "setCellAttestation",
      args: [node, cell.key, uid],
    });
    const linkReceipt = await publicClient.waitForTransactionReceipt({ hash: linkHash, timeout: 600_000 });
    if (linkReceipt.status !== "success") {
      throw new Error(`setCellAttestation for ${cell.key} reverted (tx ${linkHash})`);
    }

    uids.push(uid);
  }

  return { txCount: ordered.length * 2, uids, publishedCellCount: ordered.length, skippedCellCount };
}

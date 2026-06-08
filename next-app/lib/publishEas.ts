import { decodeBundle, type Cell, type Grid, type Hex } from "@gridz/core";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { PublicClient, WalletClient } from "viem";
import { getAddress, namehash } from "viem";

const CELL_SCHEMA_STRING =
  "bytes32 gridId, string key, string valueHashHex, uint64 expiresAt, bytes32 widgetTypeHash";

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

export async function publishGridViaEas(
  grid: Grid,
  ensName: string,
  opts: {
    easAddress: Hex;
    cellSchema: Hex;
    resolverAddress: Hex;
    publicClient: PublicClient;
    walletClient: WalletClient;
  },
): Promise<{ txCount: number; uids: Hex[] }> {
  const { easAddress, cellSchema, resolverAddress, publicClient, walletClient } = opts;
  const account = walletClient.account;
  if (!account) throw new Error("Registrar wallet account required");

  const eas = new EAS(easAddress);
  eas.connect(walletClient as never);

  const encoder = new SchemaEncoder(CELL_SCHEMA_STRING);
  const node = namehash(ensName);
  const uids: Hex[] = [];
  let txCount = 0;

  for (const cell of grid.cells) {
    const fields = easFieldsFromCell(cell);
    const encoded = encoder.encodeData([
      { name: "gridId", value: fields.gridId, type: "bytes32" },
      { name: "key", value: fields.key, type: "string" },
      { name: "valueHashHex", value: fields.valueHashHex, type: "string" },
      { name: "expiresAt", value: fields.expiresAt, type: "uint64" },
      { name: "widgetTypeHash", value: fields.widgetTypeHash, type: "bytes32" },
    ]);

    const tx = await eas.attest({
      schema: cellSchema,
      data: {
        recipient: getAddress("0x0000000000000000000000000000000000000000"),
        expirationTime: 0n,
        revocable: true,
        data: encoded,
      },
    });
    const uid = (await tx.wait()) as Hex;
    uids.push(uid);

    const linkHash = await walletClient.writeContract({
      account,
      chain: walletClient.chain,
      address: resolverAddress,
      abi: RESOLVER_ABI,
      functionName: "setCellAttestation",
      args: [node, cell.key, uid],
    });
    await publicClient.waitForTransactionReceipt({ hash: linkHash });
    txCount += 2;
  }

  return { txCount, uids };
}

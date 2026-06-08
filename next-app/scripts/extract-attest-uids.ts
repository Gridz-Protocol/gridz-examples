/** Extract { key, uid }[] from EAS attest tx hashes. */
import { getUIDsFromAttestReceipt } from "@ethereum-attestation-service/eas-sdk";
import { createPublicClient, decodeAbiParameters, http } from "viem";
import { gridzChainForId } from "../lib/gridzChain";
import type { Hex } from "viem";

const EAS = "0xA1207F3BB47Bd8eB7B9eAfD9BeB7cAe66ebFcF3C" as const;
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

async function main() {
  const hashes = process.argv.slice(2) as Hex[];
  if (hashes.length === 0) {
    console.error("Usage: pnpm tsx scripts/extract-attest-uids.ts <txHash>...");
    process.exit(1);
  }
  const client = createPublicClient({ chain: gridzChainForId(Number(process.env.GRIDZ_CHAIN_ID ?? "1")), transport: http(process.env.GRIDZ_RPC_URL ?? "https://base.publicnode.com") });
  const pairs: { key: string; uid: string }[] = [];
  for (const hash of hashes) {
    const receipt = await client.getTransactionReceipt({ hash });
    const uid = getUIDsFromAttestReceipt(receipt as never)[0] as Hex;
    const att = await client.readContract({
      address: EAS,
      abi: EAS_ABI,
      functionName: "getAttestation",
      args: [uid],
    });
    const [, key] = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "string" }, { type: "string" }, { type: "uint64" }, { type: "bytes32" }],
      att.data,
    );
    pairs.push({ key, uid });
  }
  console.log(JSON.stringify(pairs, null, 2));
}

main();

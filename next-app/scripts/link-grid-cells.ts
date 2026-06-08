/**
 * Link existing EAS attestation UIDs on GridzResolver (no new EAS attest txs).
 * Use when attest succeeded but resolver linking failed (e.g. low gas / multicall bug).
 *
 * Usage:
 *   pnpm tsx scripts/link-grid-cells.ts 1claw.gridz.eth scripts/link-1claw.json
 *
 * JSON format: [{ "key": "alias", "uid": "0x..." }, ...]
 */
import { readFileSync, existsSync } from "fs";
import { createPublicClient, createWalletClient, getAddress, http, namehash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gridzChainForId } from "../lib/gridzChain";
import type { Hex } from "viem";

function loadEnv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

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

async function main() {
  const ensName = process.argv[2];
  const linksPath = process.argv[3];
  if (!ensName?.includes(".") || !linksPath) {
    console.error("Usage: pnpm tsx scripts/link-grid-cells.ts <ensName> <links.json>");
    process.exit(1);
  }

  const env = { ...loadEnv("../../.env"), ...loadEnv(".env.local") };
  const key = env.REGISTRAR_PRIVATE_KEY ?? env.DEPLOYER_PRIVATE_KEY;
  const resolver = env.GRIDZ_RESOLVER as Hex | undefined;
  const chainId = Number(env.GRIDZ_CHAIN_ID ?? "1");
  const chain = gridzChainForId(chainId);
  const rpc =
    env.GRIDZ_RPC_URL ??
    (chainId === 8453 ? "https://base.publicnode.com" : "https://ethereum.publicnode.com");
  if (!key?.startsWith("0x") || !resolver?.startsWith("0x")) {
    console.error("Set REGISTRAR_PRIVATE_KEY and GRIDZ_RESOLVER in .env");
    process.exit(1);
  }

  const links = JSON.parse(readFileSync(linksPath, "utf8")) as { key: string; uid: Hex }[];
  const account = privateKeyToAccount(key as Hex);
  const publicClient = createPublicClient({ chain, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain, transport: http(rpc) });
  const node = namehash(ensName);
  const resolverAddr = getAddress(resolver);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Registrar ${account.address} balance: ${Number(balance) / 1e18} ETH`);
  console.log(`Linking ${links.length} cell(s) on ${ensName}…`);

  for (let i = 0; i < links.length; i++) {
    const { key: cellKey, uid } = links[i]!;
    console.log(`  ${i + 1}/${links.length} ${cellKey} → ${uid.slice(0, 10)}…`);
    const hash = await walletClient.writeContract({
      account,
      chain,
      address: resolverAddr,
      abi: RESOLVER_ABI,
      functionName: "setCellAttestation",
      args: [node, cellKey, uid],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 600_000 });
    if (receipt.status !== "success") {
      throw new Error(`setCellAttestation reverted for ${cellKey} (tx ${hash})`);
    }
    console.log(`    ok ${hash}`);
  }

  console.log("Done — profile should resolve at gridz.bio after cache refresh.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

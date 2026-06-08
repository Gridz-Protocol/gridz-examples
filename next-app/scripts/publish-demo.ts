/**
 * Sign the demo profile with GRIDZ_SIGNER_KEY and publish via EAS + registrar.
 *
 *   GRIDZ_SIGNER_KEY=0x... REGISTRAR_PRIVATE_KEY=0x... pnpm publish-demo
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LocalEip712Signer, buildGrid } from "@gridz/core";
import { createPublicClient, createWalletClient, getAddress, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia } from "viem/chains";
import { DEFAULT_THEME } from "../lib/defaultTheme";
import { profileCellsFromFields } from "../lib/buildProfileGrid";
import { publishGridViaEas } from "../lib/publishEas";
import { DEMO_ENS_SUBJECT, DEMO_PROFILE_FIELDS } from "./__fixtures__/demoProfile";

const APP_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(join(APP_ROOT, ".env.local"));
loadEnvFile(join(APP_ROOT, "../../.env"));

const ensName = process.env.GRIDZ_DEMO_SUBJECT ?? DEMO_ENS_SUBJECT;
const signerKey = process.env.GRIDZ_SIGNER_KEY as Hex | undefined;
const registrarKey = (process.env.REGISTRAR_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY) as Hex | undefined;
const resolverRaw = process.env.GRIDZ_RESOLVER as Hex | undefined;
const easRaw = process.env.EAS_ADDRESS as Hex | undefined;
const cellSchema = process.env.CELL_SCHEMA as Hex | undefined;
const rpc = process.env.GRIDZ_RPC_URL ?? "https://ethereum.publicnode.com";
const chainId = Number(process.env.GRIDZ_CHAIN_ID ?? "1");

function chainForId(id: number) {
  return id === 11155111 ? sepolia : mainnet;
}

async function main() {
  if (!signerKey?.startsWith("0x")) {
    console.error("Missing GRIDZ_SIGNER_KEY — dedicated demo signer (not the registrar).");
    process.exit(1);
  }
  if (!registrarKey?.startsWith("0x")) {
    console.error("Missing REGISTRAR_PRIVATE_KEY or DEPLOYER_PRIVATE_KEY for EAS publish.");
    process.exit(1);
  }
  if (!resolverRaw?.startsWith("0x") || !easRaw?.startsWith("0x") || !cellSchema?.startsWith("0x")) {
    console.error("Missing GRIDZ_RESOLVER, EAS_ADDRESS, or CELL_SCHEMA.");
    process.exit(1);
  }

  const resolver = getAddress(resolverRaw);
  const easAddress = getAddress(easRaw);
  const chain = chainForId(chainId);

  const signer = LocalEip712Signer.fromPrivateKey(signerKey, chainId);
  const did = await signer.did();
  const signerAddress = signer.address;

  console.log(`Signing demo profile for ${ensName} as ${signerAddress}…`);
  const grid = await buildGrid(signer, {
    subject: {
      type: "human",
      did,
      ens: ensName,
      display_name: DEMO_PROFILE_FIELDS.alias.trim() || ensName.split(".")[0],
    },
    theme: DEFAULT_THEME,
    chainId,
    verifyingContract: resolver,
    cells: profileCellsFromFields(DEMO_PROFILE_FIELDS),
  });
  console.log(`Signed ${grid.cells.length} cells (including gridz.keys manifest).`);

  const registrarAccount = privateKeyToAccount(registrarKey);
  const transport = http(rpc);
  const publicClient = createPublicClient({ chain, transport });
  const registrarClient = createWalletClient({ account: registrarAccount, chain, transport });

  console.log("Publishing to EAS + GridzResolver (sequential txs)…");
  const { txCount, uids } = await publishGridViaEas(grid, ensName, {
    easAddress,
    cellSchema,
    resolverAddress: resolver,
    publicClient,
    walletClient: registrarClient,
  });

  console.log(`✓ Published ${uids.length} cells (${txCount} txs) → ${ensName}`);
  console.log(`  View: https://gridz.bio/${encodeURIComponent(ensName)}`);
  console.log(`  API:  https://gridz.bio/api/profile/${encodeURIComponent(ensName)}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

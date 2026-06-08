import { NextResponse } from "next/server";

// Six mainnet txs (EAS attest + resolver link per cell) can take 1–2 minutes.
export const maxDuration = 300;
import type { Grid, Hex } from "@gridz/core";
import { createPublicClient, createWalletClient, getAddress, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia } from "viem/chains";
import { publishGridViaEas } from "../../../lib/publishEas";
import { loadGrid } from "../../../lib/loadGrid";

function chainForId(chainId: number) {
  return chainId === 11155111 ? sepolia : mainnet;
}

export async function POST(request: Request) {
  const registrarKey = process.env.REGISTRAR_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY;
  const resolverRaw = process.env.GRIDZ_RESOLVER as Hex | undefined;
  const easRaw = process.env.EAS_ADDRESS as Hex | undefined;
  const cellSchema = process.env.CELL_SCHEMA as Hex | undefined;
  let resolver: Hex | undefined;
  let easAddress: Hex | undefined;
  try {
    if (resolverRaw?.startsWith("0x")) resolver = getAddress(resolverRaw);
    if (easRaw?.startsWith("0x")) easAddress = getAddress(easRaw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid GRIDZ_RESOLVER or EAS_ADDRESS checksum." }, { status: 503 });
  }
  const rpc = process.env.GRIDZ_RPC_URL ?? "https://ethereum.publicnode.com";
  const chainId = Number(process.env.GRIDZ_CHAIN_ID ?? "1");

  if (!registrarKey?.startsWith("0x") || !resolver?.startsWith("0x")) {
    return NextResponse.json(
      { ok: false, error: "Server publish is not configured (REGISTRAR_PRIVATE_KEY / GRIDZ_RESOLVER)." },
      { status: 503 },
    );
  }

  if (!easAddress?.startsWith("0x") || !cellSchema?.startsWith("0x")) {
    return NextResponse.json(
      { ok: false, error: "Server publish requires EAS_ADDRESS and CELL_SCHEMA in env." },
      { status: 503 },
    );
  }

  let body: { ensName?: string; grid?: Grid };
  try {
    body = (await request.json()) as { ensName?: string; grid?: Grid };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { ensName, grid } = body;
  if (!ensName?.includes(".") || !grid?.cells?.length) {
    return NextResponse.json({ ok: false, error: "ensName and signed grid required." }, { status: 400 });
  }

  try {
    const chain = chainForId(chainId);
    const account = privateKeyToAccount(registrarKey as Hex);
    const publicClient = createPublicClient({ chain, transport: http(rpc) });
    const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

    const balance = await publicClient.getBalance({ address: account.address });
    const cellCount = grid.cells.length;
    // ~2 registrar txs per changed cell (EAS attest + resolver link); keep headroom for gas spikes.
    const minWei = parseEther("0.002") + BigInt(cellCount) * parseEther("0.0004");
    if (balance < minWei) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Registrar wallet is low on ETH (${(Number(balance) / 1e18).toFixed(4)} ETH). ` +
            `Publishing ${cellCount} field(s) needs more mainnet gas — contact the gridz.bio operator to top up the registrar.`,
        },
        { status: 503 },
      );
    }

    const chainBaseline = await loadGrid(ensName);
    const { txCount, publishedCellCount, skippedCellCount } = await publishGridViaEas(grid, ensName, {
      easAddress,
      cellSchema,
      resolverAddress: resolver,
      publicClient,
      walletClient,
      chainBaseline,
    });

    return NextResponse.json({ ok: true, txCount, publishedCellCount, skippedCellCount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

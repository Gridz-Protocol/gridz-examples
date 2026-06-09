import { NextResponse } from "next/server";

// EAS attest + resolver link per cell can take 1–2 minutes on any chain.
export const maxDuration = 300;
import type { Grid, Hex } from "@gridz/core";
import { createPublicClient, createWalletClient, formatEther, getAddress, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { publishGridViaEas } from "../../../lib/publishEas";
import { loadGrid } from "../../../lib/loadGrid";
import { gridzChainForId } from "../../../lib/gridzChain";
import { friendlyPublishError } from "../../../lib/publishTx";
import { canPublishProfile } from "../../../lib/canEditProfile";

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
  const chainId = Number(process.env.GRIDZ_CHAIN_ID ?? "1");
  const rpc =
    process.env.GRIDZ_RPC_URL ??
    (chainId === 8453 ? "https://base.publicnode.com" : "https://ethereum.publicnode.com");

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
    const chain = gridzChainForId(chainId);
    const account = privateKeyToAccount(registrarKey as Hex);
    const publicClient = createPublicClient({ chain, transport: http(rpc) });
    const walletClient = createWalletClient({ account, chain, transport: http(rpc) });

    const balance = await publicClient.getBalance({ address: account.address });
    const minBalance = parseEther("0.0005");
    if (balance < minBalance) {
      return NextResponse.json(
        {
          ok: false,
          error: `Registrar wallet is low on ETH (${formatEther(balance)} ETH). Top up the registrar on ${chain.name}.`,
        },
        { status: 503 },
      );
    }

    const chainBaseline = await loadGrid(ensName);
    const registrarAddress = account.address;
    if (
      !canPublishProfile({
        chainGrid: chainBaseline,
        incomingGrid: grid,
        chainId,
        registrarAddress,
      })
    ) {
      return NextResponse.json(
        { ok: false, error: "This profile is already owned by another wallet." },
        { status: 403 },
      );
    }

    const { txCount, publishedCellCount, skippedCellCount } = await publishGridViaEas(grid, ensName, {
      easAddress,
      cellSchema,
      resolverAddress: resolver,
      publicClient,
      walletClient,
      chainBaseline,
      mode: "registrar",
    });

    return NextResponse.json({ ok: true, txCount, publishedCellCount, skippedCellCount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: friendlyPublishError(e) }, { status: 500 });
  }
}

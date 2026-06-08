import { NextResponse } from "next/server";
import type { Grid, Hex } from "@gridz/core";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia } from "viem/chains";
import { publishGridViaEas } from "../../../lib/publishEas";

function chainForId(chainId: number) {
  return chainId === 11155111 ? sepolia : mainnet;
}

export async function POST(request: Request) {
  const registrarKey = process.env.REGISTRAR_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY;
  const resolver = process.env.GRIDZ_RESOLVER as Hex | undefined;
  const easAddress = process.env.EAS_ADDRESS as Hex | undefined;
  const cellSchema = process.env.CELL_SCHEMA as Hex | undefined;
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

    const { txCount } = await publishGridViaEas(grid, ensName, {
      easAddress,
      cellSchema,
      resolverAddress: resolver,
      publicClient,
      walletClient,
    });

    return NextResponse.json({ ok: true, txCount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

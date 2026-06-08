import type { Grid, Hex } from "@gridz/core";
import { EnsSink, type EnsBackend } from "@gridz/sinks";
import { createPublicClient, http, type Chain } from "viem";
import { gridzChainForId } from "./gridzChain";
import { isEnsSubject } from "./ensNames";
import { loadGridFromResolver } from "./loadGridResolver";

class ReadOnlyEnsBackend implements EnsBackend {
  constructor(
    private readonly client: {
      getEnsText(args: { name: string; key: string }): Promise<string | null>;
    },
  ) {}

  async getText(name: string, key: string): Promise<string | null> {
    return this.client.getEnsText({ name, key });
  }

  async setText(): Promise<{ txHash: string }> {
    throw new Error("read-only ENS backend");
  }
}


export async function loadGrid(subject: string): Promise<Grid | null> {
  if (!isEnsSubject(subject)) return null;

  const chainId = Number(process.env.GRIDZ_CHAIN_ID ?? "1");
  const rpc =
    process.env.GRIDZ_RPC_URL ??
    (chainId === 8453 ? "https://base.publicnode.com" : "https://ethereum.publicnode.com");
  const resolver = process.env.GRIDZ_RESOLVER as Hex | undefined;
  const client = createPublicClient({ chain: gridzChainForId(chainId), transport: http(rpc) });

  if (resolver?.startsWith("0x")) {
    const fromResolver = await loadGridFromResolver(client, subject, resolver);
    if (fromResolver) return fromResolver;
  }

  // ENS text fallback only works on chains with a universal resolver (L1 / Sepolia).
  if (chainId !== 1 && chainId !== 11155111) return null;

  try {
    const sink = new EnsSink(new ReadOnlyEnsBackend(client), subject);
    return await sink.readGrid();
  } catch {
    return null;
  }
}

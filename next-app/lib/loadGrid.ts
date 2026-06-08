import type { Grid, Hex } from "@gridz/core";
import { EnsSink, type EnsBackend } from "@gridz/sinks";
import { createPublicClient, http, type Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";
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

function chainForId(chainId: number): Chain {
  return chainId === 11155111 ? sepolia : mainnet;
}

export async function loadGrid(subject: string): Promise<Grid | null> {
  if (!isEnsSubject(subject)) return null;

  const rpc = process.env.GRIDZ_RPC_URL ?? "https://ethereum.publicnode.com";
  const chainId = Number(process.env.GRIDZ_CHAIN_ID ?? "1");
  const resolver = process.env.GRIDZ_RESOLVER as Hex | undefined;
  const client = createPublicClient({ chain: chainForId(chainId), transport: http(rpc) });

  const sink = new EnsSink(new ReadOnlyEnsBackend(client), subject);
  const manifest = await sink.readGrid();
  if (manifest) return manifest;

  if (resolver?.startsWith("0x")) {
    return loadGridFromResolver(client, subject, resolver);
  }

  return null;
}

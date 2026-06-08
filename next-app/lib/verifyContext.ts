import type { VerifyContext } from "@gridz/core";
import { createPublicClient, http } from "viem";
import { gridzChainForId } from "./gridzChain";
import { GRIDZ_BASE_MAINNET } from "./gridzDeployments";

/** Build verify context with Base EAS + resolver RPC reads for on-chain cells. */
export function productionVerifyContext(subject?: string): VerifyContext {
  const d = GRIDZ_BASE_MAINNET;
  const rpc =
    process.env.GRIDZ_RPC_URL ?? process.env.NEXT_PUBLIC_GRIDZ_RPC_URL ?? d.rpc;
  const easAddress = (process.env.EAS_ADDRESS ??
    process.env.NEXT_PUBLIC_EAS_ADDRESS ??
    d.eas) as typeof d.eas;
  const cellSchema = (process.env.CELL_SCHEMA ??
    process.env.NEXT_PUBLIC_CELL_SCHEMA ??
    d.cellSchema) as typeof d.cellSchema;
  const resolver = (process.env.GRIDZ_RESOLVER ??
    process.env.NEXT_PUBLIC_GRIDZ_RESOLVER ??
    d.gridzResolver) as typeof d.gridzResolver;

  const client = createPublicClient({
    chain: gridzChainForId(d.chainId),
    transport: http(rpc, { timeout: 30_000 }),
  });

  return {
    allowDelegated: true,
    eas: {
      chainId: d.chainId,
      easAddress,
      cellSchemaUid: cellSchema,
      resolverAddress: resolver,
      subjectEns: subject,
      readContract: (args) => client.readContract(args as never),
    },
  };
}

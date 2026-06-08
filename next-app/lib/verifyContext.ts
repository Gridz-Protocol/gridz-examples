import type { VerifyContext } from "@gridz/core";
import { createPublicClient, http } from "viem";
import { gridzChainForId } from "./gridzChain";
import { GRIDZ_BASE_MAINNET } from "./gridzDeployments";

/** Build verify context with Base EAS + resolver RPC reads for on-chain cells. */
export function productionVerifyContext(subject?: string): VerifyContext {
  const d = GRIDZ_BASE_MAINNET;
  const client = createPublicClient({
    chain: gridzChainForId(d.chainId),
    transport: http(d.rpc),
  });

  return {
    allowDelegated: true,
    eas: {
      chainId: d.chainId,
      easAddress: d.eas,
      cellSchemaUid: d.cellSchema,
      resolverAddress: d.gridzResolver,
      subjectEns: subject,
      readContract: (args) => client.readContract(args as never),
    },
  };
}

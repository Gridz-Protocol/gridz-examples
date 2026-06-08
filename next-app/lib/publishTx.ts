import type { Abi, Address, ContractFunctionArgs, ContractFunctionName, Hash, PublicClient, WalletClient } from "viem";
import { parseGwei } from "viem";

const RETRYABLE = /replacement transaction underpriced|nonce too low|already known/i;

function bumpFee(value: bigint, attempt: number): bigint {
  const pct = BigInt(15 * (attempt + 1));
  return value + (value * pct) / 100n;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wait until the registrar has no pending txs (avoids nonce collisions on retry). */
export async function waitForClearNonce(
  publicClient: PublicClient,
  address: Address,
  maxWaitMs = 120_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const [pending, latest] = await Promise.all([
      publicClient.getTransactionCount({ address, blockTag: "pending" }),
      publicClient.getTransactionCount({ address, blockTag: "latest" }),
    ]);
    if (pending === latest) return;
    await sleep(3000);
  }
}

type WriteParams<
  TAbi extends Abi,
  TName extends ContractFunctionName<TAbi, "nonpayable" | "payable">,
> = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  address: Address;
  abi: TAbi;
  functionName: TName;
  args: ContractFunctionArgs<TAbi, "nonpayable" | "payable", TName>;
  maxAttempts?: number;
};

export async function writeContractReliable<
  TAbi extends Abi,
  TName extends ContractFunctionName<TAbi, "nonpayable" | "payable">,
>(params: WriteParams<TAbi, TName>): Promise<Hash> {
  const { walletClient, publicClient, maxAttempts = 5 } = params;
  const account = walletClient.account;
  if (!account) throw new Error("Wallet account required");

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const fees = await publicClient.estimateFeesPerGas().catch(() => null);
      const maxFeePerGas = bumpFee(fees?.maxFeePerGas ?? parseGwei("0.05"), attempt);
      const maxPriorityFeePerGas = bumpFee(fees?.maxPriorityFeePerGas ?? parseGwei("0.01"), attempt);
      const nonce = await publicClient.getTransactionCount({
        address: account.address,
        blockTag: "pending",
      });

      return await walletClient.writeContract({
        account,
        chain: walletClient.chain,
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
        nonce,
        maxFeePerGas,
        maxPriorityFeePerGas,
      } as never);
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      if (!RETRYABLE.test(msg) || attempt === maxAttempts - 1) throw e;
      await sleep(2500 * (attempt + 1));
    }
  }

  throw lastError;
}

export function friendlyPublishError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (RETRYABLE.test(msg)) {
    return "A previous publish transaction is still pending on Base. Wait 1–2 minutes, then try Sign & publish again.";
  }
  if (msg.includes("insufficient funds")) {
    return "Registrar wallet is low on ETH for Base gas. Try again later or contact support.";
  }
  const short = msg.split("\n")[0]?.trim() ?? msg;
  return short.length > 280 ? `${short.slice(0, 277)}…` : short;
}

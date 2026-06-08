import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base, mainnet, sepolia } from "viem/chains";
import { gridzChainForId } from "./gridzChain";

export const GRIDZ_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? "1");

const activeChain = gridzChainForId(GRIDZ_CHAIN_ID);
const chains = [activeChain] as const;

const rpcByChain: Record<number, string> = {
  [mainnet.id]: process.env.NEXT_PUBLIC_GRIDZ_RPC_URL?.trim() || "https://ethereum.publicnode.com",
  [sepolia.id]: "https://ethereum-sepolia.publicnode.com",
  [base.id]: process.env.NEXT_PUBLIC_GRIDZ_RPC_URL?.trim() || "https://base.publicnode.com",
};

/**
 * WalletConnect / Reown project id — https://cloud.reown.com (free).
 * Add https://gridz.bio and https://*.gridz.bio to the project allowlist.
 * Injected wallets (MetaMask, Rabby, etc.) work without this.
 */
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ||
  "00000000000000000000000000000000";

export const wagmiConfig = getDefaultConfig({
  appName: "Gridz",
  projectId,
  chains,
  ssr: true,
  transports: {
    [mainnet.id]: http(rpcByChain[mainnet.id]),
    [sepolia.id]: http(rpcByChain[sepolia.id]),
    [base.id]: http(rpcByChain[base.id]),
  },
});

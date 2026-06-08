import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export const GRIDZ_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? "1");

const chains = GRIDZ_CHAIN_ID === 11155111 ? ([sepolia] as const) : ([mainnet] as const);

/** Browser-safe RPC — avoids eth.merkle.io CORS failures in the client. */
const mainnetRpc =
  process.env.NEXT_PUBLIC_GRIDZ_RPC_URL?.trim() || "https://ethereum.publicnode.com";
const sepoliaRpc = "https://ethereum-sepolia.publicnode.com";

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
    [mainnet.id]: http(mainnetRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
});

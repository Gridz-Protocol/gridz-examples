export interface ChainOption {
  id: number;
  name: string;
}

/** Common EVM chains for org token listings. */
export const CHAIN_OPTIONS: ChainOption[] = [
  { id: 1, name: "Ethereum" },
  { id: 8453, name: "Base" },
  { id: 42161, name: "Arbitrum" },
  { id: 10, name: "Optimism" },
  { id: 137, name: "Polygon" },
  { id: 56, name: "BNB Chain" },
];

const EXPLORER: Record<number, string> = {
  1: "https://etherscan.io/token/",
  8453: "https://basescan.org/token/",
  42161: "https://arbiscan.io/token/",
  10: "https://optimistic.etherscan.io/token/",
  137: "https://polygonscan.com/token/",
  56: "https://bscscan.com/token/",
};

export function chainName(chainId: number): string {
  return CHAIN_OPTIONS.find((c) => c.id === chainId)?.name ?? `Chain ${chainId}`;
}

export function explorerTokenUrl(chainId: number, address: string): string {
  const base = EXPLORER[chainId] ?? "https://etherscan.io/token/";
  return `${base}${address}`;
}

export function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

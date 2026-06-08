import { base, mainnet, sepolia, type Chain } from "viem/chains";

export function gridzChainForId(chainId: number): Chain {
  if (chainId === 11155111) return sepolia;
  if (chainId === 8453) return base;
  return mainnet;
}

export function gridzChainLabel(chainId: number): string {
  if (chainId === 1) return "Ethereum";
  if (chainId === 11155111) return "Sepolia";
  if (chainId === 8453) return "Base";
  return `Chain ${chainId}`;
}

export function easExplorerUrl(chainId: number, uid?: string): string {
  const baseUrl =
    chainId === 8453
      ? "https://base.easscan.org"
      : chainId === 11155111
        ? "https://sepolia.easscan.org"
        : "https://easscan.org";
  return uid ? `${baseUrl}/attestation/view/${uid}` : baseUrl;
}

export const GRIDZ_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? "1");

import type { Grid } from "@gridz/core";

/** True when the connected wallet signed this grid (or matches subject DID). */
export function isProfileOwner(
  grid: Grid,
  walletAddress: string | null | undefined,
  chainId: number,
): boolean {
  if (!walletAddress) return false;
  const did = `did:pkh:eip155:${chainId}:${walletAddress.toLowerCase()}`;
  if (grid.subject.did?.toLowerCase() === did) return true;
  return grid.cells.some((c) => c.attestation?.attester?.toLowerCase() === did);
}

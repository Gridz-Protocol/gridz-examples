import type { Grid } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import { isProfileOwner } from "./isProfileOwner";

/** Whether the visitor may open the profile editor (claim, edit, publish). */
export function canEditProfile(params: {
  chainGrid: Grid | null;
  draftBundle: DraftBundle | null;
  walletAddress: string | null | undefined;
  chainId: number;
}): boolean {
  const { chainGrid, draftBundle, walletAddress, chainId } = params;

  if (!chainGrid) return true;

  // In-progress claim in this browser — e.g. partial registrar publish left wrong on-chain attester.
  if (draftBundle) return true;

  return isProfileOwner(chainGrid, walletAddress, chainId);
}

/** True when the connected wallet attested the on-chain or locally signed grid. */
export function isProfileSigner(params: {
  chainGrid: Grid | null;
  draftBundle: DraftBundle | null;
  walletAddress: string | null | undefined;
  chainId: number;
}): boolean {
  const { chainGrid, draftBundle, walletAddress, chainId } = params;
  const signed = draftBundle?.signedBaseline;
  if (signed) return isProfileOwner(signed, walletAddress, chainId);
  if (chainGrid) return isProfileOwner(chainGrid, walletAddress, chainId);
  return false;
}

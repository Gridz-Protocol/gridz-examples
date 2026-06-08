import type { Grid } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import { isProfileOwner } from "./isProfileOwner";

/** On-chain cells attested only by the gridz registrar — incomplete server publish, still claimable. */
export function isRegistrarOnlyPublish(
  grid: Grid,
  chainId: number,
  registrarAddress?: string | null,
): boolean {
  if (!registrarAddress?.startsWith("0x")) return false;
  const registrarDid = `did:pkh:eip155:${chainId}:${registrarAddress.toLowerCase()}`;
  const onChain = grid.cells.filter((c) => c.attestation?.format === "eas-onchain");
  if (onChain.length === 0) return false;
  return onChain.every((c) => c.attestation?.attester?.toLowerCase() === registrarDid);
}

/** Whether the visitor may open the profile editor (claim, edit, publish). */
export function canEditProfile(params: {
  chainGrid: Grid | null;
  draftBundle: DraftBundle | null;
  walletAddress: string | null | undefined;
  chainId: number;
  registrarAddress?: string | null;
}): boolean {
  const { chainGrid, draftBundle, walletAddress, chainId, registrarAddress } = params;

  if (!chainGrid) return true;

  if (draftBundle) return true;

  if (isRegistrarOnlyPublish(chainGrid, chainId, registrarAddress)) return true;

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

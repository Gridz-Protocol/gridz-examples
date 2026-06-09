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

function attesterAddressFromGrid(grid: Grid, chainId: number): string | null {
  const prefix = `did:pkh:eip155:${chainId}:`.toLowerCase();
  for (const cell of grid.cells) {
    const attester = cell.attestation?.attester?.toLowerCase();
    if (attester?.startsWith(prefix)) {
      const addr = attester.slice(prefix.length);
      return addr.startsWith("0x") ? addr : null;
    }
  }
  return null;
}

/** Whether the visitor may open the profile editor (claim, edit, publish). */
export function canEditProfile(params: {
  chainGrid: Grid | null;
  draftBundle: DraftBundle | null;
  walletAddress: string | null | undefined;
  chainId: number;
  registrarAddress?: string | null;
}): boolean {
  const { chainGrid, walletAddress, chainId, registrarAddress } = params;

  if (!chainGrid) return true;

  if (isRegistrarOnlyPublish(chainGrid, chainId, registrarAddress)) return true;

  return isProfileOwner(chainGrid, walletAddress, chainId);
}

/** Whether a signed grid may be published over the current on-chain baseline. */
export function canPublishProfile(params: {
  chainGrid: Grid | null;
  incomingGrid: Grid;
  chainId: number;
  registrarAddress?: string | null;
}): boolean {
  const { chainGrid, incomingGrid, chainId, registrarAddress } = params;

  if (!chainGrid) return true;

  if (isRegistrarOnlyPublish(chainGrid, chainId, registrarAddress)) return true;

  const signer = attesterAddressFromGrid(incomingGrid, chainId);
  return signer != null && isProfileOwner(chainGrid, signer, chainId);
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

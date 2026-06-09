import type { Grid } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import {
  attesterAddressFromGrid,
  isProfileOwner,
  ownerDidFromGrid,
  walletDid,
} from "./profileOwner";

/** True when on-chain cells are registrar-attested and no wallet owner is recorded yet. */
export function isRegistrarOnlyPublish(
  grid: Grid,
  chainId: number,
  registrarAddress?: string | null,
): boolean {
  if (ownerDidFromGrid(grid, chainId, registrarAddress)) return false;
  if (!registrarAddress?.startsWith("0x")) return false;
  const registrarDid = `did:pkh:eip155:${chainId}:${registrarAddress.toLowerCase()}`;
  const onChain = grid.cells.filter(
    (c) => c.attestation?.format === "eas-onchain" && c.key !== "gridz.owner",
  );
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

  if (isProfileOwner(chainGrid, walletAddress, chainId, registrarAddress)) return true;

  const signed = draftBundle?.signedBaseline;
  if (signed && isProfileOwner(signed, walletAddress, chainId, registrarAddress)) return true;

  return false;
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

  const signer = attesterAddressFromGrid(incomingGrid, chainId);
  if (!signer) return false;

  const owner = ownerDidFromGrid(chainGrid, chainId, registrarAddress);
  if (!owner) {
    const incomingOwner = ownerDidFromGrid(incomingGrid, chainId, registrarAddress);
    return incomingOwner === walletDid(chainId, signer);
  }

  return isProfileOwner(chainGrid, signer, chainId, registrarAddress);
}

/** True when the connected wallet attested the on-chain or locally signed grid. */
export function isProfileSigner(params: {
  chainGrid: Grid | null;
  draftBundle: DraftBundle | null;
  walletAddress: string | null | undefined;
  chainId: number;
  registrarAddress?: string | null;
}): boolean {
  const { chainGrid, draftBundle, walletAddress, chainId, registrarAddress } = params;
  const signed = draftBundle?.signedBaseline;
  if (signed && isProfileOwner(signed, walletAddress, chainId, registrarAddress)) return true;
  if (chainGrid) return isProfileOwner(chainGrid, walletAddress, chainId, registrarAddress);
  return false;
}

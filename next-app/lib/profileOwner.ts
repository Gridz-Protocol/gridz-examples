import { decodeBundle, type Grid } from "@gridz/core";

const OWNER_KEY = "gridz.owner";

/** Wallet DID recorded at publish, or a non-registrar cell attester / subject.did. */
export function ownerDidFromGrid(
  grid: Grid,
  chainId: number,
  registrarAddress?: string | null,
): string | null {
  const ownerCell = grid.cells.find((c) => c.key === OWNER_KEY);
  if (ownerCell && typeof ownerCell.value === "string") {
    const v = ownerCell.value.trim();
    if (v.startsWith("did:pkh:")) return v.toLowerCase();
    if (v.startsWith("0x")) return `did:pkh:eip155:${chainId}:${v.toLowerCase()}`;
  }

  const subjectDid = grid.subject.did?.toLowerCase();
  if (subjectDid?.startsWith("did:pkh:")) return subjectDid;

  const registrarDid =
    registrarAddress?.startsWith("0x") ?
      `did:pkh:eip155:${chainId}:${registrarAddress.toLowerCase()}`
    : null;

  for (const cell of grid.cells) {
    const attester = cell.attestation?.attester?.toLowerCase();
    if (!attester?.startsWith("did:pkh:")) continue;
    if (registrarDid && attester === registrarDid) continue;
    return attester;
  }

  for (const cell of grid.cells) {
    const payload = cell.attestation?.payload;
    if (!payload) continue;
    try {
      const bundle = decodeBundle(payload);
      if (bundle.kind === "eip712" && bundle.message) {
        // Signed locally — attester is carried on the ref when built.
        const attester = cell.attestation?.attester?.toLowerCase();
        if (attester?.startsWith("did:pkh:") && attester !== registrarDid) return attester;
      }
    } catch {
      /* ignore */
    }
  }

  return null;
}

export function walletDid(chainId: number, walletAddress: string): string {
  return `did:pkh:eip155:${chainId}:${walletAddress.toLowerCase()}`;
}

/** True when the connected wallet owns this grid. */
export function isProfileOwner(
  grid: Grid,
  walletAddress: string | null | undefined,
  chainId: number,
  registrarAddress?: string | null,
): boolean {
  if (!walletAddress) return false;
  const did = walletDid(chainId, walletAddress);
  const owner = ownerDidFromGrid(grid, chainId, registrarAddress);
  if (owner === did) return true;

  const registrarDid =
    registrarAddress?.startsWith("0x") ?
      `did:pkh:eip155:${chainId}:${registrarAddress.toLowerCase()}`
    : null;

  return grid.cells.some((c) => {
    if (c.key === OWNER_KEY) return false;
    const attester = c.attestation?.attester?.toLowerCase();
    if (!attester || (registrarDid && attester === registrarDid)) return false;
    return attester === did;
  });
}

export function attesterAddressFromGrid(grid: Grid, chainId: number): string | null {
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

export { OWNER_KEY };

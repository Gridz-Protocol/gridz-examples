import type { Cell, Grid } from "@gridz/core";

const ZERO_HASH = `0x${"0".repeat(64)}`;

function cellIat(cell: Cell): number {
  const iat = cell.attestation?.iat;
  if (!iat) return 0;
  const t = Date.parse(iat);
  return Number.isFinite(t) ? t : 0;
}

/** Wallet-signed drafts carry an inline EIP-712 payload; chain reads do not. */
function isWalletSigned(cell: Cell): boolean {
  return cell.attestation?.format === "eip712-raw" && Boolean(cell.attestation.payload);
}

function preferDraft(existing: Cell, draft: Cell): boolean {
  if (isWalletSigned(draft) && !isWalletSigned(existing)) return true;
  if (!isWalletSigned(draft) && isWalletSigned(existing)) return false;

  const existingHash = existing.attestation?.value_hash;
  const draftHash = draft.attestation?.value_hash;
  const existingPlaceholder = !existingHash || existingHash === ZERO_HASH;
  const draftPlaceholder = !draftHash || draftHash === ZERO_HASH;
  if (draftPlaceholder && !existingPlaceholder) return false;
  if (!draftPlaceholder && existingPlaceholder) return true;

  return cellIat(draft) >= cellIat(existing);
}

/** Prefer newer attestation per key; union keys from both grids. */
export function mergeGrids(chain: Grid | null, draft: Grid | null): Grid | null {
  if (!chain && !draft) return null;
  if (!chain) return draft;
  if (!draft) return chain;

  const byKey = new Map<string, Cell>();
  for (const cell of chain.cells) byKey.set(cell.key, cell);
  for (const cell of draft.cells) {
    const existing = byKey.get(cell.key);
    if (!existing || preferDraft(existing, cell)) {
      byKey.set(cell.key, cell);
    }
  }

  const cells = [...byKey.values()].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
  return {
    ...chain,
    subject: draft.subject.display_name ? draft.subject : chain.subject,
    theme: draft.theme ?? chain.theme,
    cells,
    root_attestation:
      draft.root_attestation?.payload && draft.root_attestation.format === "eip712-raw"
        ? draft.root_attestation
        : chain.root_attestation,
  };
}

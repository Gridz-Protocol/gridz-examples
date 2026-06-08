import type { Cell, Grid } from "@gridz/core";

function cellIat(cell: Cell): number {
  const iat = cell.attestation?.iat;
  if (!iat) return 0;
  const t = Date.parse(iat);
  return Number.isFinite(t) ? t : 0;
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
    if (!existing || cellIat(cell) >= cellIat(existing)) {
      byKey.set(cell.key, cell);
    }
  }

  const cells = [...byKey.values()].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
  return {
    ...chain,
    subject: draft.subject.display_name && !chain.subject.display_name ? draft.subject : chain.subject,
    cells,
  };
}

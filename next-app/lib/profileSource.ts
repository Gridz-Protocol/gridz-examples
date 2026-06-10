import type { Grid } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import { fieldsFromGrid } from "./profileFields";
import { mergeFieldPreview } from "./previewGrid";

export type ProfileSource = "chain" | "draft" | "none";

const META_CELL_KEYS = new Set(["gridz.keys", "gridz.owner"]);

/** Last successful wallet publish (EIP-712) or live EAS cells — not an unsigned preview. */
export function hasPublishedBaseline(grid: Grid | null): boolean {
  if (!grid) return false;
  const ZERO = `0x${"0".repeat(64)}`;
  return grid.cells.some((c) => {
    const a = c.attestation;
    if (!a || a.uri.startsWith("draft://") || a.uid === ZERO) return false;
    if (a.format === "eas-onchain") return true;
    if ((a.format === "eip712-raw" || a.format === "eip712-oneclaw") && a.payload) return true;
    return false;
  });
}

export function fieldsMatchGrid(fields: DraftBundle["fields"], grid: Grid | null): boolean {
  if (!grid) return false;
  return JSON.stringify(fields) === JSON.stringify(fieldsFromGrid(grid));
}

function cellValuesEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function cellIsPublished(chainGrid: Grid, cell: Grid["cells"][number]): boolean {
  return hasPublishedBaseline({ ...chainGrid, cells: [cell] });
}

/**
 * True when editor fields would change or add published on-chain cells.
 * Ignores stale local widget toggles and fields that lag behind a signed baseline.
 */
export function hasUnpublishedFieldEdits(
  fields: DraftBundle["fields"],
  chainGrid: Grid | null,
  signedBaseline: Grid | null,
  ensName: string,
): boolean {
  if (chainGrid && hasPublishedBaseline(chainGrid)) {
    const merged = mergeFieldPreview(chainGrid, fields, ensName);
    if (!merged) return true;

    const chainCells = chainGrid.cells.filter((c) => !META_CELL_KEYS.has(c.key));
    const mergedByKey = new Map(merged.cells.map((c) => [c.key, c]));

    for (const cell of merged.cells) {
      if (META_CELL_KEYS.has(cell.key)) continue;
      const onChain = chainCells.find((c) => c.key === cell.key);
      if (onChain) {
        if (!cellValuesEqual(cell.value, onChain.value)) return true;
        continue;
      }
      if (cell.attestation?.uri.startsWith("draft://")) return true;
    }

    for (const chainCell of chainCells) {
      if (!cellIsPublished(chainGrid, chainCell)) continue;
      if (mergedByKey.has(chainCell.key)) continue;
      const baselineCell = signedBaseline?.cells.find((c) => c.key === chainCell.key);
      if (baselineCell && cellValuesEqual(baselineCell.value, chainCell.value)) continue;
      return true;
    }

    return false;
  }

  if (chainGrid) return !fieldsMatchGrid(fields, chainGrid);
  if (signedBaseline) return !fieldsMatchGrid(fields, signedBaseline);
  return true;
}

/** True when the bundle represents a successfully signed/published state, not a pending draft. */
export function bundleIsPublished(bundle: DraftBundle | null): boolean {
  if (!bundle) return false;
  if (!hasPublishedBaseline(bundle.signedBaseline)) return false;
  return fieldsMatchGrid(bundle.fields, bundle.signedBaseline);
}

/**
 * Decide whether the viewer sees a local draft or live on-chain data.
 * localStorage keeps a signed baseline for incremental publish — that is not a "draft"
 * once editor field values match the published grid.
 */
export function resolveProfileSource(
  chainGrid: Grid | null,
  bundle: DraftBundle | null,
  ensName: string,
): { grid: Grid | null; source: ProfileSource } {
  if (!bundle) {
    return { grid: chainGrid, source: chainGrid ? "chain" : "none" };
  }

  const baseline = bundle.signedBaseline;
  const unpublished = hasUnpublishedFieldEdits(bundle.fields, chainGrid, baseline, ensName);

  if (!unpublished) {
    if (chainGrid) return { grid: chainGrid, source: "chain" };
    if (baseline && hasPublishedBaseline(baseline)) return { grid: baseline, source: "chain" };
  }

  const merged = mergeFieldPreview(chainGrid ?? baseline, bundle.fields, ensName);
  return { grid: merged, source: merged ? "draft" : "none" };
}

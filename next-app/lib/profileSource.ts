import type { Grid } from "@gridz/core";
import type { DraftBundle } from "./drafts";
import { fieldsFromGrid } from "./profileFields";
import { mergeFieldPreview } from "./previewGrid";

export type ProfileSource = "chain" | "draft" | "none";

/** Last successful wallet publish (EIP-712) or live EAS cells — not an unsigned preview. */
function hasPublishedBaseline(grid: Grid | null): boolean {
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

function fieldsMatchGrid(fields: DraftBundle["fields"], grid: Grid | null): boolean {
  if (!grid) return false;
  return JSON.stringify(fields) === JSON.stringify(fieldsFromGrid(grid));
}

function hasUnpublishedFieldEdits(
  fields: DraftBundle["fields"],
  chainGrid: Grid | null,
  signedBaseline: Grid | null,
): boolean {
  if (chainGrid) return !fieldsMatchGrid(fields, chainGrid);
  if (signedBaseline) return !fieldsMatchGrid(fields, signedBaseline);
  return true;
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
  const unpublished = hasUnpublishedFieldEdits(bundle.fields, chainGrid, baseline);

  if (!unpublished) {
    if (chainGrid) return { grid: chainGrid, source: "chain" };
    if (baseline && hasPublishedBaseline(baseline)) return { grid: baseline, source: "chain" };
  }

  const merged = mergeFieldPreview(chainGrid ?? baseline, bundle.fields, ensName);
  return { grid: merged, source: merged ? "draft" : "none" };
}

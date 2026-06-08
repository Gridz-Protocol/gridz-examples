import { SCHEMA_VERSION, type Cell, type Grid, type Hex } from "@gridz/core";
import { DEFAULT_THEME } from "./defaultTheme";
import { profileCellsFromFields } from "./buildProfileGrid";
import type { ProfileEditorState } from "./profileFields";

const ZERO = `0x${"0".repeat(64)}` as Hex;

function placeholderAttestation(ensName: string, key: string, iat: string) {
  return {
    format: "eip712-raw" as const,
    uid: ZERO,
    uri: `draft://${ensName}/${key}`,
    attester: ensName,
    iat,
    value_hash: ZERO,
  };
}

/** Unsigned preview grid for local draft display (not verifiable until publish). */
export function previewGridFromFields(
  fields: ProfileEditorState,
  ensName: string,
  chainGrid: Grid | null,
): Grid | null {
  const drafts = profileCellsFromFields(fields);
  if (drafts.length === 0) return chainGrid;

  const now = new Date().toISOString();
  const cells: Cell[] = drafts.map((d) => ({
    id: d.id,
    key: d.key,
    value: d.value,
    ...(d.widget_type ? { widget_type: d.widget_type } : {}),
    position: d.position,
    size: d.size,
    is_visible: d.is_visible ?? true,
    attestation: placeholderAttestation(ensName, d.key, now),
  }));

  return {
    schema_version: SCHEMA_VERSION,
    subject: {
      type: "human",
      did: chainGrid?.subject.did ?? `did:ens:${ensName}`,
      ens: ensName,
      display_name: fields.alias.trim() || ensName.split(".")[0],
    },
    theme: chainGrid?.theme ?? DEFAULT_THEME,
    cells,
    root_attestation:
      chainGrid?.root_attestation ??
      ({
        format: "eip712-raw",
        uid: ZERO,
        uri: `draft://${ensName}`,
        attester: ensName,
        iat: now,
        value_hash: ZERO,
      } as Grid["root_attestation"]),
  };
}

/** Overlay unsigned field values on chain cells for draft preview. */
export function mergeFieldPreview(
  chain: Grid | null,
  fields: ProfileEditorState,
  ensName: string,
): Grid | null {
  const preview = previewGridFromFields(fields, ensName, chain);
  if (!preview) return null;
  if (!chain) return preview;

  const byKey = new Map<string, Cell>();
  for (const cell of chain.cells) byKey.set(cell.key, cell);
  for (const cell of preview.cells) {
    const existing = byKey.get(cell.key);
    byKey.set(cell.key, {
      ...cell,
      attestation: existing?.attestation ?? cell.attestation,
    });
  }

  const cells = [...byKey.values()].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
  return {
    ...chain,
    subject: preview.subject,
    cells,
  };
}

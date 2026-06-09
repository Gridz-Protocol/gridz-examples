import {
  algoForFormat,
  buildCellAttestation,
  buildRootAttestation,
  merkleRoot,
  valueHash,
  widgetTypeHash,
  type Cell,
  type CellDraft,
  type Grid,
  type Hex,
  type Signer,
  SCHEMA_VERSION,
} from "@gridz/core";
import type { WalletClient } from "viem";
import { DEFAULT_THEME } from "./defaultTheme";
import type { ProfileEditorState } from "./profileFields";
import { profileCellsFromFields } from "./buildProfileGrid";
import { OWNER_KEY } from "./profileOwner";

function walletSigner(walletClient: WalletClient, chainId: number, address: Hex): Signer {
  return {
    async did() {
      return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
    },
    format: () => "eip712-raw" as const,
    async signTypedData(params) {
      const signature = await walletClient.signTypedData({
        account: address,
        ...params,
        primaryType: params.primaryType,
      } as never);
      return { signature, signerAddress: address };
    },
    async signMessage(message) {
      return walletClient.signMessage({ account: address, message: message as never });
    },
  };
}

export function baselineCellByKey(baseline: Grid | null | undefined): Map<string, Cell> {
  const map = new Map<string, Cell>();
  for (const cell of baseline?.cells ?? []) map.set(cell.key, cell);
  return map;
}

/** True when an existing attestation can be reused without a new wallet prompt. */
export function canReuseCell(draft: CellDraft, existing: Cell | undefined, attesterDid: string): boolean {
  if (!existing?.attestation?.value_hash || !existing.attestation.attester) return false;
  if (existing.attestation.attester !== attesterDid) return false;

  const algo = algoForFormat(existing.attestation.format);
  const nextValueHash = valueHash(algo, draft.value);
  if (nextValueHash !== existing.attestation.value_hash) return false;

  const nextWidgetHash = widgetTypeHash(algo, draft.widget_type);
  const prevWidgetHash = widgetTypeHash(algo, existing.widget_type);
  return nextWidgetHash === prevWidgetHash;
}

export function countCellsToSign(
  drafts: CellDraft[],
  baseline: Grid | null | undefined,
  attesterDid: string,
): number {
  const byKey = baselineCellByKey(baseline);
  let n = 0;
  for (const draft of drafts) {
    if (!canReuseCell(draft, byKey.get(draft.key), attesterDid)) n += 1;
  }
  const ownerDraft: CellDraft = {
    id: OWNER_KEY,
    key: OWNER_KEY,
    value: attesterDid,
    position: { x: 0, y: 0, w: 0, h: 0 },
    size: "0x0",
    is_visible: false,
  };
  if (!canReuseCell(ownerDraft, byKey.get(OWNER_KEY), attesterDid)) n += 1;
  return n + 1;
}

const ZERO_HASH = `0x${"0".repeat(64)}`;

function effectiveValueHash(cell: Cell): string | null {
  const raw = cell.attestation?.value_hash;
  if (!raw || raw === ZERO_HASH) {
    const algo = algoForFormat(cell.attestation?.format ?? "eip712-raw");
    return valueHash(algo, cell.value);
  }
  return raw;
}


export function countFieldsToPublish(
  fields: ProfileEditorState,
  chainBaseline: Grid | null | undefined,
): number {
  const drafts = profileCellsFromFields(fields);
  if (!chainBaseline) return drafts.length + 1;
  const byKey = baselineCellByKey(chainBaseline);
  const algo = algoForFormat("eip712-raw");
  let n = 0;
  for (const draft of drafts) {
    const onChain = byKey.get(draft.key);
    if (!onChain) {
      n += 1;
      continue;
    }
    const prev = effectiveValueHash(onChain);
    const next = valueHash(algo, draft.value);
    if (!prev || prev !== next) n += 1;
  }
  if (!byKey.has(OWNER_KEY)) n += 1;
  return n;
}

export function countCellsToPublish(grid: Grid, chainBaseline: Grid | null | undefined): number {
  if (!chainBaseline) return grid.cells.length;
  const byKey = baselineCellByKey(chainBaseline);
  let n = 0;
  for (const cell of grid.cells) {
    const onChain = byKey.get(cell.key);
    if (!onChain) {
      n += 1;
      continue;
    }
    const prev = effectiveValueHash(onChain);
    const next = effectiveValueHash(cell);
    if (!prev || !next || prev !== next) n += 1;
  }
  return n;
}

export interface IncrementalBuildResult {
  grid: Grid;
  signedCellCount: number;
  reusedCellCount: number;
}

async function ensureOwnerCell(
  cells: Cell[],
  byKey: Map<string, Cell>,
  signer: Signer,
  subjectDid: string,
  chainId: number,
  resolver: Hex,
): Promise<{ signed: number; reused: number }> {
  const ownerDraft: CellDraft = {
    id: OWNER_KEY,
    key: OWNER_KEY,
    value: subjectDid,
    position: { x: 0, y: 0, w: 0, h: 0 },
    size: "0x0",
    is_visible: false,
  };
  const existing = byKey.get(OWNER_KEY);
  if (canReuseCell(ownerDraft, existing, subjectDid) && existing) {
    cells.push(existing);
    return { signed: 0, reused: 1 };
  }
  const attestation = await buildCellAttestation(signer, {
    subjectDid,
    key: OWNER_KEY,
    value: subjectDid,
    chainId,
    verifyingContract: resolver,
  });
  cells.push({
    id: OWNER_KEY,
    key: OWNER_KEY,
    value: subjectDid,
    position: { x: 0, y: 0, w: 0, h: 0 },
    size: "0x0",
    is_visible: false,
    attestation,
  });
  return { signed: 1, reused: 0 };
}

export async function buildProfileGridIncremental(
  fields: ProfileEditorState,
  ensName: string,
  walletClient: WalletClient,
  chainId: number,
  resolver: Hex,
  signerAddress: Hex,
  baseline?: Grid | null,
): Promise<IncrementalBuildResult> {
  const signer = walletSigner(walletClient, chainId, signerAddress);
  const subjectDid = await signer.did();
  const drafts = profileCellsFromFields(fields);

  if (drafts.length === 0) {
    throw new Error("Add at least a display name before signing.");
  }

  const byKey = baselineCellByKey(baseline);
  const cells: Cell[] = [];
  let signedCellCount = 0;
  let reusedCellCount = 0;

  for (const draft of drafts) {
    const existing = byKey.get(draft.key);
    if (canReuseCell(draft, existing, subjectDid) && existing) {
      cells.push({
        ...existing,
        id: draft.id,
        position: draft.position,
        size: draft.size,
        is_visible: draft.is_visible ?? true,
        ...(draft.expires_at ? { expires_at: draft.expires_at.toISOString() } : {}),
      });
      reusedCellCount += 1;
      continue;
    }

    const attestation = await buildCellAttestation(signer, {
      subjectDid,
      key: draft.key,
      value: draft.value,
      widgetType: draft.widget_type,
      expiresAt: draft.expires_at,
      nonce: draft.nonce,
      chainId,
      verifyingContract: resolver,
    });
    cells.push({
      id: draft.id,
      key: draft.key,
      value: draft.value,
      ...(draft.widget_type ? { widget_type: draft.widget_type } : {}),
      position: draft.position,
      size: draft.size,
      is_visible: draft.is_visible ?? true,
      attestation,
      ...(draft.expires_at ? { expires_at: draft.expires_at.toISOString() } : {}),
    });
    signedCellCount += 1;
  }

  const ownerCell = await ensureOwnerCell(cells, byKey, signer, subjectDid, chainId, resolver);
  signedCellCount += ownerCell.signed;
  reusedCellCount += ownerCell.reused;

  const algo = algoForFormat(signer.format());
  const root = merkleRoot(
    algo,
    cells.map((c) => c.attestation.uid),
  );
  const root_attestation = await buildRootAttestation(signer, {
    subjectDid,
    merkleRoot: root,
    cellCount: cells.length,
    chainId,
    verifyingContract: resolver,
  });

  const grid: Grid = {
    schema_version: SCHEMA_VERSION,
    subject: {
      type: fields.tokensEnabled ? "organization" : "human",
      did: subjectDid,
      ens: ensName,
      display_name: fields.alias.trim() || ensName.split(".")[0],
    },
    theme: DEFAULT_THEME,
    cells,
    root_attestation,
  };

  return { grid, signedCellCount, reusedCellCount };
}

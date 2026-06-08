import { buildGrid, type CellDraft, type Grid, type Hex, type Signer } from "@gridz/core";
import type { WalletClient } from "viem";
import { DEFAULT_THEME } from "./defaultTheme";
import type { ProfileEditorState } from "./profileFields";

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

function pushStringCell(cells: CellDraft[], draft: Omit<CellDraft, "position" | "size">, y: number) {
  cells.push({
    ...draft,
    position: { x: 0, y, w: 1, h: 1 },
    size: "1x1",
  });
}

export function profileCellsFromFields(fields: ProfileEditorState): CellDraft[] {
  const cells: CellDraft[] = [];
  let y = 0;

  if (fields.alias.trim()) {
    cells.push({
      id: "alias",
      key: "alias",
      value: fields.alias.trim(),
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
  }

  if (fields.description.trim()) {
    cells.push({
      id: "description",
      key: "description",
      value: fields.description.trim(),
      position: { x: 1, y, w: 2, h: 1 },
      size: "2x1",
    });
  }
  y += 1;

  if (fields.avatar.trim()) {
    cells.push({
      id: "avatar",
      key: "avatar",
      value: fields.avatar.trim(),
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
  }

  if (fields.url.trim()) {
    cells.push({
      id: "url",
      key: "url",
      value: fields.url.trim(),
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
  }
  y += 1;

  const socials: { id: string; key: string; value: string }[] = [
    { id: "com.twitter", key: "com.twitter", value: fields.twitter.trim() },
    { id: "com.github", key: "com.github", value: fields.github.trim() },
    { id: "social.bsky", key: "social.bsky", value: fields.bsky.trim() },
  ];
  for (const s of socials) {
    if (!s.value) continue;
    pushStringCell(cells, { id: s.id, key: s.key, value: s.value }, y);
    y += 1;
  }

  if (fields.statsEnabled) {
    const rows = fields.stats
      .filter((r) => r.label.trim() && r.value.trim())
      .map((r) => ({ label: r.label.trim(), value: r.value.trim() }));
    if (rows.length) {
      cells.push({
        id: "gridz.stats",
        key: "gridz.stats",
        value: rows,
        widget_type: "gridz.stats",
        position: { x: 0, y, w: 2, h: 1 },
        size: "2x1",
      });
      y += 1;
    }
  }

  if (fields.pollEnabled && fields.pollQuestion.trim()) {
    const options = fields.pollOptions.map((o) => o.trim()).filter(Boolean);
    if (options.length >= 2) {
      cells.push({
        id: "gridz.poll",
        key: "gridz.poll",
        value: { q: fields.pollQuestion.trim(), options, votes: options.map(() => 0) },
        widget_type: "gridz.poll",
        position: { x: 0, y, w: 2, h: 2 },
        size: "2x2",
      });
      y += 2;
    }
  }

  if (fields.linkEnabled && fields.linkUrl.trim()) {
    cells.push({
      id: "gridz.social_link",
      key: "gridz.social_link",
      value: {
        label: fields.linkLabel.trim() || "Link",
        url: fields.linkUrl.trim(),
      },
      widget_type: "gridz.social_link",
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
  }

  return cells;
}

export async function buildProfileGrid(
  fields: ProfileEditorState,
  ensName: string,
  walletClient: WalletClient,
  chainId: number,
  resolver: Hex,
  signerAddress: Hex,
): Promise<Grid> {
  const signer = walletSigner(walletClient, chainId, signerAddress);
  const did = await signer.did();
  const cells = profileCellsFromFields(fields);

  if (cells.length === 0) {
    throw new Error("Add at least a display name before signing.");
  }

  return buildGrid(signer, {
    subject: { type: "human", did, ens: ensName, display_name: fields.alias.trim() || ensName.split(".")[0] },
    theme: DEFAULT_THEME,
    chainId,
    verifyingContract: resolver,
    cells,
  });
}

export type ProfileFields = ProfileEditorState;

import { type CellDraft, type Grid, type Hex } from "@gridz/core";
import { buildProfileGridIncremental } from "./incrementalProfileGrid";
import type { WalletClient } from "viem";
import type { ProfileEditorState } from "./profileFields";
import { normalizeUrl } from "./normalizeUrl";

function pushSocial(cells: CellDraft[], y: number, id: string, key: string, value: string) {
  if (!value) return y;
  cells.push({
    id,
    key,
    value,
    position: { x: 0, y, w: 1, h: 1 },
    size: "1x1",
  });
  return y + 1;
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

  const website = normalizeUrl(fields.url);
  if (website) {
    cells.push({
      id: "url",
      key: "url",
      value: website,
      position: { x: fields.avatar.trim() ? 1 : 0, y, w: 1, h: 1 },
      size: "1x1",
    });
  }
  y += 1;

  y = pushSocial(cells, y, "com.twitter", "com.twitter", fields.twitter.trim());
  y = pushSocial(cells, y, "com.github", "com.github", fields.github.trim());
  y = pushSocial(cells, y, "social.bsky", "social.bsky", fields.bsky.trim());
  y = pushSocial(cells, y, "com.discord", "com.discord", fields.discord.trim());
  y = pushSocial(cells, y, "org.telegram", "org.telegram", fields.telegram.trim());

  if (fields.messageMeEnabled && fields.messageMeUrl.trim()) {
    cells.push({
      id: "gridz.message_me",
      key: "gridz.message_me",
      value: normalizeUrl(fields.messageMeUrl),
      widget_type: "gridz.message_me",
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
    y += 1;
  }

  if (fields.availabilityEnabled) {
    cells.push({
      id: "gridz.availability_status",
      key: "gridz.availability_status",
      value: {
        status: fields.availabilityStatus,
        message: fields.availabilityMessage.trim() || undefined,
      },
      widget_type: "gridz.availability_status",
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
    y += 1;
  }

  if (fields.currentlyEnabled && fields.currentlyTitle.trim()) {
    cells.push({
      id: "gridz.currently",
      key: "gridz.currently",
      value: {
        title: fields.currentlyTitle.trim(),
        subtitle: fields.currentlySubtitle.trim() || undefined,
        emoji: fields.currentlyEmoji.trim() || "🚀",
      },
      widget_type: "gridz.currently",
      position: { x: 0, y, w: 2, h: 1 },
      size: "2x1",
    });
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

  if (fields.countdownEnabled && fields.countdownTarget.trim()) {
    const target = new Date(fields.countdownTarget).toISOString();
    cells.push({
      id: "gridz.countdown",
      key: "gridz.countdown",
      value: { label: fields.countdownLabel.trim() || "Countdown", target },
      widget_type: "gridz.countdown",
      position: { x: 0, y, w: 2, h: 2 },
      size: "2x2",
    });
    y += 2;
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

  if (fields.clockEnabled && fields.clockTimezone.trim()) {
    cells.push({
      id: "gridz.clock",
      key: "gridz.clock",
      value: fields.clockTimezone.trim(),
      widget_type: "gridz.clock",
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
    y += 1;
  }

  if (fields.textEnabled && fields.textContent.trim()) {
    cells.push({
      id: "gridz.text",
      key: "gridz.text",
      value: fields.textContent.trim(),
      widget_type: "gridz.text",
      position: { x: 0, y, w: 2, h: 1 },
      size: "2x1",
    });
    y += 1;
  }

  if (fields.guestbookEnabled) {
    const entries = fields.guestbookEntries
      .filter((e) => e.text.trim())
      .map((e) => ({ text: e.text.trim(), author: e.author.trim() || undefined }));
    if (entries.length) {
      cells.push({
        id: "gridz.guestbook",
        key: "gridz.guestbook",
        value: entries,
        widget_type: "gridz.guestbook",
        position: { x: 0, y, w: 2, h: 2 },
        size: "2x2",
      });
      y += 2;
    }
  }


  if (fields.tokensEnabled) {
    const tokens = fields.tokens
      .filter((t) => t.address.trim())
      .map((t) => ({
        chainId: t.chainId,
        address: t.address.trim(),
        ...(t.symbol.trim() ? { symbol: t.symbol.trim() } : {}),
        ...(t.name.trim() ? { name: t.name.trim() } : {}),
      }));
    if (tokens.length) {
      cells.push({
        id: "gridz.tokens",
        key: "gridz.tokens",
        value: { tokens },
        widget_type: "gridz.tokens",
        position: { x: 0, y, w: 2, h: 1 },
        size: "2x1",
      });
      y += 1;
    }
  }

  if (fields.linkEnabled && fields.linkUrl.trim()) {
    cells.push({
      id: "gridz.social_link",
      key: "gridz.social_link",
      value: { label: fields.linkLabel.trim() || "Link", url: normalizeUrl(fields.linkUrl) },
      widget_type: "gridz.social_link",
      position: { x: 0, y, w: 1, h: 1 },
      size: "1x1",
    });
  }

  if (cells.length > 0) {
    const keys = cells.map((c) => c.key);
    cells.push({
      id: "gridz.keys",
      key: "gridz.keys",
      value: JSON.stringify([...keys, "gridz.keys"]),
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
  baseline?: Grid | null,
): Promise<Grid> {
  const { grid } = await buildProfileGridIncremental(
    fields,
    ensName,
    walletClient,
    chainId,
    resolver,
    signerAddress,
    baseline,
  );
  return grid;
}

export type ProfileFields = ProfileEditorState;

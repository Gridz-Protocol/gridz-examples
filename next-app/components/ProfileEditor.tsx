"use client";

import { useCallback, useEffect, useState } from "react";
import type { Grid } from "@gridz/core";
import { useWallet, walletChainLabel } from "../lib/wallet";
import { buildProfileGrid } from "../lib/buildProfileGrid";
import { profileCellsFromFields } from "../lib/buildProfileGrid";
import { countCellsToSign, countFieldsToPublish } from "../lib/incrementalProfileGrid";
import { mergeFieldPreview } from "../lib/previewGrid";
import { publishGridViaEas } from "../lib/publishEas";
import { saveDraftFields, saveSignedBaseline } from "../lib/drafts";
import { fieldsFromGrid, type ProfileEditorState } from "../lib/profileFields";
import { AvatarField } from "./AvatarField";
import { ProfileWidgetFields } from "./ProfileWidgetFields";
import { PublishProgress, type PublishUiPhase } from "./PublishProgress";
import type { Hex } from "viem";

export interface ProfileEditorProps {
  ensName: string;
  initial?: Grid | null;
  chainBaseline?: Grid | null;
  signedBaseline?: Grid | null;
  initialFields?: ProfileEditorState | null;
  onSaved: (grid: Grid, source: "draft" | "chain") => void;
  /** Live preview while editing (draft fields overlaid on chain baseline). */
  onPreview?: (grid: Grid) => void;
  isClaim?: boolean;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const GRIDZ_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? "1");
const EAS_ADDRESS = (process.env.NEXT_PUBLIC_EAS_ADDRESS ?? "") as Hex;
const CELL_SCHEMA = (process.env.NEXT_PUBLIC_CELL_SCHEMA ?? "") as Hex;

export function ProfileEditor({
  ensName,
  initial,
  chainBaseline = null,
  signedBaseline = null,
  initialFields = null,
  onSaved,
  onPreview,
  isClaim = false,
}: ProfileEditorProps) {
  const {
    address,
    chainId,
    targetChainId,
    connecting,
    isConnected,
    isCorrectChain,
    openWalletModal,
    prepareWallet,
    publicClient,
  } = useWallet();
  const [fields, setFields] = useState<ProfileEditorState>(
    () => initialFields ?? fieldsFromGrid(initial),
  );
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [publishUi, setPublishUi] = useState<{
    phase: PublishUiPhase;
    cellCount?: number;
    signCount?: number;
    txCount?: number;
    errorMessage?: string;
    draftSaved?: boolean;
  } | null>(null);

  // Re-hydrate only when the saved draft bundle changes — not on live preview grid updates.
  useEffect(() => {
    if (busy !== null || !initialFields) return;
    setFields(initialFields);
  }, [initialFields, busy]);

  useEffect(() => {
    if (!onPreview) return;
    const preview = mergeFieldPreview(chainBaseline, fields, ensName);
    if (preview) onPreview(preview);
  }, [chainBaseline, ensName, fields, onPreview]);

  const resolver = (process.env.NEXT_PUBLIC_GRIDZ_RESOLVER ?? "") as Hex;
  const signingBaseline = signedBaseline ?? chainBaseline;

  const saveDraftLocally = useCallback(() => {
    saveDraftFields(ensName, fields, signedBaseline);
    const preview = mergeFieldPreview(chainBaseline, fields, ensName);
    if (preview) onSaved(preview, "draft");
    setSaveMessage("Draft saved in this browser — no wallet signatures yet.");
  }, [chainBaseline, ensName, fields, onSaved, signedBaseline]);

  const runPublish = useCallback(async () => {
    if (!resolver.startsWith("0x")) {
      setSaveMessage("Missing GRIDZ_RESOLVER — set NEXT_PUBLIC_GRIDZ_RESOLVER in env.");
      return;
    }
    if (!EAS_ADDRESS.startsWith("0x") || !CELL_SCHEMA.startsWith("0x")) {
      setSaveMessage("Missing NEXT_PUBLIC_EAS_ADDRESS or NEXT_PUBLIC_CELL_SCHEMA in env.");
      return;
    }

    const drafts = profileCellsFromFields(fields);
    if (drafts.length === 0) {
      setSaveMessage("Add at least a display name before publishing.");
      return;
    }

    setBusy("publish");
    setSaveMessage(null);

    try {
      const wallet = await prepareWallet();
      const attesterDid = `did:pkh:eip155:${GRIDZ_CHAIN_ID}:${wallet.address.toLowerCase()}`;
      const signCount = countCellsToSign(drafts, signingBaseline, attesterDid);
      const publishCount = countFieldsToPublish(fields, chainBaseline);

      setPublishUi({ phase: "signing", signCount, cellCount: publishCount });

      const grid = await buildProfileGrid(
        fields,
        ensName,
        wallet.walletClient,
        GRIDZ_CHAIN_ID,
        resolver,
        wallet.address,
        signingBaseline,
      );

      if (!publicClient) {
        throw new Error("Network client not ready — wait a moment and try again.");
      }

      setPublishUi({ phase: "publishing", cellCount: publishCount, signCount });

      const result = await publishGridViaEas(grid, ensName, {
        easAddress: EAS_ADDRESS,
        cellSchema: CELL_SCHEMA,
        resolverAddress: resolver,
        publicClient,
        walletClient: wallet.walletClient,
        chainBaseline,
        mode: "owner",
      });

      const published = result.publishedCellCount;
      if (published === 0 && result.txCount === 0) {
        saveDraftFields(ensName, fields, grid);
        onSaved(mergeFieldPreview(chainBaseline, fields, ensName) ?? grid, "draft");
        setPublishUi({
          phase: "error",
          errorMessage: "Nothing new reached the chain. Change a field and try Sign & publish again.",
          draftSaved: true,
        });
        return;
      }

      saveSignedBaseline(ensName, fields, grid);
      onSaved(grid, "chain");
      setPublishUi({
        phase: "success",
        cellCount: published,
        signCount,
        txCount: result.txCount,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setPublishUi({ phase: "error", errorMessage: msg });
    } finally {
      setBusy(null);
    }
  }, [
    chainBaseline,
    ensName,
    fields,
    onSaved,
    prepareWallet,
    publicClient,
    resolver,
    signingBaseline,
  ]);

  const walletReady = Boolean(isConnected && address && isCorrectChain);
  const formDisabled = busy !== null;

  return (
    <section className="profile-editor">
      <div className="profile-editor__head">
        <h3 style={{ margin: 0 }}>{isClaim ? "Claim your profile" : "Edit profile"}</h3>
        <span className="profile-editor__status">{ensName}</span>
      </div>

      <div className={`wallet-banner${walletReady ? " wallet-banner--ready" : ""}`}>
        {walletReady ? (
          <>
            <div className="wallet-banner__ready">
              <span className="wallet-banner__dot" aria-hidden />
              <span>
                Connected as <strong>{shortAddr(address!)}</strong> on {walletChainLabel(chainId)}
              </span>
            </div>
            <p className="wallet-banner__sub">
              Edit freely — drafts stay unsigned until you hit <strong>Sign &amp; publish</strong>. You pay
              Base gas for EAS attestations and resolver links (~2 txs per changed field), plus EIP-712
              signatures (free).
            </p>
          </>
        ) : (
          <>
            <p className="wallet-banner__text">
              {isConnected
                ? `Switch to ${walletChainLabel(targetChainId)} to publish. You can save drafts without a wallet.`
                : "Save drafts without connecting. Connect a wallet only when you're ready to sign and publish."}
            </p>
            <button
              type="button"
              className="site-btn site-btn--primary"
              onClick={openWalletModal}
              disabled={connecting || formDisabled}
            >
              {connecting
                ? "Connecting…"
                : isConnected
                  ? `Switch to ${walletChainLabel(targetChainId)}`
                  : "Connect wallet"}
            </button>
          </>
        )}
      </div>

      <AvatarField
        ensName={ensName}
        value={fields.avatar}
        onChange={(avatar) => setFields((f) => ({ ...f, avatar }))}
        disabled={formDisabled}
      />

      <div className="site-field">
        <label className="site-label" htmlFor="alias">
          Display name
        </label>
        <input
          id="alias"
          className="site-input"
          value={fields.alias}
          onChange={(e) => setFields((f) => ({ ...f, alias: e.target.value }))}
          placeholder="Kevin"
          disabled={formDisabled}
        />
      </div>
      <div className="site-field">
        <label className="site-label" htmlFor="description">
          Bio
        </label>
        <textarea
          id="description"
          className="site-textarea"
          rows={3}
          value={fields.description}
          onChange={(e) => setFields((f) => ({ ...f, description: e.target.value }))}
          placeholder="What you do, in one line."
          disabled={formDisabled}
        />
      </div>
      <div className="site-field">
        <label className="site-label" htmlFor="url">
          Website
        </label>
        <input
          id="url"
          className="site-input"
          value={fields.url}
          onChange={(e) => setFields((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://"
          disabled={formDisabled}
        />
      </div>

      <ProfileWidgetFields fields={fields} onChange={setFields} disabled={formDisabled} />

      <div className="profile-editor__actions">
        <button type="button" className="site-btn" onClick={saveDraftLocally} disabled={formDisabled}>
          {busy === "save" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          className="site-btn site-btn--primary"
          onClick={() => void runPublish()}
          disabled={formDisabled}
        >
          {busy === "publish"
            ? "Signing & publishing…"
            : isClaim
              ? walletReady
                ? "Sign & claim on ENS"
                : "Connect & claim"
              : walletReady
                ? "Sign & publish to ENS"
                : "Connect & publish"}
        </button>
      </div>

      {publishUi ? (
        <PublishProgress
          phase={publishUi.phase}
          ensName={ensName}
          cellCount={publishUi.cellCount}
          signCount={publishUi.signCount}
          txCount={publishUi.txCount}
          errorMessage={publishUi.errorMessage}
          draftSaved={publishUi.draftSaved}
          onDismiss={() => setPublishUi(null)}
        />
      ) : null}

      {saveMessage ? <p className="profile-editor__message">{saveMessage}</p> : null}
    </section>
  );
}

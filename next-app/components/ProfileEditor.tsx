"use client";

import { useCallback, useEffect, useState } from "react";
import type { Grid } from "@gridz/core";
import { useWallet, walletChainLabel } from "../lib/wallet";
import { buildProfileGrid } from "../lib/buildProfileGrid";
import { profileCellsFromFields } from "../lib/buildProfileGrid";
import { countCellsToSign, countFieldsToPublish } from "../lib/incrementalProfileGrid";
import { mergeFieldPreview } from "../lib/previewGrid";
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

  useEffect(() => {
    if (busy !== null) return;
    setFields(initialFields ?? fieldsFromGrid(initial));
  }, [initial, initialFields, busy]);

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

      setPublishUi({ phase: "publishing", cellCount: publishCount, signCount });

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ensName, grid }),
      });
      const result = (await res.json()) as {
        ok: boolean;
        error?: string;
        txCount?: number;
        publishedCellCount?: number;
      };

      if (!result.ok) {
        saveDraftFields(ensName, fields, grid);
        onSaved(mergeFieldPreview(chainBaseline, fields, ensName) ?? grid, "draft");
        const prefix =
          res.status >= 500 ? "Server error" : res.status === 503 ? "Publish unavailable" : "Publish failed";
        setPublishUi({
          phase: "error",
          errorMessage: `${prefix}: ${result.error ?? res.statusText}`,
          draftSaved: true,
        });
        return;
      }

      const published = result.publishedCellCount ?? 0;
      if (published === 0 && (result.txCount ?? 0) === 0) {
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
              Edit freely — drafts stay unsigned until you hit <strong>Sign &amp; publish</strong>. Only
              changed fields need wallet prompts, plus one root signature.
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

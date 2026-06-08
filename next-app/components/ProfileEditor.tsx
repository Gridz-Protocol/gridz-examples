"use client";

import { useCallback, useEffect, useState } from "react";
import type { Grid } from "@gridz/core";
import { useWallet, walletChainLabel } from "../lib/wallet";
import { buildProfileGrid } from "../lib/buildProfileGrid";
import { saveDraft } from "../lib/drafts";
import { fieldsFromGrid, type ProfileEditorState } from "../lib/profileFields";
import { AvatarField } from "./AvatarField";
import { ProfileWidgetFields } from "./ProfileWidgetFields";
import { PublishProgress, type PublishUiPhase } from "./PublishProgress";
import type { Hex } from "viem";

export interface ProfileEditorProps {
  ensName: string;
  initial?: Grid | null;
  onSaved: (grid: Grid, source: "draft" | "chain") => void;
  isClaim?: boolean;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const GRIDZ_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? "1");

export function ProfileEditor({ ensName, initial, onSaved, isClaim = false }: ProfileEditorProps) {
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
  const [fields, setFields] = useState<ProfileEditorState>(() => fieldsFromGrid(initial));
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [publishUi, setPublishUi] = useState<{
    phase: PublishUiPhase;
    cellCount?: number;
    txCount?: number;
    errorMessage?: string;
    draftSaved?: boolean;
  } | null>(null);

  useEffect(() => {
    if (busy !== null) return;
    setFields(fieldsFromGrid(initial));
  }, [initial, busy]);

  const resolver = (process.env.NEXT_PUBLIC_GRIDZ_RESOLVER ?? "") as Hex;

  const runWithWallet = useCallback(
    async (action: "save" | "publish") => {
      if (!resolver.startsWith("0x")) {
        setSaveMessage("Missing GRIDZ_RESOLVER — set NEXT_PUBLIC_GRIDZ_RESOLVER in env.");
        return;
      }

      setBusy(action);
      setSaveMessage(null);
      if (action === "publish") {
        setPublishUi({ phase: "signing" });
      } else {
        setPublishUi(null);
      }

      try {
        const wallet = await prepareWallet();
        const grid = await buildProfileGrid(
          fields,
          ensName,
          wallet.walletClient,
          GRIDZ_CHAIN_ID,
          resolver,
          wallet.address,
        );

        if (action === "save") {
          saveDraft(ensName, grid);
          onSaved(grid, "draft");
          setSaveMessage("Signed profile saved as a local draft. Publish to ENS when ready.");
          return;
        }

        const cellCount = grid.cells.length;
        setPublishUi({ phase: "publishing", cellCount });

        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ensName, grid }),
        });
        const result = (await res.json()) as { ok: boolean; error?: string; txCount?: number };
        if (!result.ok) {
          saveDraft(ensName, grid);
          onSaved(grid, "draft");
          const prefix =
            res.status >= 500 ? "Server error" : res.status === 503 ? "Publish unavailable" : "Publish failed";
          setPublishUi({
            phase: "error",
            errorMessage: `${prefix}: ${result.error ?? res.statusText}`,
            draftSaved: true,
          });
          return;
        }
        saveDraft(ensName, grid);
        onSaved(grid, "chain");
        setPublishUi({ phase: "success", cellCount, txCount: result.txCount });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (action === "publish") {
          setPublishUi({ phase: "error", errorMessage: msg });
        } else {
          setSaveMessage(msg);
        }
      } finally {
        setBusy(null);
      }
    },
    [ensName, fields, onSaved, prepareWallet, resolver],
  );

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
              Your wallet signs each field you add (name, avatar, widgets, etc.). More fields = more
              signature prompts.
            </p>
          </>
        ) : (
          <>
            <p className="wallet-banner__text">
              {isConnected
                ? `Switch to ${walletChainLabel(targetChainId)} to sign. Gridz profiles publish on mainnet.`
                : "Connect a wallet to sign and publish — MetaMask, Rainbow, Coinbase, WalletConnect, and more."}
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
        <button
          type="button"
          className="site-btn"
          onClick={() => void runWithWallet("save")}
          disabled={formDisabled}
        >
          {busy === "save" ? "Signing…" : walletReady ? "Sign & save draft" : "Connect & sign draft"}
        </button>
        <button
          type="button"
          className="site-btn site-btn--primary"
          onClick={() => void runWithWallet("publish")}
          disabled={formDisabled}
        >
          {busy === "publish"
            ? "Publishing…"
            : isClaim
              ? walletReady
                ? "Claim & publish"
                : "Connect & claim"
              : walletReady
                ? "Publish to ENS"
                : "Connect & publish"}
        </button>
      </div>

      {publishUi ? (
        <PublishProgress
          phase={publishUi.phase}
          ensName={ensName}
          cellCount={publishUi.cellCount}
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

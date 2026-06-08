"use client";

import { useCallback, useEffect, useState } from "react";
import type { Grid } from "@gridz/core";
import { useWallet, walletChainLabel } from "../lib/wallet";
import { buildProfileGrid } from "../lib/buildProfileGrid";
import { saveDraft } from "../lib/drafts";
import type { Hex } from "viem";

export interface ProfileEditorProps {
  ensName: string;
  initial?: Grid | null;
  onSaved: (grid: Grid, source: "draft" | "chain") => void;
  isClaim?: boolean;
}

function fieldsFromGrid(grid: Grid | null | undefined) {
  const get = (key: string) =>
    (grid?.cells.find((c) => c.key === key)?.value as string | undefined) ?? "";
  return {
    alias: get("alias"),
    description: get("description"),
    url: get("url"),
  };
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
  const [fields, setFields] = useState(() => fieldsFromGrid(initial));
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFields(fieldsFromGrid(initial));
  }, [initial]);

  const resolver = (process.env.NEXT_PUBLIC_GRIDZ_RESOLVER ?? "") as Hex;

  const runWithWallet = useCallback(
    async (action: "save" | "publish") => {
      if (!resolver.startsWith("0x")) {
        setMessage("Missing GRIDZ_RESOLVER — set NEXT_PUBLIC_GRIDZ_RESOLVER in env.");
        return;
      }

      setBusy(action);
      setMessage(null);

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
          setMessage("Signed profile saved as a local draft. Publish to ENS when ready.");
          return;
        }

        setMessage(
          "Signed. The Gridz registrar is submitting on-chain EAS attestations (6 transactions, usually 1–2 minutes). Do not close this tab.",
        );

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
          setMessage(`${prefix}: ${result.error ?? res.statusText} — your signed draft was saved locally.`);
          return;
        }
        saveDraft(ensName, grid);
        onSaved(grid, "chain");
        setMessage(
          `Published to ENS (${result.txCount ?? "?"} writes). Refresh in a minute for on-chain reads.`,
        );
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(null);
      }
    },
    [ensName, fields, onSaved, prepareWallet, resolver],
  );

  const walletReady = Boolean(isConnected && address && isCorrectChain);

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
              Your wallet will sign the profile. Click Claim &amp; publish when your fields look right.
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
              disabled={connecting || busy !== null}
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
        />
      </div>
      <div className="profile-editor__actions">
        <button
          type="button"
          className="site-btn"
          onClick={() => void runWithWallet("save")}
          disabled={busy !== null}
        >
          {busy === "save" ? "Signing…" : walletReady ? "Sign & save draft" : "Connect & sign draft"}
        </button>
        <button
          type="button"
          className="site-btn site-btn--primary"
          onClick={() => void runWithWallet("publish")}
          disabled={busy !== null}
        >
          {busy === "publish"
            ? "Publishing on-chain…"
            : isClaim
              ? walletReady
                ? "Claim & publish"
                : "Connect & claim"
              : walletReady
                ? "Publish to ENS"
                : "Connect & publish"}
        </button>
      </div>
      {message ? (
        <p className="profile-editor__message">{message}</p>
      ) : null}
    </section>
  );
}

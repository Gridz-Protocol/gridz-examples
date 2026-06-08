"use client";

import { useCallback, useEffect, useState } from "react";
import type { Grid } from "@gridz/core";
import { useWallet } from "../lib/wallet";
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

export function ProfileEditor({ ensName, initial, onSaved, isClaim = false }: ProfileEditorProps) {
  const { address, walletClient, chainId, connect } = useWallet();
  const [fields, setFields] = useState(() => fieldsFromGrid(initial));
  const [busy, setBusy] = useState<"save" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFields(fieldsFromGrid(initial));
  }, [initial]);

  const resolver = (process.env.NEXT_PUBLIC_GRIDZ_RESOLVER ?? "") as Hex;

  const runSave = useCallback(async () => {
    if (!walletClient || !address) {
      await connect();
      return;
    }
    if (!resolver.startsWith("0x")) {
      setMessage("Missing GRIDZ_RESOLVER — set NEXT_PUBLIC_GRIDZ_RESOLVER in env.");
      return;
    }
    setBusy("save");
    setMessage(null);
    try {
      const grid = await buildProfileGrid(fields, ensName, walletClient, chainId, resolver);
      saveDraft(ensName, grid);
      onSaved(grid, "draft");
      setMessage("Signed profile saved as a local draft. Publish to ENS when ready.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }, [address, chainId, connect, ensName, fields, onSaved, resolver, walletClient]);

  const runPublish = useCallback(async () => {
    if (!walletClient || !address) {
      await connect();
      return;
    }
    if (!resolver.startsWith("0x")) {
      setMessage("Missing GRIDZ_RESOLVER — set NEXT_PUBLIC_GRIDZ_RESOLVER in env.");
      return;
    }
    setBusy("publish");
    setMessage(null);
    try {
      const grid = await buildProfileGrid(fields, ensName, walletClient, chainId, resolver);
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ensName, grid }),
      });
      const result = (await res.json()) as { ok: boolean; error?: string; txCount?: number };
      if (!result.ok) {
        saveDraft(ensName, grid);
        onSaved(grid, "draft");
        setMessage(result.error ?? "Publish failed — your signed draft was saved locally.");
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
  }, [address, chainId, connect, ensName, fields, onSaved, resolver, walletClient]);

  return (
    <section className="profile-editor">
      <div className="profile-editor__head">
        <h3 style={{ margin: 0 }}>{isClaim ? "Claim your profile" : "Edit profile"}</h3>
        <span className="profile-editor__status">{ensName}</span>
      </div>
      {isClaim && !address ? (
        <p className="profile-editor__hint">
          Connect your wallet in the top-right corner first — it signs your profile. Gridz never
          stores your private key.
        </p>
      ) : null}
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
        <button type="button" className="site-btn" onClick={runSave} disabled={busy !== null}>
          {busy === "save" ? "Signing…" : "Sign & save draft"}
        </button>
        <button type="button" className="site-btn site-btn--primary" onClick={runPublish} disabled={busy !== null}>
          {busy === "publish" ? "Publishing…" : isClaim ? "Claim & publish" : "Publish to ENS"}
        </button>
      </div>
      {message ? (
        <p style={{ margin: "14px 0 0", fontSize: 14, color: "var(--site-muted)" }}>{message}</p>
      ) : null}
    </section>
  );
}

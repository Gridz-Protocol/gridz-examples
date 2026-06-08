"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Grid, GridVerifyResult } from "@gridz/core";
import { verifyGrid } from "@gridz/core";
import {
  curlFetchSnippet,
  profileApiDocsUrl,
  profileApiUrl,
  profileVerifyApiUrl,
  profileVerifyDocsUrl,
  verifyPythonSnippet,
  verifyTypeScriptSnippet,
} from "../lib/profileVerifyGuide";
import { productionVerifyContext } from "../lib/verifyContext";
import { easExplorerAttestationUrl, verifyStatusMeta } from "../lib/verificationUi";
import { FieldVerifyBadge } from "./FieldVerifyBadge";

export interface ProfileVerifyModalProps {
  subject: string;
  /** On-chain grid used for live verification (omit to fetch from API). */
  grid?: Grid | null;
  /** True when the viewer sees local draft fields, not purely on-chain data. */
  isDraft?: boolean;
  onClose: () => void;
}

type VerifyPhase = "idle" | "loading" | "done" | "error";

export function ProfileVerifyModal({
  subject,
  grid: gridProp,
  isDraft = false,
  onClose,
}: ProfileVerifyModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<VerifyPhase>("idle");
  const [report, setReport] = useState<GridVerifyResult | null>(null);
  const [resolvedGrid, setResolvedGrid] = useState<Grid | null>(gridProp ?? null);
  const [error, setError] = useState<string | null>(null);
  const [checkedCount, setCheckedCount] = useState(0);

  const verifyCtx = useMemo(() => productionVerifyContext(subject), [subject]);
  const apiUrl = profileApiUrl(subject);
  const verifyApiUrl = profileVerifyApiUrl(subject);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPhase("loading");
      setError(null);
      setReport(null);
      setCheckedCount(0);

      try {
        let grid = gridProp ?? null;
        if (!grid) {
          const res = await fetch(apiUrl);
          const data = (await res.json()) as { ok?: boolean; grid?: Grid; error?: string };
          if (!data.ok || !data.grid) {
            throw new Error(data.error ?? "Profile not published on-chain yet");
          }
          grid = data.grid;
        }
        setResolvedGrid(grid);

        const cells = grid.cells.filter((c) => c.is_visible && !c.key.startsWith("gridz.att["));
        for (let i = 0; i < cells.length; i++) {
          if (cancelled) return;
          setCheckedCount(i + 1);
          await new Promise((r) => setTimeout(r, 40));
        }

        const result = await verifyGrid(grid, verifyCtx);
        if (cancelled) return;
        setReport(result);
        setPhase("done");
        setCheckedCount(cells.length);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Verification failed");
        setPhase("error");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, gridProp, verifyCtx]);

  const visibleCells = report?.cells ?? [];
  const verifiedCount = visibleCells.filter((c) => c.result.ok).length;

  return (
    <div className="verify-modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="verify-modal verify-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="verify-modal__head">
          <div>
            <h2 id={titleId} className="verify-modal__title">
              Verify profile
            </h2>
            <p className="verify-modal__sub">
              <code>{subject}</code> — each field checked against Base EAS + GridzResolver (no trust in
              this page).
            </p>
          </div>
          <button type="button" className="verify-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {isDraft ? (
          <p className="verify-modal__note">
            You are viewing a <strong>local draft</strong>. Verification below uses the{" "}
            <strong>published on-chain</strong> profile.
          </p>
        ) : null}

        <section className="verify-modal__section">
          <h3>Live verification</h3>
          {phase === "loading" ? (
            <p className="verify-modal__scan">
              Scanning fields… {checkedCount > 0 ? `${checkedCount} checked` : "connecting to Base"}
            </p>
          ) : null}
          {phase === "error" ? <p className="verify-modal__error">{error}</p> : null}
          {phase === "done" && report ? (
            <>
              <p className={`verify-modal__summary${report.ok ? " verify-modal__summary--ok" : ""}`}>
                {report.ok
                  ? `✓ All ${verifiedCount} fields verified on-chain`
                  : `⚠ ${verifiedCount} of ${visibleCells.length} fields verified`}
              </p>
              <ul className="verify-results">
                {visibleCells.map(({ key, result }) => {
                  const meta = verifyStatusMeta(result.status, result.proof, result.reason);
                  const uid = resolvedGrid?.cells.find((c) => c.key === key)?.attestation.uid;
                  return (
                    <li key={key} className={`verify-results__row verify-results__row--${meta.tone}`}>
                      <span className="verify-results__key">{key}</span>
                      <FieldVerifyBadge status={result.status} proof={result.proof} reason={result.reason} />
                      {uid && uid !== `0x${"0".repeat(64)}` ? (
                        <a
                          href={easExplorerAttestationUrl(uid)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="verify-results__link"
                        >
                          EAS
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="verify-modal__root">
                Root:{" "}
                <FieldVerifyBadge
                  status={report.root.status}
                  proof={report.root.proof}
                  reason={report.root.reason}
                />
              </p>
            </>
          ) : null}
        </section>

        <section className="verify-modal__section">
          <h3>Verify API</h3>
          <p>Agents and scripts can fetch the grid plus a full verification report in one request.</p>
          <pre className="verify-modal__code">
            <code>{`GET ${verifyApiUrl}`}</code>
          </pre>
          <div className="verify-modal__links">
            <a href={verifyApiUrl} target="_blank" rel="noreferrer noopener">
              Open verify JSON
            </a>
            <span aria-hidden> · </span>
            <a href={apiUrl} target="_blank" rel="noreferrer noopener">
              Profile JSON
            </a>
            <span aria-hidden> · </span>
            <a href={profileApiDocsUrl()} target="_blank" rel="noreferrer noopener">
              API docs
            </a>
          </div>
        </section>

        <section className="verify-modal__section verify-modal__section--muted">
          <h3>Offline verification</h3>
          <p className="verify-modal__label">TypeScript (with EAS RPC context)</p>
          <pre className="verify-modal__code">
            <code>{verifyTypeScriptSnippet(subject)}</code>
          </pre>
          <p className="verify-modal__label">Python</p>
          <pre className="verify-modal__code">
            <code>{verifyPythonSnippet(subject)}</code>
          </pre>
          <p className="verify-modal__label">curl</p>
          <pre className="verify-modal__code">
            <code>{curlFetchSnippet(subject)}</code>
          </pre>
          <p>
            Full guide:{" "}
            <a href={profileVerifyDocsUrl()} target="_blank" rel="noreferrer noopener">
              Verification docs
            </a>
          </p>
        </section>

        <footer className="verify-modal__foot">
          <button type="button" className="site-btn site-btn--primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

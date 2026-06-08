"use client";

import { useEffect, useId, useRef } from "react";
import {
  curlFetchSnippet,
  profileApiDocsUrl,
  profileApiUrl,
  profileVerifyDocsUrl,
  verifyPythonSnippet,
  verifyTypeScriptSnippet,
} from "../lib/profileVerifyGuide";

export interface ProfileVerifyModalProps {
  subject: string;
  /** True when the viewer sees local draft fields, not purely on-chain data. */
  isDraft?: boolean;
  onClose: () => void;
}

export function ProfileVerifyModal({ subject, isDraft = false, onClose }: ProfileVerifyModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

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

  const apiUrl = profileApiUrl(subject);

  return (
    <div className="verify-modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="verify-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="verify-modal__head">
          <div>
            <h2 id={titleId} className="verify-modal__title">
              Query &amp; verify on-chain
            </h2>
            <p className="verify-modal__sub">
              Profile <code>{subject}</code> — read from Ethereum / ENS without trusting this page.
            </p>
          </div>
          <button type="button" className="verify-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {isDraft ? (
          <p className="verify-modal__note">
            You are viewing a <strong>local draft</strong> in this browser. The steps below read the{" "}
            <strong>published on-chain</strong> profile only. Sign &amp; publish to make draft changes
            queryable.
          </p>
        ) : null}

        <section className="verify-modal__section">
          <h3>1. Query the profile (read API)</h3>
          <p>
            Fetch the signed Grid JSON from gridz.bio. Each cell includes attestation metadata (EAS UID,
            value hash, signer).
          </p>
          <pre className="verify-modal__code">
            <code>{`GET ${apiUrl}`}</code>
          </pre>
          <div className="verify-modal__links">
            <a href={apiUrl} target="_blank" rel="noreferrer noopener">
              Open JSON response
            </a>
            <span aria-hidden> · </span>
            <a href={profileApiDocsUrl()} target="_blank" rel="noreferrer noopener">
              API docs
            </a>
          </div>
          <pre className="verify-modal__code">
            <code>{curlFetchSnippet(subject)}</code>
          </pre>
        </section>

        <section className="verify-modal__section">
          <h3>2. Verify signatures (offline)</h3>
          <p>
            Run the open-source verifier on the JSON — no trust in gridz.bio required. Badges on this
            page use the same checks in your browser.
          </p>
          <p className="verify-modal__label">TypeScript</p>
          <pre className="verify-modal__code">
            <code>{verifyTypeScriptSnippet(subject)}</code>
          </pre>
          <p className="verify-modal__label">Python</p>
          <pre className="verify-modal__code">
            <code>{verifyPythonSnippet(subject)}</code>
          </pre>
          <p className="verify-modal__label">CLI</p>
          <pre className="verify-modal__code">
            <code>{`curl -s "${apiUrl}" | jq .grid > grid.json\ngridz grid verify grid.json`}</code>
          </pre>
        </section>

        <section className="verify-modal__section">
          <h3>3. Cross-check on Ethereum</h3>
          <p>
            Published cells link to{" "}
            <a href="https://easscan.org" target="_blank" rel="noreferrer noopener">
              EAS attestations
            </a>{" "}
            on mainnet. Copy a cell&apos;s <code>attestation.uid</code> from the JSON and look it up on
            easscan. The GridzResolver also serves values via standard ENS <code>text()</code> reads for
            advanced integrations.
          </p>
        </section>

        <section className="verify-modal__section verify-modal__section--muted">
          <h3>What verification proves</h3>
          <ul>
            <li>The wallet behind the ENS name signed each field value.</li>
            <li>The grid root binds all cells under one subject.</li>
            <li>On-chain attestations are not expired or revoked.</li>
          </ul>
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

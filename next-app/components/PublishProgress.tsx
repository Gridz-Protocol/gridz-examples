"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { estimatePublishMs, formatPublishEta } from "../lib/publishEstimate";

export type PublishUiPhase = "signing" | "publishing" | "success" | "error";

export interface PublishProgressProps {
  phase: PublishUiPhase;
  ensName: string;
  cellCount?: number;
  signCount?: number;
  txCount?: number;
  errorMessage?: string;
  draftSaved?: boolean;
  onDismiss?: () => void;
}

export function PublishProgress({
  phase,
  ensName,
  cellCount = 1,
  signCount,
  txCount,
  errorMessage,
  draftSaved,
  onDismiss,
}: PublishProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const estimateMs = useMemo(() => estimatePublishMs(cellCount), [cellCount]);

  useEffect(() => {
    if (phase !== "publishing") {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [phase, cellCount]);

  const publishProgress =
    phase === "success"
      ? 100
      : phase === "publishing"
        ? Math.min(96, (elapsed / estimateMs) * 100)
        : phase === "signing"
          ? 8
          : 0;

  const etaSec = Math.max(0, Math.ceil((estimateMs - elapsed) / 1000));
  const profilePath = `/${encodeURIComponent(ensName)}`;
  const alias = ensName.split(".")[0] ?? ensName;

  const steps = [
    { id: "sign", label: "Signed", done: phase !== "signing", active: phase === "signing" },
    {
      id: "chain",
      label: "On-chain",
      done: phase === "success",
      active: phase === "publishing",
    },
    { id: "live", label: "Live", done: phase === "success", active: false },
  ] as const;

  return (
    <div
      className={`publish-progress publish-progress--${phase}`}
      role="status"
      aria-live="polite"
      aria-busy={phase === "signing" || phase === "publishing"}
    >
      {phase === "signing" ? (
        <div className="publish-progress__head">
          <span className="publish-progress__spinner" aria-hidden />
          <div>
            <p className="publish-progress__title">
              {signCount && signCount > 1
                ? `Signing ${signCount} update${signCount === 1 ? "" : "s"}`
                : "Signing your profile"}
            </p>
            <p className="publish-progress__sub">
              {signCount && cellCount != null
                ? `You'll see ${signCount} wallet prompt${signCount === 1 ? "" : "s"}, then we publish ${cellCount} changed field${cellCount === 1 ? "" : "s"} on-chain.`
                : signCount
                  ? signCount === 1
                    ? "Confirm the profile root in your wallet…"
                    : `Confirm ${signCount} wallet prompts — changed fields plus the profile root.`
                  : "Confirm each prompt in your wallet…"}
            </p>
          </div>
        </div>
      ) : null}

      {phase === "publishing" ? (
        <>
          <div className="publish-progress__head">
            <span className="publish-progress__spinner" aria-hidden />
            <div>
              <p className="publish-progress__title">Publishing to Ethereum</p>
              <p className="publish-progress__sub">
                Confirm ~{cellCount * 2} Ethereum transaction{cellCount * 2 === 1 ? "" : "s"} in your wallet
                ({cellCount} EAS attest{cellCount === 1 ? "" : "s"} + {cellCount} resolver link
                {cellCount === 1 ? "" : "s"}). You pay gas. Keep this tab open.
              </p>
            </div>
          </div>
          <div className="publish-progress__track" aria-hidden>
            <div
              className="publish-progress__fill"
              style={{ width: `${publishProgress}%` }}
            />
          </div>
          <p className="publish-progress__eta">{formatPublishEta(etaSec)}</p>
        </>
      ) : null}

      {phase === "success" ? (
        <>
          <div className="publish-progress__track publish-progress__track--done" aria-hidden>
            <div className="publish-progress__fill" style={{ width: "100%" }} />
          </div>
        <div className="publish-progress__success">
          <span className="publish-progress__check" aria-hidden>
            ✓
          </span>
          <div>
            <p className="publish-progress__title">Profile published</p>
            <p className="publish-progress__sub">
              <strong>{alias}</strong> is live on ENS
              {txCount ? ` (${txCount} on-chain writes)` : ""}. It may take a minute to appear
              everywhere.
            </p>
          </div>
          <div className="publish-progress__actions">
            <Link href={profilePath} className="site-btn site-btn--primary">
              View profile
            </Link>
            {onDismiss ? (
              <button type="button" className="site-btn site-btn--ghost" onClick={onDismiss}>
                Done
              </button>
            ) : null}
          </div>
        </div>
        </>
      ) : null}

      {phase === "error" ? (
        <div className="publish-progress__error">
          <span className="publish-progress__error-icon" aria-hidden>
            !
          </span>
          <div>
            <p className="publish-progress__title">Publish didn&apos;t finish</p>
            <p className="publish-progress__sub">{errorMessage}</p>
            {draftSaved ? (
              <p className="publish-progress__sub">Your unsigned draft was saved in this browser.</p>
            ) : null}
          </div>
          {onDismiss ? (
            <button type="button" className="site-btn site-btn--ghost" onClick={onDismiss}>
              Dismiss
            </button>
          ) : null}
        </div>
      ) : null}

      {phase !== "error" ? (
        <ol className="publish-progress__steps">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`publish-progress__step${step.done ? " publish-progress__step--done" : ""}${step.active ? " publish-progress__step--active" : ""}`}
            >
              <span className="publish-progress__step-dot" aria-hidden />
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

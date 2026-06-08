"use client";

import type { BadgeStatus } from "@gridz/react";
import type { VerifyProof } from "@gridz/core";
import { verifyStatusMeta } from "../lib/verificationUi";

export interface FieldVerifyBadgeProps {
  status: BadgeStatus;
  proof?: VerifyProof;
  reason?: string;
  compact?: boolean;
}

export function FieldVerifyBadge({ status, proof, reason, compact = false }: FieldVerifyBadgeProps) {
  const meta = verifyStatusMeta(status, proof, reason);
  return (
    <span
      className={`field-verify-badge field-verify-badge--${meta.tone}${compact ? " field-verify-badge--compact" : ""}`}
      title={meta.title}
      aria-label={meta.title}
    >
      <span aria-hidden>{meta.glyph}</span>
      {compact ? null : <span className="field-verify-badge__label">{meta.label}</span>}
    </span>
  );
}

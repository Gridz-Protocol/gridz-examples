import type { VerifyProof, VerifyResult, VerifyStatus } from "@gridz/core";
import { GRIDZ_BASE_MAINNET } from "./gridzDeployments";

export interface VerifyBadgeMeta {
  glyph: string;
  tone: "verified" | "onchain" | "failed" | "loading" | "warn";
  title: string;
  label: string;
}

export function verifyStatusMeta(
  status: VerifyStatus | "loading",
  proof?: VerifyProof,
  reason?: string,
): VerifyBadgeMeta {
  if (status === "loading") {
    return { glyph: "…", tone: "loading", title: "Verifying…", label: "Checking" };
  }
  if (status === "verified") {
    const eas = proof === "eas-onchain";
    const manifest = proof === "manifest";
    return {
      glyph: "✓",
      tone: "verified",
      title: eas
        ? "Verified on-chain via EAS attestation"
        : manifest
          ? "Resolver manifest (per-cell EAS attestations)"
          : "Signature verified",
      label: eas ? "On-chain" : manifest ? "Manifest" : "Verified",
    };
  }
  if (status === "expired") {
    return {
      glyph: "⚠",
      tone: "warn",
      title: reason ?? "Attestation expired or revoked",
      label: "Expired",
    };
  }
  if (status === "unsupported") {
    return {
      glyph: "?",
      tone: "warn",
      title: reason ?? "Cannot verify locally (connect to Base for EAS check)",
      label: "Unverified",
    };
  }
  return {
    glyph: "✗",
    tone: "failed",
    title: reason ?? "Verification failed",
    label: "Failed",
  };
}

export function easExplorerAttestationUrl(uid: string): string {
  return `${GRIDZ_BASE_MAINNET.easExplorer}/attestation/view/${uid}`;
}

export function verifyResultSummary(result: VerifyResult): string {
  const meta = verifyStatusMeta(result.status, result.proof, result.reason);
  return meta.title;
}

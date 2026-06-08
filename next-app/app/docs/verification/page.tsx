export default function VerificationPage() {
  return (
    <>
      <h1>Verification</h1>
      <p>
        Every cell on a Gridz profile can be independently verified. You don&apos;t have to trust
        gridz.bio — verification runs in your browser (or your own script) against Base EAS and the
        GridzResolver.
      </p>

      <h2>On the website</h2>
      <p>
        Every profile page has a <strong>Verify profile</strong> button in the toolbar (formerly
        &quot;Query &amp; verify&quot;). It opens a live scanner that checks each field against on-chain
        EAS attestations and shows a green check when verified.
      </p>
      <p>
        Published profiles also show per-field badges on hero fields, social links, and widget cards.
        Hover a badge for attestation format and status. When all cells pass, the profile header shows{" "}
        <strong>✓ Verified</strong>.
      </p>
      <p>
        If you see a <strong>Draft</strong> badge, verification uses the published on-chain profile,
        not local browser edits.
      </p>

      <h2>Verify API (one request)</h2>
      <p>
        Fetch the grid plus a full verification report — same checks as the website modal:
      </p>
      <pre>
        <code>{`GET https://gridz.bio/api/verify/demo.gridz.eth

{
  "ok": true,
  "subject": "demo.gridz.eth",
  "grid": { ... },
  "report": {
    "ok": true,
    "cells": [{ "key": "alias", "result": { "status": "verified", "proof": "eas-onchain" } }],
    "root": { "status": "verified", "proof": "manifest" }
  }
}`}</code>
      </pre>

      <h2>Offline verification (TypeScript)</h2>
      <p>
        For <code>eas-onchain</code> cells loaded from the API, pass an EAS RPC context so{" "}
        <code>verifyGrid</code> can fetch attestations from Base:
      </p>
      <pre>
        <code>{`import { verifyGrid } from "@gridz/core";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const { grid } = await fetch("https://gridz.bio/api/profile/kevin.gridz.eth").then((r) => r.json());
const client = createPublicClient({ chain: base, transport: http("https://base.publicnode.com") });

const report = await verifyGrid(grid, {
  allowDelegated: true,
  eas: {
    chainId: 8453,
    easAddress: "0x4200000000000000000000000000000000000021",
    cellSchemaUid: "0x394d8e67b1470cbdb7fa6c7d15d15d295ca81d822b55267939751a8a686abb87",
    resolverAddress: "0x73c5e3944B780D4927c403d351A4F94875DC57B3",
    subjectEns: "kevin.gridz.eth",
    readContract: (args) => client.readContract(args),
  },
});`}</code>
      </pre>

      <h2>Offline verification (Python)</h2>
      <pre>
        <code>{`from gridz import verify_grid
import httpx

grid = httpx.get("https://gridz.bio/api/profile/kevin.gridz.eth").json()["grid"]
report = verify_grid(grid)`}</code>
      </pre>

      <h2>CLI</h2>
      <pre>
        <code>{`gridz grid verify grid.json`}</code>
      </pre>

      <h2>What verification proves</h2>
      <ul>
        <li>Each cell value matches its on-chain EAS attestation (schema, attester, not revoked).</li>
        <li>The GridzResolver points at the same EAS UID and serves the same value via <code>text()</code>.</li>
        <li>Inline EIP-712 payloads (drafts / exports) additionally recover the signer locally.</li>
      </ul>
      <p>
        Verification does <em>not</em> prove a human is &quot;really&quot; who they claim — it proves
        the cryptographic identity behind the ENS name signed the content.
      </p>
    </>
  );
}

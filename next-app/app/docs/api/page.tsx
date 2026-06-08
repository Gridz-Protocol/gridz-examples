export default function ApiDocsPage() {
  const bio = "gridz.bio";

  return (
    <>
      <h1>API &amp; integrations</h1>
      <p>
        gridz.bio exposes a simple read API for public profiles. For write flows, you sign locally
        with your wallet (or CLI/SDK) — the server never holds your private key.
      </p>

      <h2>gridz.bio Profile API</h2>
      <p>Read any published profile as JSON. CORS is open; safe to call from browsers and servers.</p>

      <h3>Get a profile</h3>
      <pre>
        <code>{`GET https://${bio}/api/profile/{ensName}

# Example
GET https://${bio}/api/profile/kevin.gridz.eth`}</code>
      </pre>

      <h3>Success response</h3>
      <pre>
        <code>{`{
  "ok": true,
  "subject": "kevin.gridz.eth",
  "grid": {
    "schema_version": "gridz/1.0.0",
    "subject": {
      "type": "human",
      "did": "did:ens:kevin.gridz.eth",
      "ens": "kevin.gridz.eth",
      "display_name": "Kevin"
    },
    "theme": { ... },
    "cells": [
      {
        "id": "alias",
        "key": "alias",
        "value": "Kevin",
        "attestation": { "format": "eas-onchain", "uid": "0x...", ... }
      }
    ],
    "root_attestation": { ... }
  },
  "api": {
    "docs": "https://gridz.bio/docs",
    "render": "https://gridz.bio/kevin.gridz.eth"
  }
}`}</code>
      </pre>

      <h3>Not found</h3>
      <pre>
        <code>{`{
  "ok": false,
  "subject": "kevin.gridz.eth",
  "grid": null,
  "error": "Profile not found"
}`}</code>
      </pre>
      <p>
        A 404 means nothing is published on-chain for that name yet (a local browser draft does not
        count).
      </p>

      <h2>Publishing via gridz.bio</h2>
      <p>The claim UI handles publish for you. Under the hood:</p>
      <ol>
        <li>
          <strong>Draft locally</strong> — <strong>Save draft</strong> stores unsigned field edits in
          localStorage (no wallet). Not visible via this API.
        </li>
        <li>
          <strong>You sign</strong> — <strong>Sign &amp; publish</strong> prompts your wallet for only{" "}
          <em>changed</em> cells plus the grid root (EIP-712). Unchanged cells reuse prior
          attestations.
        </li>
        <li>
          <strong>Server attests</strong> — <code>POST /api/publish</code> takes your signed Grid,
          writes new EAS attestations for changed cells, and batches GridzResolver{" "}
          <code>setCellAttestation</code> calls via Multicall3. Uses a registrar key on the server;
          you do not sign those transactions.
        </li>
        <li>
          <strong>Public read</strong> — this API and profile pages read attestations back from the
          resolver. Use <strong>Query &amp; verify</strong> on any profile for fetch + verify
          instructions.
        </li>
      </ol>
      <p>
        <code>POST /api/publish</code> is called by the gridz.bio editor, not meant for arbitrary
        third-party writes. To publish programmatically, use the <a href="/docs/cli">CLI</a> or{" "}
        <code>@gridz/sdk</code> with your own signer and sink.
      </p>

      <h2>Reference API server (<code>@gridz/server</code>)</h2>
      <p>
        The open-source <code>@gridz/server</code> package implements a full Gridz API (Fastify +
        OpenAPI 3.1). Self-host it if you want your own write/read endpoints — for example behind an
        agent or internal tool.
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>GET /grids/&#123;subject&#125;</code>
            </td>
            <td>Fetch a full Grid by ENS name or DID.</td>
          </tr>
          <tr>
            <td>
              <code>POST /grids/&#123;subject&#125;</code>
            </td>
            <td>Upsert a Grid — requires a signed root attestation in the body.</td>
          </tr>
          <tr>
            <td>
              <code>GET /grids/&#123;subject&#125;/cells/&#123;key&#125;</code>
            </td>
            <td>Fetch one cell.</td>
          </tr>
          <tr>
            <td>
              <code>PUT /grids/&#123;subject&#125;/cells/&#123;key&#125;</code>
            </td>
            <td>Upsert one cell — requires a signed cell attestation.</td>
          </tr>
          <tr>
            <td>
              <code>POST /verify</code>
            </td>
            <td>Verify a Grid or attestation server-side.</td>
          </tr>
        </tbody>
      </table>
      <p>
        The server validates signatures and never custodies keys. OpenAPI spec:{" "}
        <code>specs/openapi.yaml</code> in the{" "}
        <a href="https://github.com/Gridz-Protocol/gridz" target="_blank" rel="noreferrer">
          gridz repo
        </a>
        .
      </p>

      <h2>TypeScript SDK</h2>
      <pre>
        <code>{`import { GridzClient, verifyGrid, buildGrid } from "@gridz/sdk";

// Read from any Gridz-compatible API
const client = new GridzClient({ baseUrl: "https://gridz.bio" });
const grid = await client.getGrid("kevin.gridz.eth");

// Verify locally
const report = await verifyGrid(grid);`}</code>
      </pre>
      <p>
        <code>@gridz/sdk</code> re-exports <code>@gridz/core</code> build/verify helpers so you can
        sign locally and push with one import. See <a href="/docs/toolkit">Toolkit</a>.
      </p>

      <h2>Python</h2>
      <pre>
        <code>{`from gridz import verify_grid
import httpx

grid = httpx.get("https://gridz.bio/api/profile/kevin.gridz.eth").json()["grid"]
report = verify_grid(grid)`}</code>
      </pre>
    </>
  );
}

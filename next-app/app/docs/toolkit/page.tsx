export default function ToolkitPage() {
  return (
    <>
      <h1>Toolkit</h1>
      <p>
        Gridz is a monorepo of specs, packages, contracts, and examples. You don&apos;t need any of
        this to <a href="/claim">claim a profile</a> — but if you&apos;re building an app, agent, or
        integration, here&apos;s what each piece is for.
      </p>

      <h2>TypeScript packages (<code>@gridz/*</code>)</h2>
      <p>
        Published from{" "}
        <a href="https://github.com/Gridz-Protocol/gridz-js" target="_blank" rel="noreferrer">
          gridz-js
        </a>
        . Install with <code>pnpm add @gridz/core</code> (etc.) once on npm, or develop from the
        superproject.
      </p>

      <table className="docs-table">
        <thead>
          <tr>
            <th>Package</th>
            <th>You use it when…</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>@gridz/core</code>
            </td>
            <td>
              You need the Grid types, EIP-712 signing, canonicalization, merkle root, or offline{" "}
              <code>verifyGrid()</code>. Foundation for everything else.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/sdk</code>
            </td>
            <td>
              You want a typed HTTP client over a Gridz API plus core build/verify in one import.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/cli</code>
            </td>
            <td>
              You prefer the terminal: scaffold <code>gridz.yaml</code>, build/verify JSON, publish
              to a sink. See <a href="/docs/cli">CLI</a>.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/sinks</code>
            </td>
            <td>
              You need to <em>store</em> or <em>read</em> a Grid somewhere — ENS (primary for
              gridz.bio), SQLite, Postgres, S3, etc. Sinks are projections; signatures stay
              authoritative.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/server</code>
            </td>
            <td>
              You self-host a Gridz API (read + attestation-validated writes). Not required for
              gridz.bio users.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/react</code>
            </td>
            <td>
              You render a Grid in React with verification badges. gridz.bio uses a custom Spritz
              layout, but <code>@gridz/react</code> is the reference renderer.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/vue</code> · <code>@gridz/svelte</code> · <code>@gridz/element</code>
            </td>
            <td>
              Same renderer for Vue, Svelte, or a drop-in <code>&lt;gridz-profile&gt;</code> web
              component.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/mcp</code>
            </td>
            <td>
              You wire Gridz into an AI agent via Model Context Protocol — read/write Grids from
              Cursor, Claude Desktop, etc. Never signs server-side.
            </td>
          </tr>
          <tr>
            <td>
              <code>@gridz/oneclaw</code>
            </td>
            <td>
              Your agent identity uses a 1Claw HSM instead of a browser wallet. Optional; humans can
              ignore this.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Python packages</h2>
      <p>
        From{" "}
        <a href="https://github.com/Gridz-Protocol/gridz-py" target="_blank" rel="noreferrer">
          gridz-py
        </a>
        . Cross-runtime compatible with TypeScript — same signatures, same verification results.
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Package</th>
            <th>You use it when…</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>gridz</code>
            </td>
            <td>
              Core types, signing, and verification in Python (mirrors <code>@gridz/core</code> +
              SDK client).
            </td>
          </tr>
          <tr>
            <td>
              <code>gridz_sinks</code>
            </td>
            <td>
              Python sink adapters (ENS, SQLite, etc.).
            </td>
          </tr>
          <tr>
            <td>
              <code>gridz_mcp</code>
            </td>
            <td>
              MCP server for Python-based agents.
            </td>
          </tr>
          <tr>
            <td>
              <code>gridz_oneclaw</code>
            </td>
            <td>
              1Claw HSM signer adapter for Python agents.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Smart contracts</h2>
      <p>
        From{" "}
        <a href="https://github.com/Gridz-Protocol/gridz-contracts" target="_blank" rel="noreferrer">
          gridz-contracts
        </a>
        .
      </p>
      <h3>GridzResolver</h3>
      <p>
        The on-chain piece behind <code>*.gridz.eth</code> profiles. It is an ENSIP-10 wildcard
        resolver: when someone looks up <code>you.gridz.eth</code>, the resolver returns text records
        backed by <strong>EAS attestations</strong> on Ethereum mainnet.
      </p>
      <ul>
        <li>
          <strong>What you care about</strong> — your published cells (alias, bio, url, widgets) are
          EAS attestations linked to your ENS namehash. Anyone with an RPC can read them; gridz.bio
          and the API are convenience layers.
        </li>
        <li>
          <strong>What you don&apos;t need</strong> — deploying or upgrading the resolver. That is
          protocol infrastructure; claiming a profile uses it automatically.
        </li>
      </ul>
      <p>
        Under the hood: each cell gets an EAS attestation with schema <code>gridz.cell.v1</code>; the
        resolver stores the attestation UID per <code>(node, key)</code> and serves decoded values via
        standard ENS <code>text()</code> reads.
      </p>

      <h2>Specs (source of truth)</h2>
      <p>
        The <code>specs/</code> folder in the{" "}
        <a href="https://github.com/Gridz-Protocol/gridz" target="_blank" rel="noreferrer">
          gridz
        </a>{" "}
        superproject defines the Grid JSON schema, attestation envelope, EIP-712 types, canonicalization rules,
        and OpenAPI 3.1 API. SDKs are generated and tested against these — not the other way around.
      </p>

      <h2>Examples</h2>
      <ul>
        <li>
          <strong>gridz.bio (<code>examples/next-app</code>)</strong> — this site: claim UI, Spritz
          profile pages, widget editor, unsigned drafts, incremental sign/publish, profile API, EAS
          publish. Source:{" "}
          <a href="https://github.com/Gridz-Protocol/gridz-examples" target="_blank" rel="noreferrer">
            gridz-examples
          </a>
          .
        </li>
        <li>
          <strong>demo.gridz.eth</strong> — live widget showcase; refresh with{" "}
          <code>pnpm demo:publish</code> from the examples app.
        </li>
        <li>
          <strong>minimal-cli</strong> — smallest end-to-end flow: <code>gridz.yaml</code> → sign →
          sink → verify → static HTML.
        </li>
        <li>
          <strong>scaffold-agent-grid</strong> — agent-oriented Grid bootstrap.
        </li>
        <li>
          <strong>oneclaw-quickstart</strong> — agent signing with 1Claw HSM.
        </li>
      </ul>

      <h2>How the pieces connect</h2>
      <pre>
        <code>{`You (wallet / CLI / agent signer)
        │
        ▼ sign cells + root  (@gridz/core)
        │
        ▼ publish            (@gridz/cli / gridz.bio / @gridz/sinks → ENS)
        │
        ▼ on-chain           (GridzResolver + EAS on Ethereum)
        │
        ├─► gridz.bio page   (read + render)
        ├─► Profile API      (read JSON)
        ├─► @gridz/react     (embed in your app)
        └─► verifyGrid()     (offline proof — no trust required)`}</code>
      </pre>
    </>
  );
}

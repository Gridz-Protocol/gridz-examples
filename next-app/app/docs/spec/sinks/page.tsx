import Link from "next/link";

export default function SpecSinksPage() {
  return (
    <>
      <h1>Sinks &amp; projections</h1>
      <p>
        A signed Grid is the canonical model. Everything else — a profile page, a REST API response, a
        SQL table, or a knowledge graph — is a <strong>projection</strong> (a <strong>sink</strong>).
        Projections make Grids easy to query, render, and integrate. They are never authoritative:
        verification always goes back to the signed attestation on each cell.
      </p>

      <h2>Source of truth vs output</h2>
      <pre>{`Signed Grid (gridz/1.0.0)
  subject + theme + cells[] + root_attestation
  └── each cell.attestation  ◄── source of truth
           │
           │  publish / sync (projection only)
           ▼
    ┌──────┴──────┬──────────────┬─────────────┬──────────────┐
    ▼             ▼              ▼             ▼              ▼
 gridz.bio    GET /api/     Postgres /     Neo4j         S3 / Redis
 (HTML UI)    profile       SQLite         (graph)       (object/KV)
              (JSON)        (relational)`}</pre>
      <p>
        gridz.bio is one consumer of the spec — not the only output. The same verified Grid can
        simultaneously exist as:
      </p>
      <ul>
        <li>
          <strong>Rendered UI</strong> — HTML/React page (e.g. <code>kevin.gridz.bio</code>)
        </li>
        <li>
          <strong>HTTP JSON</strong> — <code>GET /api/profile/kevin.gridz.eth</code>
        </li>
        <li>
          <strong>On-chain index</strong> — EAS attestations + <code>GridzResolver</code> on Base (
          <Link href="/docs/spec/on-chain">see on-chain</Link>)
        </li>
        <li>
          <strong>Relational database</strong> — Postgres, MySQL, SQLite for SQL analytics and joins
        </li>
        <li>
          <strong>Knowledge graph</strong> — Neo4j for traversals, agent discovery, linked data
        </li>
        <li>
          <strong>Object / document stores</strong> — S3, MongoDB, Redis for caching and bulk export
        </li>
      </ul>
      <p>
        Any projection can be <strong>rebuilt</strong> from the signed Grid. If a database row
        disagrees with an attestation, the attestation wins.
      </p>

      <h2>Sink interface</h2>
      <p>
        <code>@gridz/sinks</code> (TypeScript) and <code>gridz_sinks</code> (Python) implement a
        common adapter pattern. Each sink exposes:
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Operation</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>write(cells, ctx)</code>
            </td>
            <td>
              Project signed cells into the sink. Returns a <code>WriteResult</code> per cell with a{" "}
              <code>sink_native_uri</code> (where the copy landed).
            </td>
          </tr>
          <tr>
            <td>
              <code>read(query)</code>
            </td>
            <td>
              Fetch cells by subject DID (and optional key filter). Used to assemble a Grid for
              rendering or re-verification.
            </td>
          </tr>
          <tr>
            <td>
              <code>delete(cellIds)</code>
            </td>
            <td>Remove projected cells from the sink (does not revoke on-chain attestations).</td>
          </tr>
          <tr>
            <td>
              <code>project?(grid)</code>
            </td>
            <td>
              Optional whole-Grid projection into an alternate shape (e.g. a graph view). Sinks with{" "}
              <code>capabilities.project: true</code> may implement this.
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        A sink write is <strong>never authoritative</strong>. It only records where a copy was stored.
        The signed <code>attestation</code> on each cell remains the proof; consumers call{" "}
        <code>verifyGrid</code> against the assembled Grid, not against the sink alone.
      </p>

      <h2>Database projections</h2>
      <p>
        Relational and document sinks store one row (or document) per cell, keyed by{" "}
        <code>(subject.did, cell.key)</code>. The full cell JSON — including the attestation envelope —
        is persisted so the Grid can be reconstructed and verified offline.
      </p>

      <h3>Tabular pattern (SQLite, Postgres, MySQL)</h3>
      <pre>{`CREATE TABLE gridz_cells (
  subject     TEXT NOT NULL,   -- subject DID
  key         TEXT NOT NULL,   -- cell key, e.g. com.github
  id          TEXT NOT NULL,   -- stable cell id
  value_hash  TEXT NOT NULL,   -- attestation.value_hash (indexed)
  cell_json   TEXT NOT NULL,   -- full signed cell
  written_at  TIMESTAMPTZ,
  PRIMARY KEY (subject, key)
);`}</pre>
      <p>Typical uses:</p>
      <ul>
        <li>
          <strong>Analytics</strong> — <code>SELECT key, COUNT(*) FROM gridz_cells GROUP BY key</code>{" "}
          across all subjects
        </li>
        <li>
          <strong>Search</strong> — find every profile with a <code>com.github</code> cell or a specific{" "}
          <code>agent-endpoint[mcp]</code>
        </li>
        <li>
          <strong>ETL</strong> — sync on-chain or API-fetched Grids into a warehouse for BI tools
        </li>
        <li>
          <strong>Local dev</strong> — SQLite (<code>:memory:</code> or file) with no chain dependency
        </li>
      </ul>
      <p>
        CLI: <code>gridz publish --sink sqlite --grid grid.json</code>. See{" "}
        <Link href="/docs/cli">CLI</Link>.
      </p>

      <h3>Document &amp; object stores</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Sink</th>
            <th>Layout</th>
            <th>Use case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>MongoDB</td>
            <td>One document per cell, indexed by subject + key</td>
            <td>Flexible schema, nested widget values, agent context blobs</td>
          </tr>
          <tr>
            <td>S3</td>
            <td>
              <code>{`s3://bucket/{subject}/{key}.json`}</code>
            </td>
            <td>Static export, CDN-backed profile archives, backup</td>
          </tr>
          <tr>
            <td>Redis</td>
            <td>Key-value per cell</td>
            <td>Low-latency cache in front of chain or Postgres</td>
          </tr>
        </tbody>
      </table>

      <h2>Knowledge graph projection</h2>
      <p>
        A Grid is already a small graph in structure: a <strong>subject</strong> node connected to many{" "}
        <strong>cells</strong> by key. The Neo4j sink in <code>@gridz/sinks</code> materializes that
        shape for traversal queries across many Grids.
      </p>

      <h3>Graph model</h3>
      <pre>{`(:Subject { did: "did:pkh:eip155:8453:0x…" })
    -[:HAS_CELL]->
(:Cell { key: "com.github", id: "…", value_hash: "0x…", cell: <full JSON> })`}</pre>
      <p>On write, the sink runs:</p>
      <pre>{`MERGE (s:Subject {did: $subject})
MERGE (s)-[:HAS_CELL]->(c:Cell {key: $key})
SET c.id = $id, c.value_hash = $vh, c.cell = $cell`}</pre>

      <h3>Why a knowledge graph?</h3>
      <ul>
        <li>
          <strong>Agent discovery</strong> — traverse{" "}
          <code>{"(Subject)-[:HAS_CELL]->(Cell {key: \"agent-endpoint[mcp]\"})"}</code> to find MCP
          endpoints across agents
        </li>
        <li>
          <strong>Linked identities</strong> — connect subjects that share service keys, registry
          entries, or operator DIDs
        </li>
        <li>
          <strong>Org graphs</strong> — organizations with <code>gridz.tokens</code> cells linked to
          token contract metadata in an external graph
        </li>
        <li>
          <strong>RAG / semantic layers</strong> — attach embeddings to <code>Cell</code> nodes while
          keeping <code>value_hash</code> for cryptographic grounding
        </li>
      </ul>
      <p>
        Graph nodes store the full signed cell JSON. Before trusting a value in a graph query, run{" "}
        <code>verifyGrid</code> on the reconstructed Grid (or verify the individual cell&apos;s
        attestation). The graph indexes and connects; signatures prove authenticity.
      </p>

      <h2>ENS as primary sink</h2>
      <p>
        For gridz.bio, the primary on-chain projection is <strong>ENS + EAS on Base</strong>. Each cell
        maps to resolver storage and an EAS <code>gridz.cell.v1</code> attestation. The ENS sink in{" "}
        <code>@gridz/sinks</code> can also project to standalone <code>*.eth</code> names via text
        records (<code>gridz.keys</code>, <code>gridz.layout</code>, per-key values, and{" "}
        <code>gridz.att[key]</code> attestations).
      </p>
      <p>
        ENS is a sink like any other — convenient for name resolution and wildcard reads, but
        verification still checks the attestation bytes, not &quot;whatever ENS returned.&quot;
      </p>

      <h2>End-to-end flow</h2>
      <ol>
        <li>
          <strong>Author</strong> — build a Grid (YAML, editor, or API). Cells may be draft /
          unattested during editing.
        </li>
        <li>
          <strong>Sign</strong> — wallet (or 1Claw HSM) signs each cell via EIP-712{" "}
          <code>GridzCell</code>. See <Link href="/docs/spec/attestations">Attestations</Link>.
        </li>
        <li>
          <strong>Publish</strong> — push to one or more sinks:
          <ul>
            <li>
              gridz.bio → Base EAS + resolver (browser flow)
            </li>
            <li>
              CLI → <code>gridz publish --sink postgres|sqlite|neo4j|ens|…</code>
            </li>
            <li>
              MCP → <code>sink_publish</code> tool for agent-driven sync
            </li>
          </ul>
        </li>
        <li>
          <strong>Consume</strong> — read from any sink, assemble Grid JSON, render or query.
        </li>
        <li>
          <strong>Verify</strong> — <code>verifyGrid(grid)</code> checks hashes and signatures
          independently of which sink supplied the data.
        </li>
      </ol>

      <h2>Choosing an output</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Goal</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Public profile page + ENS identity</td>
            <td>gridz.bio (on-chain sink)</td>
          </tr>
          <tr>
            <td>App integration, bots, agents</td>
            <td>
              <code>GET /api/profile/{`{subject}`}</code> or <code>@gridz/core</code> directly
            </td>
          </tr>
          <tr>
            <td>SQL reporting, dashboards, search</td>
            <td>Postgres / MySQL / SQLite sink</td>
          </tr>
          <tr>
            <td>Relationship traversal, agent registries, semantic search</td>
            <td>Neo4j knowledge graph sink</td>
          </tr>
          <tr>
            <td>Static backup, IPFS/CDN archive</td>
            <td>S3 or file export</td>
          </tr>
          <tr>
            <td>Offline verification only</td>
            <td>Grid JSON file — no sink required</td>
          </tr>
        </tbody>
      </table>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/concepts">Concepts</Link> — short intro to sinks
        </li>
        <li>
          <Link href="/docs/toolkit">Toolkit</Link> — <code>@gridz/sinks</code> package
        </li>
        <li>
          <Link href="/docs/spec/attestations">Attestations</Link> — what gets signed before projection
        </li>
        <li>
          <Link href="/docs/verification">Verification</Link> — trusting a Grid regardless of sink
        </li>
      </ul>
    </>
  );
}

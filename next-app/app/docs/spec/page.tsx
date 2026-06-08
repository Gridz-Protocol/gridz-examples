import Link from "next/link";

const SPEC_REPO = "https://github.com/Gridz-Protocol/gridz/tree/main/specs";

export default function SpecOverviewPage() {
  return (
    <>
      <h1>Specification</h1>
      <p>
        The Gridz spec is the normative definition of what a profile <em>is</em>, how fields are
        signed, and how verifiers check them byte-for-byte. This section is the in-depth reference;
        for a lighter introduction see <Link href="/docs/concepts">Concepts</Link>.
      </p>

      <h2>Design principles</h2>
      <ul>
        <li>
          <strong>Attestations are the source of truth.</strong> Websites, APIs, and databases are
          sinks — projections for convenience. A verifier with only the Grid JSON can validate every
          cell without trusting gridz.bio.
        </li>
        <li>
          <strong>One cell, one signature.</strong> Each field is independently verifiable. Checking
          your bio does not require fetching or trusting your social links.
        </li>
        <li>
          <strong>Hash the value, sign the hash.</strong> Signers commit to{" "}
          <code>keccak256(JCS(value))</code> (EVM) or <code>sha256(JCS(value))</code> (non-EVM), not
          raw cleartext. This keeps EIP-712 payloads bounded and matches EAS schema shapes.
        </li>
        <li>
          <strong>One struct for all keys.</strong> A single <code>GridzCell</code> EIP-712 type covers
          ENS keys, agent keys, widgets, and arbitrary dynamic keys — the <code>key</code> string is a
          signed field.
        </li>
        <li>
          <strong>Cross-runtime agreement.</strong> TypeScript (<code>@gridz/core</code>), Python, and
          Solidity must produce identical hashes. Cross-runtime fixture tests enforce this.
        </li>
      </ul>

      <h2>Architecture at a glance</h2>
      <pre>{`┌─────────────────────────────────────────────────────────────┐
│  Grid (gridz/1.0.0)  ◄── signed attestations = source of truth │
│  subject · theme · cells[] · root_attestation                  │
└───────────────────────────────┬─────────────────────────────┘
                                │ publish (projections, not authority)
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  gridz.bio / API         Postgres / SQLite          Neo4j graph
  (HTML + JSON)           (relational index)         (traversal / agents)
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │ read → assemble Grid
                                ▼
                    verifyGrid() — hashes + signatures`}</pre>
      <p>
        gridz.bio is one output format, not the only one. The same signed Grid can project to
        databases, knowledge graphs, object stores, or plain JSON files. See{" "}
        <Link href="/docs/spec/sinks">Sinks &amp; projections</Link>.
      </p>

      <h2>Normative documents (repo)</h2>
      <p>
        Machine-readable schemas and prose specs live in the{" "}
        <a href={SPEC_REPO} target="_blank" rel="noreferrer">
          <code>specs/</code> directory
        </a>{" "}
        of the main <code>gridz</code> repository. SDKs, CLI, and gridz.bio all validate against
        these files.
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>What it defines</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/grid.schema.json`} target="_blank" rel="noreferrer">
                grid.schema.json
              </a>
            </td>
            <td>
              Grid model: <code>subject</code>, <code>theme</code>, <code>cells[]</code>,{" "}
              <code>root_attestation</code>
            </td>
          </tr>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/attestation.schema.json`} target="_blank" rel="noreferrer">
                attestation.schema.json
              </a>
            </td>
            <td>Portable attestation envelope on every cell and the root</td>
          </tr>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/canonicalization.md`} target="_blank" rel="noreferrer">
                canonicalization.md
              </a>
            </td>
            <td>JCS serialization, hashing, merkle tree, verification order</td>
          </tr>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/standard-keys.md`} target="_blank" rel="noreferrer">
                standard-keys.md
              </a>
            </td>
            <td>Canonical field key registry (ENS, agent, widget namespaces)</td>
          </tr>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/eip712-types.ts`} target="_blank" rel="noreferrer">
                eip712-types.ts
              </a>
            </td>
            <td>EIP-712 <code>GridzCell</code> / <code>GridzRoot</code> structs and EAS schema strings</td>
          </tr>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/deployments.md`} target="_blank" rel="noreferrer">
                deployments.md
              </a>
            </td>
            <td>GridzResolver, EAS, and schema UIDs per chain</td>
          </tr>
          <tr>
            <td>
              <a href={`${SPEC_REPO}/openapi.yaml`} target="_blank" rel="noreferrer">
                openapi.yaml
              </a>
            </td>
            <td>HTTP API surface (profile read, verify, publish)</td>
          </tr>
        </tbody>
      </table>

      <h2>In this documentation</h2>
      <ul>
        <li>
          <Link href="/docs/spec/grid">Grid model</Link> — subject, theme, cells, layout, authoring
          flags
        </li>
        <li>
          <Link href="/docs/spec/keys">Standard keys</Link> — ENS inheritance, agent keys,{" "}
          <code>gridz.*</code> widgets
        </li>
        <li>
          <Link href="/docs/spec/canonicalization">Canonicalization</Link> — JCS, hashes, merkle
          tree, verification steps
        </li>
        <li>
          <Link href="/docs/spec/attestations">Attestations</Link> — envelope formats, EIP-712,
          EAS schemas
        </li>
        <li>
          <Link href="/docs/spec/sinks">Sinks &amp; projections</Link> — databases, knowledge graphs,
          APIs, and other outputs
        </li>
        <li>
          <Link href="/docs/spec/on-chain">On-chain (Base)</Link> — production contracts, publish
          pipeline, resolver
        </li>
      </ul>

      <h2>Schema version</h2>
      <p>
        Published Grids MUST set <code>schema_version</code> to <code>gridz/1.0.0</code>. A breaking
        change to the Grid model bumps this string and requires a new root attestation over the
        updated cell set.
      </p>

      <h2>Related guides</h2>
      <ul>
        <li>
          <Link href="/docs/verification">Verification</Link> — how gridz.bio and{" "}
          <code>verifyGrid</code> check profiles in practice
        </li>
        <li>
          <Link href="/docs/api">API &amp; integrations</Link> — fetch JSON Grids over HTTP
        </li>
        <li>
          <Link href="/docs/toolkit">Toolkit</Link> — <code>@gridz/core</code>, React, MCP, CLI
        </li>
      </ul>
    </>
  );
}

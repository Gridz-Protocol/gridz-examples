import Link from "next/link";

export default function SpecGridPage() {
  return (
    <>
      <h1>Grid model</h1>
      <p>
        A <strong>Grid</strong> is the canonical JSON document for one verifiable profile. It is
        validated by{" "}
        <a
          href="https://github.com/Gridz-Protocol/gridz/blob/main/specs/grid.schema.json"
          target="_blank"
          rel="noreferrer"
        >
          <code>grid.schema.json</code>
        </a>{" "}
        and versioned as <code>gridz/1.0.0</code>.
      </p>

      <h2>Top-level shape</h2>
      <pre>{`{
  "schema_version": "gridz/1.0.0",
  "subject": { "type": "human", "did": "did:…", "ens": "kevin.gridz.eth" },
  "theme": { "background_type": "solid", … },
  "cells": [ … ],
  "root_attestation": { "format": "eas-onchain", … }
}`}</pre>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Required</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>schema_version</code>
            </td>
            <td>yes</td>
            <td>
              Pins the model. Currently the constant <code>gridz/1.0.0</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>subject</code>
            </td>
            <td>yes</td>
            <td>Who this Grid describes — human, agent, or organization.</td>
          </tr>
          <tr>
            <td>
              <code>theme</code>
            </td>
            <td>yes</td>
            <td>Renderer theme (colors, fonts, card style). May derive from ENSIP-18 <code>theme</code> cell.</td>
          </tr>
          <tr>
            <td>
              <code>cells</code>
            </td>
            <td>yes</td>
            <td>Array of signed fields. May be empty; Grid still valid with zero cells.</td>
          </tr>
          <tr>
            <td>
              <code>root_attestation</code>
            </td>
            <td>yes</td>
            <td>
              Binds the full cell set via a merkle root over cell attestation UIDs. See{" "}
              <Link href="/docs/spec/canonicalization">Canonicalization</Link>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Subject</h2>
      <p>
        The subject identifies the entity the Grid belongs to. The <code>did</code> is authoritative;
        human-readable names like <code>ens</code> or <code>sns</code> are optional conveniences that
        MUST resolve via real lookup — they are never assumed without verification.
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Values</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>type</code>
            </td>
            <td>
              <code>human</code> | <code>agent</code> | <code>organization</code>
            </td>
            <td>Drives renderer affordances (e.g. agent endpoints, org token widgets).</td>
          </tr>
          <tr>
            <td>
              <code>did</code>
            </td>
            <td>W3C DID</td>
            <td>
              Supported methods include <code>did:pkh</code>, <code>did:ethr</code>,{" "}
              <code>did:web</code>, <code>did:key</code>, <code>did:oneclaw</code>. Hash domain
              (keccak vs sha256) follows the signing curve.
            </td>
          </tr>
          <tr>
            <td>
              <code>ens</code>
            </td>
            <td>string</td>
            <td>
              e.g. <code>kevin.gridz.eth</code> on gridz.bio. When present, typically attested as its
              own cell.
            </td>
          </tr>
          <tr>
            <td>
              <code>display_name</code>
            </td>
            <td>string</td>
            <td>Non-authoritative label. The <code>alias</code> cell is the signed display name.</td>
          </tr>
        </tbody>
      </table>

      <h2>Theme</h2>
      <p>
        Themes control how a Grid renders: background, accent colors, typography, and card chrome.
        Renderers enforce WCAG 4.5:1 contrast and fall back when a theme fails accessibility checks.
      </p>
      <p>Required properties:</p>
      <ul>
        <li>
          <code>background_type</code> — <code>solid</code>, <code>gradient</code>, or <code>image</code>
        </li>
        <li>
          <code>background_value</code> — color, CSS gradient, or image URL
        </li>
        <li>
          <code>accent_color</code>, <code>text_color</code> — CSS colors (hex, rgb, hsl)
        </li>
        <li>
          <code>card_style</code> — <code>rounded</code>, <code>sharp</code>, or <code>soft</code>
        </li>
        <li>
          <code>card_background</code>, <code>font_family</code>
        </li>
      </ul>
      <p>
        Optional <code>show_gridz_badge</code> (default <code>true</code>) controls attribution on
        rendered pages.
      </p>

      <h2>Cell</h2>
      <p>
        A cell is one signed key-value field on the profile layout. Each cell carries its own{" "}
        <Link href="/docs/spec/attestations">attestation envelope</Link> — verification never chains
        through sibling cells.
      </p>
      <pre>{`{
  "id": "cell-alias-1",
  "key": "alias",
  "value": "Kevin",
  "position": { "x": 0, "y": 0, "w": 2, "h": 1 },
  "size": "2x1",
  "is_visible": true,
  "attestation": {
    "format": "eas-onchain",
    "uid": "0x…",
    "uri": "eas://8453/0x…",
    "attester": "did:pkh:eip155:8453:0x…",
    "iat": "2025-06-01T12:00:00Z",
    "value_hash": "0x…"
  }
}`}</pre>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>id</code>
            </td>
            <td>Stable opaque identifier, unique within the Grid (1–128 chars).</td>
          </tr>
          <tr>
            <td>
              <code>key</code>
            </td>
            <td>
              Field name. See <Link href="/docs/spec/keys">Standard keys</Link>. Dynamic keys matching
              the regex are first-class.
            </td>
          </tr>
          <tr>
            <td>
              <code>value</code>
            </td>
            <td>
              JSON-serializable payload. Shape constrained per-key by widget schemas. Big integers
              MUST be strings, not JSON numbers.
            </td>
          </tr>
          <tr>
            <td>
              <code>widget_type</code>
            </td>
            <td>
              Optional render hint (e.g. <code>gridz.poll</code>). Unknown types use the Generic
              renderer.
            </td>
          </tr>
          <tr>
            <td>
              <code>position</code> / <code>size</code>
            </td>
            <td>
              Bento layout: grid coordinates <code>{`{ x, y, w, h }`}</code> and size hint like{" "}
              <code>2x1</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>is_visible</code>
            </td>
            <td>
              Render-only flag. Hidden cells still count toward the merkle tree and{" "}
              <code>cellCount</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>expires_at</code>
            </td>
            <td>
              Optional ISO-8601 deadline. After expiry the cell shows as expired (amber), not invalid.
            </td>
          </tr>
          <tr>
            <td>
              <code>attestation</code>
            </td>
            <td>Required on published Grids. Self-describing proof for this cell&apos;s value.</td>
          </tr>
        </tbody>
      </table>

      <h3>Authoring-only flags</h3>
      <p>
        These MUST NOT appear on published Grids. Validators and <code>gridz grid validate</code> reject
        them at publish time.
      </p>
      <ul>
        <li>
          <code>_needs_input: true</code> — template placeholder; operator must fill the value.
        </li>
        <li>
          <code>_unattested: true</code> — imported from ENS or another sink but not yet signed.
        </li>
      </ul>

      <h2>gridId</h2>
      <p>
        Every cell and the root share a stable 32-byte <code>gridId</code>, independent of cell
        contents so the identity persists across edits:
      </p>
      <pre>{`gridId = H( JCS({ "did": subject.did, "schema_version": grid.schema_version }) )`}</pre>
      <p>
        On EVM chains <code>H</code> is <code>keccak256</code>. See{" "}
        <Link href="/docs/spec/canonicalization">Canonicalization</Link> for the full derivation.
      </p>

      <h2>One Grid per identity</h2>
      <p>
        A DID maps to at most one active Grid at a time. Publishing a new cell updates the resolver
        mapping for that key; the root attestation (when used) commits to the full current cell set.
        gridz.bio reads the resolver on Base and assembles the Grid JSON for rendering and API responses.
      </p>
    </>
  );
}

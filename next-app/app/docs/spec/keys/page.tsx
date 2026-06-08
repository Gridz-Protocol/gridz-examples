import Link from "next/link";

const KEYS_REPO = "https://github.com/Gridz-Protocol/gridz/blob/main/specs/standard-keys.md";

export default function SpecKeysPage() {
  return (
    <>
      <h1>Standard keys</h1>
      <p>
        Field keys are the stable identifiers for cells. The same string is used in YAML configs, ENS
        text records, EIP-712 signatures, EAS attestations, and the gridz.bio editor. The canonical
        registry is{" "}
        <a href={KEYS_REPO} target="_blank" rel="noreferrer">
          <code>standard-keys.md</code>
        </a>
        .
      </p>

      <h2>Key syntax</h2>
      <p>Every key MUST match:</p>
      <pre>{`^[a-z0-9]([a-z0-9._\\-\\[\\]])*[a-z0-9\\]]$`}</pre>
      <p>
        This is a superset of ENS global keys (lowercase + hyphen), ENS service keys (reverse-dot), and
        the bracket form for agent endpoints. Maximum length 256 characters.{" "}
        <strong>Dynamic keys are first-class</strong> — unknown keys round-trip through every component;
        unknown <code>widget_type</code> values fall back to the Generic renderer.
      </p>

      <h2>Tier 1 — Inherited from ENS</h2>
      <p>
        Any ENS profile is a valid minimal Grid. Values follow the ENS &quot;void of prefix&quot; rule:
        store bare handles (<code>alice</code>), not decorated forms (<code>@alice</code>), unless a
        service requires otherwise.
      </p>

      <h3>Global keys (ENSIP-5)</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>avatar</code>
            </td>
            <td>URL / NFT URI</td>
            <td>ENSIP-12 avatar spec</td>
          </tr>
          <tr>
            <td>
              <code>description</code>
            </td>
            <td>string</td>
            <td>Biography / summary</td>
          </tr>
          <tr>
            <td>
              <code>display</code>
            </td>
            <td>string</td>
            <td>Canonical capitalization of the name</td>
          </tr>
          <tr>
            <td>
              <code>email</code>
            </td>
            <td>string</td>
            <td>RFC 5322 address</td>
          </tr>
          <tr>
            <td>
              <code>url</code>
            </td>
            <td>string</td>
            <td>Website URL</td>
          </tr>
          <tr>
            <td>
              <code>location</code>, <code>phone</code>, <code>keywords</code>, <code>mail</code>,{" "}
              <code>notice</code>
            </td>
            <td>string</td>
            <td>Standard ENS text records</td>
          </tr>
        </tbody>
      </table>

      <h3>Profile keys (ENSIP-18)</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>alias</code>
            </td>
            <td>string</td>
            <td>
              Short display name (gridz.bio &quot;name&quot; maps here). Max ~50 chars by convention.
            </td>
          </tr>
          <tr>
            <td>
              <code>header</code>
            </td>
            <td>URL</td>
            <td>Banner image</td>
          </tr>
          <tr>
            <td>
              <code>theme</code>
            </td>
            <td>string / JSON</td>
            <td>Source for the Grid <code>theme</code> object</td>
          </tr>
          <tr>
            <td>
              <code>timezone</code>
            </td>
            <td>string</td>
            <td>IANA tz, e.g. <code>America/New_York</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>language</code>
            </td>
            <td>string</td>
            <td>ISO 639-1</td>
          </tr>
          <tr>
            <td>
              <code>primary-contact</code>
            </td>
            <td>string</td>
            <td>Preferred contact channel</td>
          </tr>
        </tbody>
      </table>

      <h3>Service keys (reverse-dot)</h3>
      <p>
        Open namespace — any reverse-dot key with at least one dot is valid. Common examples on
        gridz.bio:
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Service</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>com.github</code>
            </td>
            <td>GitHub username</td>
          </tr>
          <tr>
            <td>
              <code>com.twitter</code>
            </td>
            <td>X / Twitter handle</td>
          </tr>
          <tr>
            <td>
              <code>com.discord</code>
            </td>
            <td>Discord handle</td>
          </tr>
          <tr>
            <td>
              <code>xyz.farcaster</code>
            </td>
            <td>Farcaster handle</td>
          </tr>
          <tr>
            <td>
              <code>social.bsky</code>
            </td>
            <td>Bluesky handle</td>
          </tr>
        </tbody>
      </table>

      <h2>Tier 2 — Agent keys</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Provenance</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>agent-context</code>
            </td>
            <td>ENSIP-26</td>
            <td>Free-form context (text, Markdown, YAML, JSON)</td>
          </tr>
          <tr>
            <td>
              <code>agent-endpoint[mcp]</code>
            </td>
            <td>ENSIP-26</td>
            <td>MCP server URL (incl. <code>ipfs://</code>)</td>
          </tr>
          <tr>
            <td>
              <code>agent-endpoint[a2a]</code>
            </td>
            <td>ENSIP-26</td>
            <td>Agent-to-Agent protocol endpoint</td>
          </tr>
          <tr>
            <td>
              <code>agent-registration[&lt;registry&gt;][&lt;agentId&gt;]</code>
            </td>
            <td>ENSIP-25</td>
            <td>
              Presence attests registry association; value SHOULD be <code>&quot;1&quot;</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>agent.capabilities</code>
            </td>
            <td>Gridz</td>
            <td>JSON string array of declared capabilities</td>
          </tr>
          <tr>
            <td>
              <code>agent.model</code>, <code>agent.version</code>, <code>agent.operator</code>
            </td>
            <td>Gridz</td>
            <td>Agent metadata under the <code>agent.</code> prefix</td>
          </tr>
          <tr>
            <td>
              <code>agent.oneclaw_id</code>
            </td>
            <td>Gridz</td>
            <td>Links Grid to a 1Claw HSM-managed agent identity</td>
          </tr>
        </tbody>
      </table>

      <h2>Tier 3 — Gridz widgets (<code>gridz.*</code>)</h2>
      <p>
        Gridz-defined namespace. Each key has a value schema and a 1:1 renderer component on
        gridz.bio. When <code>widget_type</code> is omitted, the key string is the render hint.
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Widget</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>gridz.message_me</code>
            </td>
            <td>Contact / DM button</td>
          </tr>
          <tr>
            <td>
              <code>gridz.social_link</code>
            </td>
            <td>Single social link card</td>
          </tr>
          <tr>
            <td>
              <code>gridz.stats</code>
            </td>
            <td>Stat tiles</td>
          </tr>
          <tr>
            <td>
              <code>gridz.currently</code>
            </td>
            <td>&quot;Currently …&quot; status</td>
          </tr>
          <tr>
            <td>
              <code>gridz.poll</code>
            </td>
            <td>Poll</td>
          </tr>
          <tr>
            <td>
              <code>gridz.countdown</code>
            </td>
            <td>Countdown to a date</td>
          </tr>
          <tr>
            <td>
              <code>gridz.clock</code>
            </td>
            <td>Live clock (timezone-aware)</td>
          </tr>
          <tr>
            <td>
              <code>gridz.tech_stack</code>
            </td>
            <td>Tech / tool list</td>
          </tr>
          <tr>
            <td>
              <code>gridz.tokens</code>
            </td>
            <td>Organization token listings (gridz.bio extension)</td>
          </tr>
          <tr>
            <td>
              <code>gridz.guestbook</code>, <code>gridz.visitor_counter</code>, …
            </td>
            <td>See full list in repo</td>
          </tr>
        </tbody>
      </table>
      <p>
        Per-widget JSON schemas live under <code>specs/widgets/*.schema.json</code> in the gridz repo.
        TypeScript Zod and Python Pydantic models are generated from them.
      </p>

      <h2>Signing is key-agnostic</h2>
      <p>
        EIP-712 uses one <code>GridzCell</code> struct for every key — standard, agent, widget, or
        custom. The <code>key</code> string is part of the signed payload, so verifiers do not need a
        per-key struct registry. See <Link href="/docs/spec/attestations">Attestations</Link>.
      </p>
    </>
  );
}

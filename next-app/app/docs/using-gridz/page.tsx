export default function UsingGridzPage() {
  const ens = "gridz.eth";
  const bio = "gridz.bio";

  return (
    <>
      <h1>Using gridz.bio</h1>
      <p>
        After you claim a profile, you have two public names for the same identity and three ways to
        interact with it: the website, the JSON API, and the open-source libraries.
      </p>

      <h2>Your URLs</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>What</th>
            <th>Example</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ENS name</td>
            <td>
              <code>kevin.{ens}</code>
            </td>
            <td>On-chain identity; resolves via Ethereum ENS.</td>
          </tr>
          <tr>
            <td>Profile page</td>
            <td>
              <code>https://kevin.{bio}</code>
            </td>
            <td>Human-readable Spritz-style page; same data as ENS.</td>
          </tr>
          <tr>
            <td>Canonical path</td>
            <td>
              <code>https://{bio}/kevin.{ens}</code>
            </td>
            <td>Works on the apex domain too.</td>
          </tr>
          <tr>
            <td>JSON API</td>
            <td>
              <code>https://{bio}/api/profile/kevin.{ens}</code>
            </td>
            <td>Machine-readable Grid JSON for apps and bots.</td>
          </tr>
        </tbody>
      </table>
      <p>
        On profile subdomains, the header <strong>Gridz</strong> and <strong>Home</strong> links always
        return to <code>https://{bio}</code> (the apex site), not the subdomain root.
      </p>

      <h2>Draft vs on-chain</h2>
      <p>When you edit a profile in the browser, there are two stages:</p>
      <ul>
        <li>
          <strong>Save draft</strong> — field edits are stored in <em>this browser only</em> (
          localStorage). <strong>No wallet prompts.</strong> The profile preview updates live as you
          type. You&apos;ll see a <strong>Draft</strong> badge. Other people and the API cannot see it
          yet.
        </li>
        <li>
          <strong>Sign &amp; publish to ENS</strong> — your wallet signs only <em>changed</em> cells plus
          the grid root (unchanged fields reuse prior attestations). Then the server writes EAS
          attestations on Ethereum and batches resolver links via Multicall3. When done, you&apos;ll
          see an <strong>On-chain</strong> badge and your profile is public everywhere.
        </li>
      </ul>
      <p>
        If the API returns <code>Profile not found</code> but you see a Draft badge, you haven&apos;t
        finished publishing yet — or you&apos;re on a different browser than the one that saved the
        draft.
      </p>

      <h2>Editing (owners only)</h2>
      <ol>
        <li>
          Visit your page (<code>https://you.{bio}</code>) and connect the <em>same wallet</em> that
          signed the profile.
        </li>
        <li>
          <strong>Edit profile</strong> appears only when your connected wallet matches the grid
          attester. Visitors see <strong>Query &amp; verify</strong> but not the editor.
        </li>
        <li>
          Add or change fields and widget cards — the bento preview below the editor updates live.
        </li>
        <li>
          <strong>Save draft</strong> to persist locally without signing, or <strong>Sign &amp; publish</strong>{" "}
          when ready to go on-chain.
        </li>
      </ol>

      <h2>Widget cards</h2>
      <p>
        Under <strong>Add widgets</strong> in the editor you can enable Spritz-style bento cards. Each
        becomes a signed <code>gridz.*</code> cell when published:
      </p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Widget</th>
            <th>Key</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Stats</td>
            <td><code>gridz.stats</code></td>
            <td>Label / value tiles you author.</td>
          </tr>
          <tr>
            <td>Poll</td>
            <td><code>gridz.poll</code></td>
            <td>Question + options are signed on-chain; shared vote tallies are local preview today.</td>
          </tr>
          <tr>
            <td>Currently</td>
            <td><code>gridz.currently</code></td>
            <td>What you&apos;re focused on.</td>
          </tr>
          <tr>
            <td>Status</td>
            <td><code>gridz.availability_status</code></td>
            <td>Available or busy indicator.</td>
          </tr>
          <tr>
            <td>Countdown</td>
            <td><code>gridz.countdown</code></td>
            <td>Live client-side countdown to a target date.</td>
          </tr>
          <tr>
            <td>Local time</td>
            <td><code>gridz.clock</code></td>
            <td>Live clock for your timezone.</td>
          </tr>
          <tr>
            <td>Quote</td>
            <td><code>gridz.text</code></td>
            <td>Short quote or announcement.</td>
          </tr>
          <tr>
            <td>Guestbook</td>
            <td><code>gridz.guestbook</code></td>
            <td>Owner-curated entries (static until visitor signing ships).</td>
          </tr>
          <tr>
            <td>Org tokens</td>
            <td><code>gridz.tokens</code></td>
            <td>
              For companies — list token contract addresses per chain (Ethereum, Base, Arbitrum, etc.).
              Sets <code>subject.type</code> to <code>organization</code>.
            </td>
          </tr>
          <tr>
            <td>Featured link</td>
            <td><code>gridz.social_link</code></td>
            <td>Project or newsletter card.</td>
          </tr>
          <tr>
            <td>Contact button</td>
            <td><code>gridz.message_me</code></td>
            <td>Header CTA (mailto, Telegram, cal.com, …).</td>
          </tr>
        </tbody>
      </table>
      <p>
        Social handles (X, GitHub, Bluesky, Discord, Telegram) render as header buttons, not bento
        cards. See the live gallery at <a href="https://demo.gridz.bio">demo.gridz.bio</a>.
      </p>

      <h2>Query &amp; verify (every profile)</h2>
      <p>
        Each profile page has a <strong>Query &amp; verify</strong> button in the toolbar. It opens a
        modal with subject-specific instructions to:
      </p>
      <ul>
        <li>Fetch the JSON API (<code>GET /api/profile/…</code>)</li>
        <li>Run offline <code>verifyGrid()</code> in TypeScript or Python</li>
        <li>Cross-check EAS attestation UIDs on <a href="https://easscan.org" target="_blank" rel="noreferrer">easscan.org</a></li>
      </ul>
      <p>
        Full details: <a href="/docs/verification">Verification</a>.
      </p>

      <h2>Embed a profile in your app</h2>
      <p>Fetch the Grid JSON, then render with a Gridz UI package:</p>
      <pre>
        <code>{`// 1. Fetch
const res = await fetch("https://gridz.bio/api/profile/kevin.gridz.eth");
const { grid } = await res.json();

// 2. Render (React)
import { Grid } from "@gridz/react";
import "@gridz/react/styles.css";

<Grid grid={grid} />`}</code>
      </pre>
      <p>
        gridz.bio profile pages use a custom Spritz layout (<code>SpritzProfile</code>). Also available:{" "}
        <code>@gridz/vue</code>, <code>@gridz/svelte</code>, and the framework-agnostic{" "}
        <code>&lt;gridz-profile&gt;</code> web component (<code>@gridz/element</code>). See{" "}
        <a href="/docs/api">API &amp; integrations</a> and <a href="/docs/toolkit">Toolkit</a>.
      </p>

      <h2>Verify without trusting gridz.bio</h2>
      <p>
        Download the JSON from the API (or use the profile page modal), then verify signatures
        offline — no RPC or server required. See <a href="/docs/verification">Verification</a>.
      </p>
    </>
  );
}

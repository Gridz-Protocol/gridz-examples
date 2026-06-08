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
            <td>Human-readable page; same data as ENS.</td>
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

      <h2>Draft vs on-chain</h2>
      <p>When you edit a profile in the browser, there are two stages:</p>
      <ul>
        <li>
          <strong>Sign &amp; save draft</strong> — your wallet signs the Grid locally. The result is
          stored in <em>this browser only</em> (localStorage). You&apos;ll see a <strong>Draft</strong>{" "}
          badge. Other people and the API cannot see it yet.
        </li>
        <li>
          <strong>Publish to ENS</strong> — after signing, the site sends your signed Grid to the
          server, which writes EAS attestations on Ethereum. This takes about a minute (several
          on-chain transactions). When done, you&apos;ll see an <strong>On-chain</strong> badge and
          your profile is public everywhere.
        </li>
      </ul>
      <p>
        If the API returns <code>Profile not found</code> but you see a Draft badge, you haven&apos;t
        finished publishing yet — or you&apos;re on a different browser than the one that saved the
        draft.
      </p>

      <h2>Editing</h2>
      <ol>
        <li>
          Visit your page (<code>https://you.{bio}</code>) and click <strong>Edit profile</strong>.
        </li>
        <li>
          Connect the <em>same wallet</em> you used to sign originally.
        </li>
        <li>Update fields, sign again, and publish to push changes on-chain.</li>
      </ol>

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
        Also available: <code>@gridz/vue</code>, <code>@gridz/svelte</code>, and the framework-agnostic{" "}
        <code>&lt;gridz-profile&gt;</code> web component (<code>@gridz/element</code>). See{" "}
        <a href="/docs/api">API &amp; integrations</a> and <a href="/docs/toolkit">Toolkit</a>.
      </p>

      <h2>Verify without trusting gridz.bio</h2>
      <p>
        Download the JSON from the API (or copy it from your browser), then verify signatures
        offline — no RPC or server required. See <a href="/docs/verification">Verification</a>.
      </p>
    </>
  );
}

export default function ClaimDocsPage() {
  const ens = "gridz.eth";
  const bio = "gridz.bio";

  return (
    <>
      <h1>Claim your profile</h1>
      <p>
        No account signup, no platform lock-in. You pick a name, connect your wallet, fill in your
        fields, and publish to Ethereum. Your identity is <code>alias.{ens}</code>; your public page
        is <code>alias.{bio}</code>.
      </p>

      <h2>Before you start</h2>
      <ul>
        <li>An Ethereum wallet (browser extension or WalletConnect).</li>
        <li>
          A little ETH on mainnet if you publish on-chain (gridz.bio covers registrar gas for
          standard claims; you only sign).
        </li>
        <li>
          An alias that isn&apos;t taken — try <a href="/claim">gridz.bio/claim</a> to check.
        </li>
      </ul>

      <h2>Step-by-step</h2>
      <ol>
        <li>
          Go to <a href="/claim">/claim</a> and enter your desired alias (e.g. <code>kevin</code>).
        </li>
        <li>
          Click <strong>Claim</strong> — you&apos;ll land on your profile page with the editor open.
        </li>
        <li>
          Click <strong>Connect wallet</strong> in the top right.
        </li>
        <li>
          Upload a <strong>1:1 avatar</strong> (or paste an image URL), then fill in display name, bio,
          and website.
        </li>
        <li>
          Under <strong>Add widgets</strong>, enable Stats, Poll, Countdown, Org tokens, and/or other
          cards. Add social handles for X, GitHub, and Bluesky. The preview below updates live.
        </li>
        <li>
          Click <strong>Save draft</strong> anytime to persist edits in this browser — no wallet
          signatures yet. You&apos;ll see a <strong>Draft</strong> badge.
        </li>
        <li>
          Click <strong>Sign &amp; publish to ENS</strong> when ready. Your wallet signs only changed
          fields plus the grid root. The progress UI shows how many prompts to expect. The server
          then writes EAS attestations and batches resolver links on-chain — usually under a minute
          for a first publish. When done, the badge switches to <strong>On-chain</strong>.
        </li>
        <li>
          Visit <code>https://you.{bio}</code>. New subdomains may take a minute to propagate.
        </li>
      </ol>

      <h2>What you own</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Example</th>
            <th>Controlled by</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ENS subname</td>
            <td>
              <code>you.{ens}</code>
            </td>
            <td>Your wallet (signatures prove ownership of fields)</td>
          </tr>
          <tr>
            <td>Public page</td>
            <td>
              <code>you.{bio}</code>
            </td>
            <td>Reads your on-chain attestations</td>
          </tr>
          <tr>
            <td>Signed cells</td>
            <td>alias, description, url, gridz.* widgets, …</td>
            <td>Your wallet — each field has its own attestation</td>
          </tr>
        </tbody>
      </table>

      <h2>Already claimed?</h2>
      <p>
        Visit your URL, connect the same wallet, and click <strong>Edit profile</strong> (only visible
        to the owner). Update fields, save a draft or sign &amp; publish. Incremental publish reuses
        unchanged attestations — you only sign and write cells that actually changed.
      </p>

      <h2>API access</h2>
      <p>Once published, anyone can fetch your profile as JSON:</p>
      <pre>
        <code>{`GET https://${bio}/api/profile/kevin.${ens}`}</code>
      </pre>
      <p>
        On your profile page, use <strong>Query &amp; verify</strong> for copy-paste fetch and verify
        commands. See <a href="/docs/api">API &amp; integrations</a> for the full response shape.
      </p>
    </>
  );
}

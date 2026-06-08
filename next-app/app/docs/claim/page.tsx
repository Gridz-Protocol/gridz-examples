export default function ClaimDocsPage() {
  const ens = "gridz.eth";
  const bio = "gridz.bio";

  return (
    <>
      <h1>Claim your profile</h1>
      <p>
        No account signup, no platform lock-in. You pick a name, connect your wallet, sign your
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
          Under <strong>Widget cards</strong>, enable Stats, Poll, and/or Featured link. Add social
          handles for X, GitHub, and Bluesky.
        </li>
        <li>
          Click <strong>Sign &amp; save draft</strong> to preview locally. You&apos;ll see a{" "}
          <strong>Draft</strong> badge — only visible in this browser.
        </li>
        <li>
          Click <strong>Publish to ENS</strong> when ready. Your wallet will ask you to sign several
          messages (one per field + the grid root). Then the server writes on-chain attestations —
          this can take about a minute. When done, the badge switches to <strong>On-chain</strong>.
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
            <td>alias, description, url, …</td>
            <td>Your wallet — each field has its own attestation</td>
          </tr>
        </tbody>
      </table>

      <h2>Already claimed?</h2>
      <p>
        Visit your URL and click <strong>Edit profile</strong>. Connect the same wallet, update
        fields, sign, and publish again. Changes replace the previous on-chain attestations.
      </p>

      <h2>API access</h2>
      <p>Once published, anyone can fetch your profile as JSON:</p>
      <pre>
        <code>{`GET https://${bio}/api/profile/kevin.${ens}`}</code>
      </pre>
      <p>
        See <a href="/docs/api">API &amp; integrations</a> for the full response shape and embed
        examples.
      </p>
    </>
  );
}

export default function ClaimDocsPage() {
  const ens = "gridz.eth";
  const bio = "gridz.bio";

  return (
    <>
      <h1>Claiming your profile</h1>
      <p>
        Gridz profiles live at <code>alias.{ens}</code> (ENS identity) and{" "}
        <code>alias.{bio}</code> (public website). Claiming is done entirely in the browser at{" "}
        <a href="https://gridz.bio/claim">gridz.bio/claim</a>.
      </p>

      <h2>Step-by-step</h2>
      <ol>
        <li>
          Go to <a href="/claim">/claim</a> and enter your desired alias (e.g. <code>kevin</code>).
        </li>
        <li>
          Click <strong>Claim</strong> — you&apos;ll land on your profile page with the editor open.
        </li>
        <li>
          Click <strong>Connect wallet</strong> in the nav (top right).
        </li>
        <li>
          Fill in display name, bio, and website URL.
        </li>
        <li>
          Click <strong>Sign &amp; save draft</strong> to preview locally, or{" "}
          <strong>Publish to ENS</strong> to go live on-chain.
        </li>
        <li>
          After publish, visit <code>https://you.{bio}</code> — DNS may take a minute to propagate
          for new subdomains.
        </li>
      </ol>

      <h2>What gets created</h2>
      <ul>
        <li>
          <code>you.{ens}</code> — ENS subname resolved by the GridzResolver (EAS-backed cells).
        </li>
        <li>
          <code>you.{bio}</code> — wildcard subdomain pointing at the same profile page.
        </li>
        <li>
          Signed attestations — each field is EIP-712 signed by your wallet.
        </li>
      </ul>

      <h2>API access</h2>
      <pre>
        <code>{`GET https://gridz.bio/api/profile/kevin.gridz.eth`}</code>
      </pre>
      <p>Returns the full signed <code>grid</code> JSON for integrations.</p>

      <h2>Already claimed?</h2>
      <p>
        Visit your URL and click <strong>Edit profile</strong>. Connect the same wallet you used to
        sign, update fields, and publish again.
      </p>
    </>
  );
}

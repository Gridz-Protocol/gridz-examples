import Link from "next/link";

const ENS = "gridz.eth";
const BIO = "gridz.bio";

export default function FaqPage() {
  return (
    <div className="faq-page">
      <header className="faq-hero">
        <h1>FAQ</h1>
        <p className="faq-hero__lead">
          Common questions about claiming, publishing, and verifying profiles on gridz.bio. For full
          guides see <Link href="/docs">Docs</Link>; for the normative spec see{" "}
          <Link href="/docs/spec">Specification</Link>.
        </p>
      </header>

      <section className="faq-section">
        <h2>What is Gridz?</h2>
        <p>
          Gridz is an open framework for <strong>cryptographically-attested profiles</strong>. Your
          identity lives at <code>you.{ENS}</code> on Base; your public page lives at{" "}
          <code>you.{BIO}</code>. Every field (name, bio, links, widgets) is signed by your wallet, so
          anyone can verify it came from you — not from a platform database.
        </p>
      </section>

      <section className="faq-section">
        <h2>Do I need ETH to claim a profile?</h2>
        <p>
          No ETH is required for standard claims. You connect your wallet and sign with EIP-712; gridz.bio
          covers registrar gas on Base when you publish. You never send a transaction yourself for a
          normal claim flow.
        </p>
      </section>

      <section className="faq-section">
        <h2>What is the difference between gridz.eth and gridz.bio?</h2>
        <p>
          They name the same profile. <code>kevin.{ENS}</code> is your on-chain ENS identity, resolved
          via GridzResolver on Base. <code>kevin.{BIO}</code> is the same data as a normal website URL
          for sharing. The JSON API at <code>/api/profile/kevin.{ENS}</code> returns the same Grid for
          apps and bots.
        </p>
      </section>

      <section className="faq-section">
        <h2>What is draft vs on-chain?</h2>
        <p>
          <strong>Draft</strong> edits are saved in your browser only (localStorage). No wallet prompts;
          other people and the API cannot see them. <strong>On-chain</strong> means you signed and
          published — EAS attestations on Base linked via GridzResolver. Then your profile is public
          everywhere. See <Link href="/docs/using-gridz">Using gridz.bio</Link>.
        </p>
      </section>

      <section className="faq-section">
        <h2>I published but it still says Draft — what do I do?</h2>
        <p>
          Uploading an avatar or clicking <strong>Save draft</strong> does not publish — you must click{" "}
          <strong>Sign &amp; publish to ENS</strong> (or <strong>Sign &amp; claim</strong>) and approve
          the wallet signature(s). If publish succeeded, the badge should switch to{" "}
          <strong>On-chain</strong> after a moment. If you still see Draft:
        </p>
        <ul>
          <li>Check for a red error under the publish button — common fixes: switch wallet to Base, retry publish.</li>
          <li>Confirm the success message listed on-chain writes (not &quot;nothing new reached the chain&quot;).</li>
          <li>Hard-refresh the page, or open your profile in a private window to confirm it is public via the JSON API.</li>
          <li>Use the same browser where you published — drafts are per-browser only.</li>
        </ul>
      </section>

      <section className="faq-section">
        <h2>Does Gridz hold my private key?</h2>
        <p>
          No. You sign in the browser with your own wallet (or via 1Claw HSM for agents). The gridz.bio
          registrar submits its <em>own</em> transactions to link your already-signed attestations — it
          cannot impersonate you or sign on your behalf.
        </p>
      </section>

      <section className="faq-section">
        <h2>What does the verified badge mean?</h2>
        <p>
          When every on-chain cell passes cryptographic verification (hashes, signatures, and EAS
          cross-checks), the profile header shows <strong>✓ Verified</strong>. Use the toolbar{" "}
          <strong>Verify profile</strong> button for a per-field breakdown. See{" "}
          <Link href="/docs/verification">Verification</Link>.
        </p>
      </section>

      <section className="faq-section">
        <h2>Can I use Gridz without gridz.bio?</h2>
        <p>
          Yes. Gridz is an open spec and toolkit — TypeScript, Python, CLI, MCP, and sink adapters for
          Postgres, SQLite, Neo4j, S3, and more. gridz.bio is one projection of a signed Grid, not the
          only output. See <Link href="/docs/spec/sinks">Sinks &amp; projections</Link> and{" "}
          <Link href="/docs/toolkit">Toolkit</Link>.
        </p>
      </section>

      <section className="faq-section">
        <h2>How do AI agents use Gridz?</h2>
        <p>
          Agents read profiles via <code>GET /api/profile/…</code>, verify offline with{" "}
          <code>@gridz/core</code>, and can publish via MCP or 1Claw HSM signing. Start at{" "}
          <Link href="/for-ai">For AI</Link> or <a href="/llms.txt">llms.txt</a>.
        </p>
      </section>

      <section className="faq-section">
        <h2>Can I change my alias after claiming?</h2>
        <p>
          Your ENS subname (<code>alias.{ENS}</code>) is fixed at claim time. You can edit any field
          on your profile — bio, links, widgets — by publishing updated signed cells. To use a different
          alias, claim a new name if it is available.
        </p>
      </section>

      <section className="faq-section">
        <h2>Where do I get help?</h2>
        <ul>
          <li>
            <Link href="/docs/claim">Claiming guide</Link> — step-by-step walkthrough
          </li>
          <li>
            <Link href="/docs">Documentation</Link> — API, CLI, concepts, spec
          </li>
          <li>
            <a
              href="https://github.com/Gridz-Protocol/gridz/issues"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub issues
            </a>{" "}
            — bugs and feature requests
          </li>
        </ul>
      </section>
    </div>
  );
}

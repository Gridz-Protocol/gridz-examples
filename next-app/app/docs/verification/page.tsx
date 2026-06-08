export default function VerificationPage() {
  return (
    <>
      <h1>Verification</h1>
      <p>
        Every cell on a Gridz profile can be independently verified. You don&apos;t have to trust
        gridz.bio — you only need the Grid JSON and the open-source verifier.
      </p>

      <h2>On the website</h2>
      <p>
        Every profile page has a <strong>Query &amp; verify</strong> button in the toolbar. It opens a
        modal with the JSON API URL, curl example, and copy-paste <code>verifyGrid</code> snippets for
        that specific ENS name — plus notes on checking EAS UIDs on easscan.org.
      </p>
      <p>
        Published profiles also show verification badges on each cell (✓ verified, ⛓ on-chain loaded
        from ENS). Hover a badge for attestation format and status.
      </p>
      <p>
        If you see a <strong>Draft</strong> badge, the modal explains that query/verify steps apply to
        the published on-chain profile, not local browser edits.
      </p>

      <h2>Offline verification (TypeScript)</h2>
      <p>
        Fetch a profile from the API (or export your signed Grid), then verify with zero network
        calls:
      </p>
      <pre>
        <code>{`import { verifyGrid } from "@gridz/core";

const res = await fetch("https://gridz.bio/api/profile/kevin.gridz.eth");
const { grid } = await res.json();

const report = await verifyGrid(grid);
// report tells you if root + every cell attestation checks out`}</code>
      </pre>

      <h2>Offline verification (Python)</h2>
      <pre>
        <code>{`from gridz import verify_grid
import httpx

grid = httpx.get("https://gridz.bio/api/profile/kevin.gridz.eth").json()["grid"]
report = verify_grid(grid)`}</code>
      </pre>

      <h2>CLI</h2>
      <pre>
        <code>{`gridz grid verify grid.json`}</code>
      </pre>

      <h2>On-chain cross-check</h2>
      <p>
        For profiles published via gridz.bio, each cell links to an EAS attestation on Ethereum
        mainnet. Advanced users can look up the attestation UID (in the Grid JSON) on{" "}
        <a href="https://easscan.org" target="_blank" rel="noreferrer">
          easscan.org
        </a>{" "}
        and confirm it matches the signed value. The GridzResolver serves those values via standard
        ENS <code>text()</code> reads.
      </p>

      <h2>What verification proves</h2>
      <ul>
        <li>The stated wallet (or key) signed each cell value.</li>
        <li>The grid root binds all cells together under one subject.</li>
        <li>Attestations are not expired or revoked (for EAS on-chain cells).</li>
      </ul>
      <p>
        Verification does <em>not</em> prove a human is &quot;really&quot; who they claim — it proves
        the cryptographic identity behind the ENS name signed the content.
      </p>
    </>
  );
}

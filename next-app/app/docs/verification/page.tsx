export default function VerificationPage() {
  return (
    <>
      <h1>Verification</h1>
      <p>
        Every rendered cell shows a verification badge. Click it to inspect the attestation bundle —
        signatures, expiry, and value hash.
      </p>
      <h2>Offline verification</h2>
      <p>
        Use <code>verifyGrid</code> from <code>@gridz/core</code> with only the grid JSON. No RPC, no
        server, no vault required.
      </p>
      <pre>
        <code>{`import { verifyGrid } from "@gridz/core";

const report = await verifyGrid(grid);
// report.root === "verified" && every cell verified`}</code>
      </pre>
      <h2>On-chain reads</h2>
      <p>
        Public profiles resolve via ENS text records backed by the GridzResolver and EAS. The site reads
        via <code>EnsSink.readGrid()</code> over a public RPC.
      </p>
    </>
  );
}

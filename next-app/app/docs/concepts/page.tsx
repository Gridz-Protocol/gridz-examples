export default function ConceptsPage() {
  return (
    <>
      <h1>Concepts</h1>
      <h2>Grid, cell, subject</h2>
      <p>
        A <strong>Grid</strong> is <code>{`{ subject, theme, layout, cells[] }`}</code>. A{" "}
        <strong>Cell</strong> is a typed key-value pair with its own attestation. A{" "}
        <strong>Subject</strong> is a human, agent, or organization identified by a DID.
      </p>
      <h2>Attestations</h2>
      <p>
        Every cell is signed. Formats include EAS (on/offchain), raw EIP-712, JWS (ed25519), and COSE
        (WebAuthn). Verification recovers the signer regardless of format.
      </p>
      <h2>Sinks are projections</h2>
      <p>
        ENS is the primary sink. A sink stores where a projection landed — the signed attestation
        remains authoritative.
      </p>
      <h2>gridz.eth subnames</h2>
      <p>
        Users get names as <strong>subnames of gridz.eth</strong> — e.g. <code>kevin.gridz.eth</code>.
        The GridzResolver answers ENSIP-10 wildcard reads for every subname via EAS attestations.
      </p>
      <h2>gridz.bio URLs</h2>
      <p>
        <code>kevin.gridz.bio</code> rewrites to the same profile as <code>kevin.gridz.eth</code> for
        sharing and discovery.
      </p>
      <h2>No custodied keys</h2>
      <p>Gridz never holds a private key. Signers wrap an external wallet, passkey, or 1Claw HSM.</p>
    </>
  );
}

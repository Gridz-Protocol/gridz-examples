import Link from "next/link";

export default function SpecCanonicalizationPage() {
  return (
    <>
      <h1>Canonicalization &amp; hashing</h1>
      <p>
        Verification only works if every runtime hashes the exact same bytes. This page summarizes{" "}
        <a
          href="https://github.com/Gridz-Protocol/gridz/blob/main/specs/canonicalization.md"
          target="_blank"
          rel="noreferrer"
        >
          <code>canonicalization.md</code>
        </a>{" "}
        — normative for TypeScript, Python, Solidity, and third-party verifiers.
      </p>

      <h2>1. Canonical form — RFC 8785 (JCS)</h2>
      <p>
        All value hashing is over the <strong>JSON Canonicalization Scheme</strong> (RFC 8785)
        serialization, written <code>JCS(x)</code>.
      </p>
      <p>JCS guarantees:</p>
      <ul>
        <li>Object keys sorted by UTF-16 code unit</li>
        <li>No insignificant whitespace</li>
        <li>Shortest round-tripping number form (ECMAScript <code>Number</code> semantics)</li>
        <li>UTF-8 output with minimal escaping</li>
      </ul>
      <p>
        Use vetted JCS libraries (<code>canonicalize</code> in TS, <code>rfc8785</code> in Python).
        Do not hand-roll canonicalization.
      </p>
      <p>
        <strong>Constraint:</strong> values MUST be JSON-serializable and MUST NOT rely on precision
        beyond IEEE-754 double. Token IDs, wei amounts, and other big integers are encoded as{" "}
        <strong>strings</strong>, never JSON numbers.
      </p>

      <h2>2. Hash functions</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Hash</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EVM (did:ethr, did:pkh:eip155, EAS, contracts)</td>
            <td>
              <code>keccak256</code>
            </td>
            <td>
              <code>value_hash</code>, <code>gridId</code>, merkle nodes
            </td>
          </tr>
          <tr>
            <td>non-EVM (did:pkh:solana, did:key, ed25519 signers)</td>
            <td>
              <code>sha256</code>
            </td>
            <td>
              <code>value_hash</code>, <code>gridId</code>, merkle nodes
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        A Grid&apos;s hash domain is fixed by the subject DID&apos;s signing curve. It is implied by
        the attestation <code>format</code> (<code>eip712-*</code> ⇒ keccak256;{" "}
        <code>jws-ed25519</code> / <code>cose-webauthn</code> ⇒ sha256) and MUST be consistent across
        all cells in a Grid.
      </p>
      <p>All hash outputs are 32 bytes, rendered as lowercase hex with a <code>0x</code> prefix.</p>

      <h2>3. Derived values</h2>

      <h3>value_hash</h3>
      <pre>{`value_hash = H( JCS(cell.value) )`}</pre>
      <p>
        Stored as <code>attestation.value_hash</code> and as <code>valueHashHex</code> in EIP-712 / EAS{" "}
        <code>gridz.cell.v1</code>.
      </p>

      <h3>gridId</h3>
      <p>Stable 32-byte Grid identifier, independent of cell contents:</p>
      <pre>{`gridId = H( JCS({ "did": subject.did, "schema_version": grid.schema_version }) )`}</pre>

      <h3>widgetTypeHash</h3>
      <pre>{`widgetTypeHash = H( utf8( cell.widget_type ?? "" ) )`}</pre>
      <p>
        Plain UTF-8 hash of the string — <strong>not</strong> JCS. When <code>widget_type</code> is
        unset, hash the empty string.
      </p>

      <h2>4. Cell-level merkle tree</h2>
      <p>
        The root attestation signs a merkle root over cell <strong>attestation UIDs</strong>. The root
        commits to the cell set while each leaf remains independently verifiable.
      </p>

      <h3>Leaves</h3>
      <ul>
        <li>
          Leaf set = <code>attestation.uid</code> of every cell, <strong>including</strong> cells with{" "}
          <code>is_visible: false</code>
        </li>
        <li>
          Normalize each <code>uid</code> to 32 bytes: if <code>0x</code>-prefixed 32-byte hex (EAS uid),
          use directly; otherwise <code>leaf = H(utf8(uid))</code>
        </li>
        <li>Sort leaves ascending by 32-byte big-endian value</li>
      </ul>

      <h3>Internal nodes (sorted-pair)</h3>
      <pre>{`parent(a, b) = H( min(a,b) ‖ max(a,b) )`}</pre>
      <p>Build bottom-up. Odd levels promote the unpaired node unchanged (no duplication).</p>
      <ul>
        <li>
          0 cells: <code>merkleRoot = 0x00…00</code> (32 zero bytes)
        </li>
        <li>1 cell: merkle root equals that leaf</li>
      </ul>
      <p>
        <code>cellCount</code> in <code>GridzRoot</code> records the leaf count so verifiers can detect
        a root that silently dropped cells. On EVM this matches OpenZeppelin <code>MerkleProof</code>{" "}
        (sorted pairs) for on-chain proof checks in <code>GridzResolver.sol</code>.
      </p>

      <h2>5. What gets signed</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Attestation</th>
            <th>Signed struct</th>
            <th>Commits to</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell</td>
            <td>
              <code>GridzCell</code> (EIP-712) or EAS <code>gridz.cell.v1</code>
            </td>
            <td>
              <code>gridId</code>, <code>key</code>, <code>value_hash</code>,{" "}
              <code>widgetTypeHash</code>, <code>expiresAt</code>, <code>nonce</code>
            </td>
          </tr>
          <tr>
            <td>Root</td>
            <td>
              <code>GridzRoot</code> (EIP-712) or EAS <code>gridz.root.v1</code>
            </td>
            <td>
              <code>gridId</code>, <code>merkleRoot</code>, <code>schemaVersion</code>,{" "}
              <code>cellCount</code>, <code>issuedAt</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        For <code>jws-ed25519</code> / <code>cose-webauthn</code>, the signed payload is{" "}
        <code>JCS</code> of the same logical field set; the recovered key MUST map to{" "}
        <code>attestation.attester</code>.
      </p>

      <h2>6. Verification order (normative)</h2>
      <p>Given a cell and its attestation envelope, a verifier MUST:</p>
      <ol>
        <li>
          Recompute <code>value_hash</code> from <code>JCS(cell.value)</code> and check it equals{" "}
          <code>attestation.value_hash</code> and the signed <code>valueHashHex</code>.
        </li>
        <li>
          Recover/verify the signature and resolve the signer to a DID; check it equals{" "}
          <code>attestation.attester</code>.
        </li>
        <li>
          Check the attester is authorized for <code>subject.did</code> (self-issued or delegated).
        </li>
        <li>
          Check time bounds: <code>nbf</code>/<code>iat</code> ≤ now ≤ <code>exp</code> when present.
        </li>
        <li>Check revocation (EAS revocable status or revocation pointer) when present.</li>
      </ol>
      <p>
        Steps 1–2 require no network. Failing 2/3 ⇒ invalid (✗). Failing 4 ⇒ expired (⚠). On
        gridz.bio, <Link href="/docs/verification">verification</Link> also cross-checks EAS
        on-chain data against <code>GridzResolver</code> when <code>format</code> is{" "}
        <code>eas-onchain</code>.
      </p>
    </>
  );
}

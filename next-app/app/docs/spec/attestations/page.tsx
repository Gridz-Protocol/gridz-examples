import Link from "next/link";

export default function SpecAttestationsPage() {
  return (
    <>
      <h1>Attestations</h1>
      <p>
        Every cell and the Grid root carry an <strong>attestation envelope</strong> — a portable,
        self-describing reference to the signed proof. Validated by{" "}
        <a
          href="https://github.com/Gridz-Protocol/gridz/blob/main/specs/attestation.schema.json"
          target="_blank"
          rel="noreferrer"
        >
          <code>attestation.schema.json</code>
        </a>
        . Verification MUST NOT require trusting any sink, server, or vault.
      </p>

      <h2>Envelope shape</h2>
      <pre>{`{
  "format": "eas-onchain",
  "uid": "0x394d…",
  "uri": "eas://8453/0x394d…",
  "attester": "did:pkh:eip155:8453:0x…",
  "iat": "2025-06-01T12:00:00.000Z",
  "value_hash": "0xabc…",
  "exp": "2026-06-01T12:00:00.000Z",
  "revocation": { "method": "eas", "uri": "eas://8453/0x…" }
}`}</pre>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Required</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>format</code>
            </td>
            <td>yes</td>
            <td>How the attestation was produced (see formats below)</td>
          </tr>
          <tr>
            <td>
              <code>uid</code>
            </td>
            <td>yes</td>
            <td>
              Unique id: EAS uid for <code>eas-*</code>, JWS <code>jti</code> for{" "}
              <code>jws-ed25519</code>, etc. Used as merkle leaf for the root.
            </td>
          </tr>
          <tr>
            <td>
              <code>uri</code>
            </td>
            <td>yes</td>
            <td>
              Location of raw attestation. Schemes: <code>eas:</code>, <code>eth:</code>,{" "}
              <code>ipfs:</code>, <code>https:</code>, <code>data:</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>attester</code>
            </td>
            <td>yes</td>
            <td>DID of the signer. Recovered key MUST resolve to this DID.</td>
          </tr>
          <tr>
            <td>
              <code>iat</code>
            </td>
            <td>yes</td>
            <td>Issued-at (ISO-8601)</td>
          </tr>
          <tr>
            <td>
              <code>value_hash</code>
            </td>
            <td>yes</td>
            <td>
              <code>H(JCS(cell.value))</code> for cells; merkle root for root attestation. See{" "}
              <Link href="/docs/spec/canonicalization">Canonicalization</Link>.
            </td>
          </tr>
          <tr>
            <td>
              <code>nbf</code>, <code>exp</code>
            </td>
            <td>no</td>
            <td>Not-before / expiry windows</td>
          </tr>
          <tr>
            <td>
              <code>revocation</code>
            </td>
            <td>no</td>
            <td>
              Pointer to revocation status (<code>eas</code> or <code>status-list-2021</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>payload</code>
            </td>
            <td>no</td>
            <td>Base64url raw signed payload for fully offline verification</td>
          </tr>
        </tbody>
      </table>

      <h2>Formats</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>format</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>eas-onchain</code>
            </td>
            <td>
              Ethereum Attestation Service record on-chain (gridz.bio production). Revocable via EAS.
            </td>
          </tr>
          <tr>
            <td>
              <code>eas-offchain</code>
            </td>
            <td>EAS off-chain attestation with the same logical fields</td>
          </tr>
          <tr>
            <td>
              <code>eip712-raw</code>
            </td>
            <td>Raw EIP-712 signature over <code>GridzCell</code> / <code>GridzRoot</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>eip712-oneclaw</code>
            </td>
            <td>
              Byte-for-byte identical to <code>eip712-raw</code> at verification; suffix records 1Claw
              HSM provenance only
            </td>
          </tr>
          <tr>
            <td>
              <code>jws-ed25519</code>
            </td>
            <td>Ed25519 JWS over JCS payload (Solana, passkeys-adjacent flows)</td>
          </tr>
          <tr>
            <td>
              <code>cose-webauthn</code>
            </td>
            <td>WebAuthn / COSE attestation; attester typically <code>did:key</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>EIP-712 structs</h2>
      <p>
        Defined in{" "}
        <a
          href="https://github.com/Gridz-Protocol/gridz/blob/main/specs/eip712-types.ts"
          target="_blank"
          rel="noreferrer"
        >
          <code>eip712-types.ts</code>
        </a>
        . Domain:
      </p>
      <pre>{`{
  name: "Gridz",
  version: "1",
  chainId: <chain>,
  verifyingContract: <GridzResolver proxy address>
}`}</pre>

      <h3>GridzCell</h3>
      <p>Primary type for a single cell attestation:</p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>gridId</code>
            </td>
            <td>bytes32</td>
            <td>Stable Grid id (see canonicalization)</td>
          </tr>
          <tr>
            <td>
              <code>key</code>
            </td>
            <td>string</td>
            <td>Cell key verbatim, e.g. <code>com.github</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>valueHashHex</code>
            </td>
            <td>string</td>
            <td>
              <code>keccak256(JCS(value))</code> as <code>0x</code> hex
            </td>
          </tr>
          <tr>
            <td>
              <code>widgetTypeHash</code>
            </td>
            <td>bytes32</td>
            <td>
              <code>keccak256(utf8(widget_type ?? ""))</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>expiresAt</code>
            </td>
            <td>uint64</td>
            <td>Unix seconds; <code>0</code> = never</td>
          </tr>
          <tr>
            <td>
              <code>nonce</code>
            </td>
            <td>uint64</td>
            <td>Monotonic per <code>(gridId, key)</code>; prevents replay of stale values</td>
          </tr>
        </tbody>
      </table>

      <h3>GridzRoot</h3>
      <p>Primary type for the Grid root attestation:</p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>gridId</code>
            </td>
            <td>bytes32</td>
            <td>Same gridId as cells</td>
          </tr>
          <tr>
            <td>
              <code>merkleRoot</code>
            </td>
            <td>bytes32</td>
            <td>Sorted merkle root over cell attestation UIDs</td>
          </tr>
          <tr>
            <td>
              <code>schemaVersion</code>
            </td>
            <td>string</td>
            <td>e.g. <code>gridz/1.0.0</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>cellCount</code>
            </td>
            <td>uint64</td>
            <td>Number of merkle leaves</td>
          </tr>
          <tr>
            <td>
              <code>issuedAt</code>
            </td>
            <td>uint64</td>
            <td>Unix seconds</td>
          </tr>
        </tbody>
      </table>

      <h2>EAS schemas</h2>
      <p>
        On-chain EAS registrations mirror the EIP-712 logical fields. EAS carries <code>refUID</code>{" "}
        and <code>time</code> in its envelope instead of embedding <code>nonce</code> /{" "}
        <code>issuedAt</code> in the schema string.
      </p>

      <h3>gridz.cell.v1</h3>
      <pre>{`bytes32 gridId, string key, string valueHashHex, uint64 expiresAt, bytes32 widgetTypeHash`}</pre>
      <p>Revocable. Used for every published cell on gridz.bio (Base mainnet).</p>

      <h3>gridz.root.v1</h3>
      <pre>{`bytes32 gridId, bytes32 merkleRoot, string schemaVersion`}</pre>
      <p>Revocable. Binds the full cell set when a root attestation is published.</p>

      <h2>gridz.bio publish flow</h2>
      <ol>
        <li>Browser wallet signs <code>GridzCell</code> via EIP-712 (user holds keys).</li>
        <li>
          Client POSTs signed payload to <code>/api/publish</code>.
        </li>
        <li>
          Registrar contract calls EAS <code>attest</code> and{" "}
          <code>GridzResolver.setCellAttestation</code> on Base (registrar pays gas).
        </li>
        <li>
          Profile read path loads cells from resolver + EAS and assembles the Grid JSON with{" "}
          <code>format: "eas-onchain"</code> envelopes.
        </li>
      </ol>
      <p>
        Details: <Link href="/docs/spec/on-chain">On-chain (Base)</Link>,{" "}
        <Link href="/docs/using-gridz">Using gridz.bio</Link>.
      </p>
    </>
  );
}

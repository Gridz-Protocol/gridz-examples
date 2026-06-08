import Link from "next/link";

export default function SpecOnChainPage() {
  return (
    <>
      <h1>On-chain (Base)</h1>
      <p>
        gridz.bio production runs on <strong>Base mainnet</strong> (chain id <code>8453</code>). Subject
        names remain <code>*.gridz.eth</code>; the app reads <code>GridzResolver</code> and EAS
        directly on Base via RPC. Full deployment table:{" "}
        <a
          href="https://github.com/Gridz-Protocol/gridz/blob/main/specs/deployments.md"
          target="_blank"
          rel="noreferrer"
        >
          <code>deployments.md</code>
        </a>
        .
      </p>

      <h2>Base mainnet (production)</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Contract / config</th>
            <th>Address / value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chain ID</td>
            <td>
              <code>8453</code>
            </td>
          </tr>
          <tr>
            <td>GridzResolver (UUPS proxy)</td>
            <td>
              <code>0x73c5e3944B780D4927c403d351A4F94875DC57B3</code>
            </td>
          </tr>
          <tr>
            <td>EAS</td>
            <td>
              <code>0x4200000000000000000000000000000000000021</code>
            </td>
          </tr>
          <tr>
            <td>EAS SchemaRegistry</td>
            <td>
              <code>0x4200000000000000000000000000000000000020</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>gridz.cell.v1</code> schema UID
            </td>
            <td>
              <code>0x394d8e67b1470cbdb7fa6c7d15d15d295ca81d822b55267939751a8a686abb87</code>
            </td>
          </tr>
          <tr>
            <td>Registrar (server publish)</td>
            <td>
              <code>0xEBE4ceb499Ad95DC1e5662E3a223Ec8cc0a555d9</code>
            </td>
          </tr>
          <tr>
            <td>Public RPC</td>
            <td>
              <code>https://base.publicnode.com</code>
            </td>
          </tr>
          <tr>
            <td>EAS explorer</td>
            <td>
              <a href="https://base.easscan.org" target="_blank" rel="noreferrer">
                base.easscan.org
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Schema string (same on all EAS networks; UID differs per chain):{" "}
        <code>
          bytes32 gridId, string key, string valueHashHex, uint64 expiresAt, bytes32 widgetTypeHash
        </code>
      </p>

      <h2>GridzResolver</h2>
      <p>
        The resolver is the on-chain index for Gridz profiles on a chain. For each ENS name (via
        wildcard <code>*.gridz.eth</code>) it stores:
      </p>
      <ul>
        <li>
          Per-cell EAS attestation UID mapped by <code>(gridId, key)</code>
        </li>
        <li>Nonce tracking to prevent replay of superseded cell values</li>
        <li>Links to the EIP-712 verifying contract used for signatures on that chain</li>
      </ul>
      <p>
        Reading a profile: resolve ENS → fetch cell UIDs from resolver → load EAS attestations →
        decode <code>gridz.cell.v1</code> fields → assemble Grid JSON. This is what{" "}
        <code>loadGrid()</code> and <code>GET /api/profile/{`{subject}`}</code> do on gridz.bio.
      </p>

      <h2>Publish pipeline</h2>
      <pre>{`Wallet (EIP-712 GridzCell)
        │
        ▼
POST /api/publish  { subject, key, signature, typed data, … }
        │
        ▼
Registrar EOA/contract
  ├─ EAS.attest(gridz.cell.v1, …)
  └─ GridzResolver.setCellAttestation(ensNode, key, uid, nonce)
        │
        ▼
Profile live at alias.gridz.bio + GET /api/profile/alias.gridz.eth`}</pre>
      <p>
        The user signs; the registrar submits transactions and pays gas. Gridz never holds the
        user&apos;s private key. The registrar cannot forge signatures — it only wraps already-signed
        attestations on-chain.
      </p>
      <p>
        Publish errors like <code>replacement transaction underpriced</code> are handled with nonce
        clearing and gas-bump retries in the gridz.bio editor.
      </p>

      <h2>Verification on-chain</h2>
      <p>
        <code>verifyGrid</code> in <code>@gridz/core</code> performs local hash + signature checks
        first, then for <code>eas-onchain</code> cells:
      </p>
      <ol>
        <li>Fetch the EAS attestation by UID from Base RPC</li>
        <li>Confirm schema UID matches <code>gridz.cell.v1</code></li>
        <li>Decode on-chain fields and compare to cell + envelope</li>
        <li>Cross-check resolver mapping for <code>(subject, key)</code> → same UID</li>
        <li>Check revocation status if applicable</li>
      </ol>
      <p>
        gridz.bio exposes this via <code>GET /api/verify/{`{subject}`}</code> because browsers cannot
        reliably call Base RPC (CORS). See <Link href="/docs/verification">Verification</Link>.
      </p>

      <h2>Legacy &amp; testnet</h2>

      <h3>Ethereum mainnet (legacy)</h3>
      <p>Earlier publishes used L1 before the Base migration.</p>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Contract</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GridzResolver (UUPS proxy)</td>
            <td>
              <code>0x190a9c0D29bCca03efeA85dcDF8F4b283e32dc52</code>
            </td>
          </tr>
          <tr>
            <td>EAS</td>
            <td>
              <code>0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Sepolia (testnet)</h3>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Contract</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>EAS</td>
            <td>
              <code>0xC2679fBD37d54388Ce493F1DB75320D236e1815e</code>
            </td>
          </tr>
          <tr>
            <td>EAS SchemaRegistry</td>
            <td>
              <code>0x0a7E2Ff54e576B096E04665717A6C3B2a33b9e4a</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Deploy a fresh resolver with <code>forge script script/Deploy.s.sol</code> and register the cell
        schema with <code>node scripts/register-cell-schema.mjs</code>.
      </p>

      <h2>Contract upgrades</h2>
      <p>
        GridzResolver is UUPS-upgradeable. Upgrades require <code>UPGRADER_ROLE</code> on the proxy:
      </p>
      <pre>{`PROXY_ADDRESS=<proxy> forge script script/Upgrade.s.sol \\
  --rpc-url <rpc> --broadcast --private-key <key>`}</pre>
    </>
  );
}

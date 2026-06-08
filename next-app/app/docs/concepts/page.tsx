export default function ConceptsPage() {
  return (
    <>
      <h1>Concepts</h1>
      <p>
        A few terms that show up across gridz.bio, the API, and the open-source packages. No
        blockchain expertise required.
      </p>

      <h2>Grid</h2>
      <p>
        Your profile as structured data: <code>{`{ subject, theme, cells[], root_attestation }`}</code>
        . The Grid is what gets signed, published, fetched, and rendered. One Grid per identity.
      </p>

      <h2>Cell</h2>
      <p>
        A single field in your profile — e.g. <code>alias</code>, <code>description</code>,{" "}
        <code>url</code>, or a widget like <code>gridz.stats</code>. Each cell has a key, a value, a
        position on the layout, and its <strong>own attestation</strong> (its own signature).
      </p>

      <h2>Subject</h2>
      <p>
        Who the Grid belongs to: a human, AI agent, or organization. On gridz.bio this is usually an
        ENS name (<code>kevin.gridz.eth</code>) with a matching DID (<code>did:ens:kevin.gridz.eth</code>
        ).
      </p>

      <h2>Attestation</h2>
      <p>
        Cryptographic proof that a specific key signed a specific value at a specific time. Formats
        include:
      </p>
      <ul>
        <li>
          <strong>EIP-712</strong> — what your browser wallet signs at claim time.
        </li>
        <li>
          <strong>EAS on-chain</strong> — what gridz.bio writes to Ethereum when you publish (wraps
          your signature in an Ethereum Attestation Service record).
        </li>
        <li>
          <strong>JWS / COSE</strong> — for passkeys and other signers in the broader framework.
        </li>
      </ul>
      <p>
        The attestation is the source of truth. Everything else — this website, the API, a database —
        is just a <em>view</em> of it.
      </p>

      <h2>Sink</h2>
      <p>
        A place a signed Grid gets <em>projected</em> to — ENS, SQLite, Postgres, S3, etc. For
        gridz.bio users the sink is <strong>ENS on Ethereum mainnet</strong>, backed by the
        GridzResolver and EAS. Sinks make data easy to query; they don&apos;t replace signatures.
      </p>

      <h2>gridz.eth and gridz.bio</h2>
      <ul>
        <li>
          <code>kevin.gridz.eth</code> — your on-chain ENS identity. Resolves via the GridzResolver
          wildcard.
        </li>
        <li>
          <code>kevin.gridz.bio</code> — the same profile as a normal website URL for sharing and
          discovery.
        </li>
      </ul>

      <h2>Draft vs on-chain</h2>
      <p>
        <strong>Draft</strong> = signed in your browser, saved locally, not published.{" "}
        <strong>On-chain</strong> = EAS attestations written to Ethereum; public via gridz.bio and the
        API. See <a href="/docs/using-gridz">Using gridz.bio</a>.
      </p>

      <h2>No custodied keys</h2>
      <p>
        Gridz (the framework and gridz.bio) never holds your private key. You sign with your wallet,
        the CLI with your local key, or an agent with 1Claw HSM. The server registrar on gridz.bio
        only submits <em>its own</em> transactions to link your already-signed attestations on-chain
        — it cannot impersonate you.
      </p>
    </>
  );
}

export default function DocsHome() {
  return (
    <>
      <h1>Gridz documentation</h1>
      <p>
        Gridz is an open framework for <strong>cryptographically-attested social graphs</strong> that
        work for humans, AI agents, and organizations.
      </p>
      <p>
        A <strong>Grid</strong> is a profile built from typed, signed fields — &quot;cells&quot;. Each cell
        carries a verifiable attestation, so anyone can prove who said what, when, and under which key.
      </p>
      <h2>Why Gridz</h2>
      <ul>
        <li>
          <strong>Multi-modal</strong> — one model for people, agents, and orgs.
        </li>
        <li>
          <strong>Verifiable, not trusted</strong> — sinks are projections; attestations are authoritative.
        </li>
        <li>
          <strong>Bring your own identity</strong> — local wallets, passkeys, or 1Claw HSM.
        </li>
        <li>
          <strong>Same surface everywhere</strong> — TypeScript and Python, byte-for-byte compatible.
        </li>
      </ul>
      <p>
        New here? <a href="/docs/claim">Claim your profile</a> or read{" "}
        <a href="/docs/getting-started">Getting started</a>. Everything lives on{" "}
        <a href="https://gridz.bio">gridz.bio</a>.
      </p>
    </>
  );
}

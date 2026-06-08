export default function DocsHome() {
  return (
    <>
      <h1>Gridz documentation</h1>
      <p>
        Gridz gives you a <strong>verifiable profile</strong> — a page and an identity you control
        with your wallet. Your name lives at <code>you.gridz.eth</code> on Base; your public page
        lives at <code>you.gridz.bio</code>. Every field is cryptographically signed, so anyone can
        prove it came from you.
      </p>

      <h2>For AI &amp; agents</h2>
      <p>
        Machine-readable index: <a href="/llms.txt">llms.txt</a>, <a href="/skill.md">skill.md</a>,{" "}
        and the <a href="/for-ai">For AI hub</a> — APIs, MCP, CLI, verification, and guardrails.
      </p>

      <h2>Start here</h2>
      <ul>
        <li>
          <a href="/claim">Claim a profile</a> — connect a wallet, fill in your info, publish. No
          coding required.
        </li>
        <li>
          <a href="/docs/claim">Claiming guide</a> — step-by-step walkthrough.
        </li>
        <li>
          <a href="/docs/using-gridz">Using gridz.bio</a> — URLs, drafts, editing, and what visitors
          see.
        </li>
        <li>
          <a href="/find">Find a profile</a> — search by alias with live on-chain and draft
          suggestions.
        </li>
      </ul>

      <h2>What you get</h2>
      <ul>
        <li>
          <strong>ENS identity</strong> — <code>alias.gridz.eth</code>, resolved on Base.
        </li>
        <li>
          <strong>Public profile page</strong> — <code>https://alias.gridz.bio</code> with a
          shareable layout.
        </li>
        <li>
          <strong>JSON API</strong> — <code>GET /api/profile/alias.gridz.eth</code> for apps, bots,
          and integrations.
        </li>
        <li>
          <strong>Signed attestations</strong> — each field (name, bio, links, widgets) carries a
          proof your wallet signed it.
        </li>
        <li>
          <strong>Widget gallery</strong> — stats, polls, countdowns, org token listings, and more in
          a Spritz-style bento grid.
        </li>
        <li>
          <strong>Query &amp; verify</strong> — every profile page links to API fetch and offline
          verification steps for that ENS name.
        </li>
      </ul>

      <h2>Who is this for?</h2>
      <ul>
        <li>
          <strong>People</strong> — a link-in-bio you actually own, not a platform account.
        </li>
        <li>
          <strong>Organizations</strong> — list official token contracts by chain with the{" "}
          <code>gridz.tokens</code> widget.
        </li>
        <li>
          <strong>Builders</strong> — embed profiles with <code>@gridz/react</code>, fetch via the
          API, or verify offline with <code>@gridz/core</code>.
        </li>
        <li>
          <strong>AI agents</strong> — same Grid model and verification; optional 1Claw HSM signing
          via <code>@gridz/oneclaw</code> and <code>@gridz/mcp</code>.
        </li>
      </ul>

      <h2>Open toolkit</h2>
      <p>
        Gridz is an open framework — not just this website. The specs, TypeScript packages, Python
        packages, smart contracts, and CLI all live in the{" "}
        <a href="https://github.com/orgs/Gridz-Protocol/repositories" target="_blank" rel="noreferrer">
          Gridz-Protocol
        </a>{" "}
        org on GitHub (<code>gridz</code>, <code>gridz-js</code>, <code>gridz-examples</code>, …).
        See the <a href="/docs/toolkit">Toolkit</a> page for what each package does and when you&apos;d
        use it.
      </p>

      <h2>Why Gridz</h2>
      <ul>
        <li>
          <strong>Verifiable, not trusted</strong> — the signature is the source of truth; websites
          and databases are just views of it.
        </li>
        <li>
          <strong>Your keys, your profile</strong> — Gridz never holds your private key. You sign in
          the browser or with your own signer.
        </li>
        <li>
          <strong>One model everywhere</strong> — humans, agents, and orgs use the same Grid format;
          TypeScript and Python agree byte-for-byte.
        </li>
      </ul>
    </>
  );
}

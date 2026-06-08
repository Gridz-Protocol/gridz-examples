import Link from "next/link";
import { FOR_AI_LINKS } from "../../lib/forAiContent";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const SITE = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";

export const metadata = {
  title: "For AI & agents",
  description:
    "Machine-readable docs for LLMs and agents integrating with Gridz — llms.txt, skill.md, API, MCP, CLI, and verification.",
};

const MACHINE_FILES = [
  { href: "/llms.txt", label: "llms.txt", desc: "LLM discovery index (llmstxt.org). Link from your agent config or system prompt." },
  { href: "/skill.md", label: "skill.md", desc: "Agent skill file — workflows, APIs, packages, guardrails. Load in Cursor or Claude." },
  { href: "/for-ai/llms.txt", label: "/for-ai/llms.txt", desc: "Same content as root llms.txt." },
  { href: "/for-ai/skill.md", label: "/for-ai/skill.md", desc: "Same content as root skill.md." },
];

const QUICK_LINKS = [
  { href: "/docs/api", label: "API reference", desc: "GET /api/profile/{ens} — read any published profile" },
  { href: "/docs/toolkit", label: "Toolkit", desc: "@gridz/core, mcp, sdk, sinks, oneclaw" },
  { href: "/docs/cli", label: "CLI", desc: "gridz init, build, verify, publish" },
  { href: "/docs/concepts", label: "Concepts", desc: "Cells, attestations, sinks, verification" },
  { href: "/docs/verification", label: "Verification", desc: "How to trust a Grid offline" },
  { href: "/docs/using-gridz", label: "Using gridz.bio", desc: "URLs, drafts, publish flow" },
];

const CODE_READ = `curl -s "${FOR_AI_LINKS.profileApi(`kevin.${ENS_BASE}`)}" | jq '.grid.cells[] | {key, value}'`;

const CODE_VERIFY = `import { verifyGrid } from "@gridz/core";

const res = await fetch("${FOR_AI_LINKS.profileApi(`kevin.${ENS_BASE}`)}");
const { grid } = await res.json();
const report = await verifyGrid(grid);`;

const CODE_MCP = `{
  "mcpServers": {
    "gridz": {
      "command": "npx",
      "args": ["-y", "@gridz/mcp"]
    }
  }
}`;

export default function ForAiPage() {
  return (
    <div className="for-ai-page">
      <section className="for-ai-hero">
        <p className="site-badge">Agents · MCP · LLMs</p>
        <h1>For AI &amp; agents</h1>
        <p className="for-ai-hero__lead">
          Everything an automated system needs to read, verify, and publish Gridz profiles — without
          scraping the marketing site. Identity lives on <code>{ENS_BASE}</code>; this host (
          <code>{SITE}</code>) is the public read API and docs surface.
        </p>
        <div className="for-ai-hero__actions">
          <a className="site-btn site-btn--primary" href="/llms.txt">Download llms.txt</a>
          <a className="site-btn" href="/skill.md">Download skill.md</a>
          <Link className="site-btn site-btn--ghost" href="/docs">Human docs</Link>
        </div>
      </section>

      <section className="for-ai-section">
        <h2>Machine-readable files</h2>
        <p className="for-ai-section__hint">Point your agent at these URLs. Content is generated from the same source and cached for 1h.</p>
        <ul className="for-ai-cards">
          {MACHINE_FILES.map((f) => (
            <li key={f.href}>
              <a href={f.href} className="for-ai-card">
                <span className="for-ai-card__title">{f.label}</span>
                <span className="for-ai-card__desc">{f.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="for-ai-section">
        <h2>Read a profile (start here)</h2>
        <pre className="for-ai-code"><code>{CODE_READ}</code></pre>
        <p>Returns a signed <code>gridz/1.0.0</code> JSON Grid. <code>ok: false</code> means nothing is published on-chain yet.</p>
        <ul className="for-ai-links">
          <li><a href={FOR_AI_LINKS.profileApi(`kevin.${ENS_BASE}`)}>Example API response</a></li>
          <li><a href={FOR_AI_LINKS.profilePage(`kevin.${ENS_BASE}`)}>Example rendered page</a></li>
        </ul>
      </section>

      <section className="for-ai-section">
        <h2>Verify attestations</h2>
        <pre className="for-ai-code"><code>{CODE_VERIFY}</code></pre>
        <p>See <Link href="/docs/verification">verification docs</Link>.</p>
      </section>

      <section className="for-ai-section">
        <h2>Publish (agents)</h2>
        <p><strong>Do not</strong> call <code>POST /api/publish</code> from third-party agents. Sign locally, then publish via MCP, CLI, SDK, or 1Claw.</p>
        <h3>MCP config snippet</h3>
        <pre className="for-ai-code"><code>{CODE_MCP}</code></pre>
      </section>

      <section className="for-ai-section">
        <h2>Agent identity cells</h2>
        <table className="docs-table">
          <thead><tr><th>Key</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>agent-context</code></td><td>Context for other agents (ENSIP-26)</td></tr>
            <tr><td><code>agent-endpoint[mcp]</code></td><td>MCP server URL</td></tr>
            <tr><td><code>agent.capabilities</code></td><td>JSON capability list</td></tr>
            <tr><td><code>alias</code>, <code>description</code>, <code>url</code></td><td>Profile fields (same as humans)</td></tr>
          </tbody>
        </table>
      </section>

      <section className="for-ai-section">
        <h2>Documentation</h2>
        <ul className="for-ai-cards">
          {QUICK_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="for-ai-card">
                <span className="for-ai-card__title">{l.label}</span>
                <span className="for-ai-card__desc">{l.desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="for-ai-section for-ai-section--repos">
        <h2>Source repos</h2>
        <ul>
          <li><a href={FOR_AI_LINKS.github} target="_blank" rel="noreferrer">Gridz-Protocol/gridz</a> — specs, contracts, examples</li>
          <li><a href={FOR_AI_LINKS.githubJs} target="_blank" rel="noreferrer">gridz-js</a> — TypeScript packages</li>
          <li><a href={FOR_AI_LINKS.githubPy} target="_blank" rel="noreferrer">gridz-py</a> — Python packages</li>
          <li><a href={FOR_AI_LINKS.specs} target="_blank" rel="noreferrer">specs/</a> — schemas and standard keys</li>
        </ul>
      </section>

      <section className="for-ai-section for-ai-guardrails">
        <h2>Guardrails</h2>
        <ul>
          <li>Never send private keys to gridz.bio or any Gridz HTTP API.</li>
          <li><code>POST /api/publish</code> is editor-only unless you operate registrar keys.</li>
          <li>Profile API 404 = unpublished on-chain, not a transient error.</li>
          <li>Browser Draft badges = localStorage only; API cannot see drafts.</li>
        </ul>
      </section>
    </div>
  );
}

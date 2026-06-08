const SITE = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "gridz.bio";
const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const ORIGIN = `https://${SITE}`;

const DEMO = process.env.NEXT_PUBLIC_DEMO_PROFILE_SUBJECT ?? "demo.gridz.eth";

export const FOR_AI_LINKS = {
  origin: ORIGIN,
  forAi: `${ORIGIN}/for-ai`,
  llmsTxt: `${ORIGIN}/llms.txt`,
  skillMd: `${ORIGIN}/skill.md`,
  docs: `${ORIGIN}/docs`,
  api: `${ORIGIN}/docs/api`,
  toolkit: `${ORIGIN}/docs/toolkit`,
  cli: `${ORIGIN}/docs/cli`,
  concepts: `${ORIGIN}/docs/concepts`,
  verification: `${ORIGIN}/docs/verification`,
  claim: `${ORIGIN}/claim`,
  find: `${ORIGIN}/find`,
  profileApi: (subject: string) => `${ORIGIN}/api/profile/${encodeURIComponent(subject)}`,
  profilePage: (subject: string) => `${ORIGIN}/${encodeURIComponent(subject)}`,
  demoProfile: `${ORIGIN}/${encodeURIComponent(DEMO)}`,
  demoApi: `${ORIGIN}/api/profile/${encodeURIComponent(DEMO)}`,
  github: "https://github.com/Gridz-Protocol/gridz",
  githubJs: "https://github.com/Gridz-Protocol/gridz-js",
  githubPy: "https://github.com/Gridz-Protocol/gridz-py",
  specs: "https://github.com/Gridz-Protocol/gridz/tree/main/specs",
} as const;

export function buildLlmsTxt(): string {
  return `# Gridz

> Gridz is an open framework for cryptographically-attested profiles on Ethereum.
> Identity: \`alias.${ENS_BASE}\` · Public page: \`https://alias.${SITE}\` · Every cell is wallet-signed (EIP-712) and published via EAS on mainnet.

This file is for LLMs, agents, and automated tools. Start here before integrating with Gridz.

## Agent entrypoints

- [For AI hub](${FOR_AI_LINKS.forAi}): overview, quickstart, and links to machine-readable files
- [skill.md](${FOR_AI_LINKS.skillMd}): Cursor / agent skill — workflows, APIs, packages, guardrails
- [Documentation](${FOR_AI_LINKS.docs}): human-readable guides (claiming, API, CLI, toolkit)
- [Profile read API](${FOR_AI_LINKS.api}): \`GET /api/profile/{ensName}\` — JSON Grid, CORS open

## Demo profile (integration test)

- [Demo profile](${FOR_AI_LINKS.demoProfile}) — Spritz-style widget showcase at demo.gridz.eth
- Refresh: pnpm demo:publish (requires GRIDZ_SIGNER_KEY + registrar env)
- Verify: pnpm demo:verify

## Read a profile (primary integration)

\`\`\`
GET ${ORIGIN}/api/profile/kevin.${ENS_BASE}
\`\`\`

Response: \`{ ok, subject, grid }\` where \`grid\` is schema \`gridz/1.0.0\` with \`subject\`, \`theme\`, \`cells[]\`, \`root_attestation\`.

- \`404\` / \`ok: false\` = nothing published on-chain yet (browser drafts are not visible via API).
- Render in apps: \`@gridz/react\`, \`@gridz/vue\`, or fetch JSON and build your own UI.
- Verify offline: \`verifyGrid(grid)\` from \`@gridz/core\` (TypeScript) or \`gridz.verify_grid\` (Python).

## URLs & naming

| What | Pattern |
|------|---------|
| ENS subject | \`{alias}.${ENS_BASE}\` |
| Web profile | \`https://{alias}.${SITE}\` |
| JSON API | \`GET ${ORIGIN}/api/profile/{alias}.${ENS_BASE}\` |
| Wildcard | \`{alias}.${SITE}\` rewrites to the profile page |

## Write / publish (agents)

**Do not** call \`POST ${ORIGIN}/api/publish\` from third-party agents — it is for the gridz.bio editor registrar flow only.

Agents should sign locally, then publish via:

1. **MCP** — \`@gridz/mcp\` (read/write Grids from Cursor, Claude Desktop, etc.; never signs server-side)
2. **CLI** — \`gridz grid build\` + \`gridz publish --sink ens\` (see [CLI docs](${FOR_AI_LINKS.cli}))
3. **SDK** — \`buildGrid()\` + \`@gridz/sinks\` EnsSink or self-hosted \`@gridz/server\`
4. **1Claw HSM** — \`@gridz/oneclaw\` for agent identities without browser wallets

Signing requires EIP-712 typed data per cell (\`GridzCell\`) plus a root (\`GridzRoot\`). Specs: [eip712-types](${FOR_AI_LINKS.specs}/eip712-types.ts), [canonicalization](${FOR_AI_LINKS.specs}/canonicalization.md).

## Standard cell keys (common)

| Key | Purpose |
|-----|---------|
| \`alias\` | Display name |
| \`description\` | Bio |
| \`url\` | Website (https) |
| \`avatar\` | Profile image URL |
| \`com.twitter\`, \`com.github\`, \`social.bsky\` | Social handles |
| \`agent-context\` | Free-form context for agents (ENSIP-26) |
| \`agent-endpoint[mcp]\` | MCP server URL (ENSIP-26) |
| \`agent.capabilities\`, \`agent.model\`, \`agent.version\` | Gridz agent metadata |
| \`gridz.stats\`, \`gridz.poll\`, \`gridz.social_link\`, … | Bento widgets |

Full registry: [standard-keys.md](${FOR_AI_LINKS.specs}/standard-keys.md)

## Packages (TypeScript)

| Package | Use when |
|---------|----------|
| \`@gridz/core\` | Types, signing, \`verifyGrid()\` |
| \`@gridz/sdk\` | HTTP client + core helpers |
| \`@gridz/mcp\` | MCP server for agents |
| \`@gridz/oneclaw\` | 1Claw HSM signer |
| \`@gridz/sinks\` | ENS / DB projections |
| \`@gridz/cli\` | Terminal workflows |
| \`@gridz/react\` | React renderer |

Details: [Toolkit](${FOR_AI_LINKS.toolkit})

## Python

\`gridz\` (verify/build), \`gridz-mcp\`, \`gridz-oneclaw\` — cross-runtime compatible with TypeScript. Repo: [gridz-py](${FOR_AI_LINKS.githubPy})

## Verification rules

1. Recompute \`value_hash\` from canonical JSON of each \`cell.value\`; must match signed \`valueHashHex\`.
2. Recover signer from EIP-712 payload; must match \`attestation.attester\`.
3. On gridz.bio, on-chain cells use EAS (\`format: eas-onchain\`); resolver reads cleartext from attestations.

See [Verification docs](${FOR_AI_LINKS.verification})

## Examples in repo

- \`examples/next-app\` — gridz.bio (this site)
- \`examples/minimal-cli\` — smallest CLI publish flow
- \`examples/scaffold-agent-grid\` — agent-oriented bootstrap
- \`examples/oneclaw-quickstart\` — 1Claw HSM signing
- Templates: \`templates/agents-mcp\`, \`templates/agents-erc8004\`

## Optional

- [Find profile](${FOR_AI_LINKS.find}) — lookup by alias
- [Claim UI](${FOR_AI_LINKS.claim}) — human wallet flow
- OpenAPI (self-hosted server): \`specs/openapi.yaml\` in monorepo
`;
}

export function buildSkillMd(): string {
  return `---
name: gridz
description: Integrate with Gridz — verifiable Ethereum profiles (gridz.eth / gridz.bio). Read profiles via API, verify attestations, publish via MCP/CLI/SDK. Use when building agents, bots, or apps that fetch or update Gridz identities.
---

# Gridz agent skill

Gridz provides **cryptographically-attested profiles**: a signed JSON **Grid** of **cells** (fields/widgets) bound to an ENS name (\`*.${ENS_BASE}\`) and a public page (\`*.${SITE}\`).

## When to use this skill

- Fetch or display someone's Gridz profile
- Verify that profile fields were signed by the subject's wallet
- Build an agent identity on \`agent.${ENS_BASE}\` with \`agent-context\` and \`agent-endpoint[mcp]\`
- Publish or update cells programmatically (not via gridz.bio browser UI)

## Machine-readable index

- llms.txt: ${FOR_AI_LINKS.llmsTxt}
- Docs: ${FOR_AI_LINKS.docs}
- API reference: ${FOR_AI_LINKS.api}

## Quick read

\`\`\`bash
curl -s "${ORIGIN}/api/profile/kevin.${ENS_BASE}" | jq '.grid.cells[] | {key, value}'
\`\`\`

\`\`\`typescript
import { verifyGrid } from "@gridz/core";

const res = await fetch("${ORIGIN}/api/profile/kevin.${ENS_BASE}");
const { grid } = await res.json();
const report = await verifyGrid(grid);
\`\`\`

\`\`\`python
import httpx
from gridz import verify_grid

grid = httpx.get("${ORIGIN}/api/profile/kevin.${ENS_BASE}").json()["grid"]
report = verify_grid(grid)
\`\`\`

## Grid shape (gridz/1.0.0)

\`\`\`json
{
  "schema_version": "gridz/1.0.0",
  "subject": { "type": "human|agent|organization", "did": "...", "ens": "alias.${ENS_BASE}", "display_name": "..." },
  "theme": { "background_type": "solid", "accent_color": "#7c5cff", ... },
  "cells": [
    { "id": "alias", "key": "alias", "value": "Kevin", "position": {...}, "size": "1x1", "attestation": { "format": "eas-onchain", "uid": "0x...", "value_hash": "0x..." } }
  ],
  "root_attestation": { ... }
}
\`\`\`

## Read API (gridz.bio)

| Endpoint | Method | Notes |
|----------|--------|-------|
| \`/api/profile/{ensName}\` | GET | Public JSON; CORS open; 404 if unpublished |
| \`/{ensName}\` | GET | HTML profile page |
| \`https://{alias}.${SITE}\` | GET | Wildcard → same profile |

**Not for agents:** \`POST /api/publish\` — reserved for gridz.bio editor + registrar.

## Publish workflow (agents)

1. Define cells in \`gridz.yaml\` or build programmatically
2. Sign each cell + root with \`buildGrid(signer, input)\` from \`@gridz/core\`
3. Publish projection:
   - \`gridz publish --sink ens\` (CLI)
   - \`@gridz/mcp\` tools (MCP)
   - \`EnsSink.writeGrid(grid)\` (\`@gridz/sinks\`)
   - Self-hosted \`@gridz/server\` PUT endpoints

Human gridz.bio flow: wallet signs in browser → editor POSTs signed grid to registrar.

## Agent identity cells

| Key | Value |
|-----|-------|
| \`agent-context\` | Markdown/JSON context for other agents |
| \`agent-endpoint[mcp]\` | MCP server URL |
| \`agent-endpoint[a2a]\` | Agent-to-agent endpoint |
| \`agent.capabilities\` | JSON string array |
| \`agent.model\` | Model id string |
| \`agent.oneclaw_id\` | Optional 1Claw binding |

Templates: \`templates/agents-mcp/gridz.yaml\`, \`templates/agents-erc8004/gridz.yaml\`

## MCP setup (Cursor / Claude Desktop)

\`\`\`json
{
  "mcpServers": {
    "gridz": {
      "command": "npx",
      "args": ["-y", "@gridz/mcp"]
    }
  }
}
\`\`\`

Package: \`@gridz/mcp\` — exposes Grid read/write tools; signing happens client-side.

## CLI essentials

\`\`\`bash
gridz init -t agents-mcp
gridz cell add alias "My Agent"
gridz cell add agent-context "I help users manage Gridz profiles."
gridz grid build -o grid.json
gridz grid verify grid.json
gridz publish --sink ens --grid grid.json
\`\`\`

## Verification checklist

For each cell you trust:

1. Canonicalize \`cell.value\` (JCS) → hash must equal \`attestation.value_hash\` and signed \`valueHashHex\`
2. Recover EIP-712 signer → must equal \`attestation.attester\` (or authorized delegate)
3. Check expiry / revocation if present

Use \`verifyGrid(grid)\` — do not trust HTML or API without verification when security matters.

## Packages

| Package | Role |
|---------|------|
| \`@gridz/core\` | Types, EIP-712, verify |
| \`@gridz/sdk\` | HTTP + core |
| \`@gridz/mcp\` | Agent MCP server |
| \`@gridz/oneclaw\` | HSM signing |
| \`@gridz/sinks\` | ENS/DB storage |
| \`@gridz/cli\` | Terminal |
| \`@gridz/react\` | UI renderer |

Monorepo: ${FOR_AI_LINKS.github} · TS: ${FOR_AI_LINKS.githubJs} · Py: ${FOR_AI_LINKS.githubPy}

## Guardrails

- Never send private keys to gridz.bio or any Gridz API
- Treat \`POST /api/publish\` as editor-only unless you operate the registrar
- \`ok: false\` from profile API means on-chain empty — not a bug
- Browser **Draft** profiles are localStorage only; API won't see them
- Widget keys are \`gridz.*\`; social keys use reverse-dot (\`com.github\`)

## Further reading

- [Concepts](${FOR_AI_LINKS.concepts}) — cells, attestations, sinks
- [Toolkit](${FOR_AI_LINKS.toolkit}) — all packages
- [CLI](${FOR_AI_LINKS.cli}) — terminal publish
- [API](${FOR_AI_LINKS.api}) — gridz.bio endpoints
- [Verification](${FOR_AI_LINKS.verification}) — badge semantics
- Specs: ${FOR_AI_LINKS.specs}
`;
}

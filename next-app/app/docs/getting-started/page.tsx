export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting started</h1>
      <h2>1. Claim a subname</h2>
      <p>
        Go to <a href="/claim">gridz.bio/claim</a>, pick an alias, connect your wallet, and publish.
        You get <code>alias.gridz.eth</code> on-chain and <code>alias.gridz.bio</code> on the web.
        See the <a href="/docs/claim">claiming guide</a> for details.
      </p>
      <h2>2. Bootstrap (operators)</h2>
      <pre>
        <code>{`cp .env.example .env   # fill secrets
pnpm bootstrap --deploy --ens --vercel --yes`}</code>
      </pre>
      <h2>3. Build & verify locally</h2>
      <pre>
        <code>{`pnpm install
pnpm --filter gridz-next-app... run build
pnpm test`}</code>
      </pre>
      <h2>4. Profile API</h2>
      <pre>
        <code>{`GET /api/profile/kevin.gridz.eth

{
  "ok": true,
  "subject": "kevin.gridz.eth",
  "grid": { "subject", "theme", "cells", ... },
  "api": { "render": "https://gridz.bio/kevin.gridz.eth" }
}`}</code>
      </pre>

      <h2>5. Render in React</h2>
      <pre>
        <code>{`import { Grid } from "@gridz/react";
import "@gridz/react/styles.css";

<Grid grid={grid} />`}</code>
      </pre>
      <p>
        Also available: <code>@gridz/vue</code>, <code>@gridz/svelte</code>, and the{" "}
        <code>&lt;gridz-profile&gt;</code> web component.
      </p>
    </>
  );
}

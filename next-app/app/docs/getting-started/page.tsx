export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting started</h1>
      <h2>1. Claim a subname</h2>
      <p>
        Entities register as <code>alias.gridz.eth</code> and get a pretty URL at{" "}
        <code>alias.gridz.bio</code>. Visit your subdomain, connect a wallet, and use the in-browser
        editor.
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
      <h2>4. Render in React</h2>
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

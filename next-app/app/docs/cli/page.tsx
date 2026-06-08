export default function CliDocsPage() {
  return (
    <>
      <h1>CLI</h1>
      <p>
        The <code>gridz</code> command-line tool is for power users and developers who want to manage
        profiles from the terminal — without the gridz.bio web UI. Your private key stays local;
        Gridz never custodies it.
      </p>

      <h2>Install</h2>
      <pre>
        <code>{`# From the monorepo (developers)
pnpm --filter @gridz/cli build
pnpm exec gridz --help

# Or use via npx once published
npx @gridz/cli --help`}</code>
      </pre>

      <h2>Typical workflow</h2>
      <pre>
        <code>{`# 1. Scaffold a config (shape only — you fill in values)
gridz init --template minimal

# 2. Add cells
gridz cell add alias "Your Name"
gridz cell add description "A short bio"
gridz cell add url "https://gridz.bio"

# 3. Validate, build signed JSON, verify
gridz grid validate
gridz grid build -o grid.json
gridz grid verify grid.json

# 4. Publish to a sink (ENS, sqlite, etc.)
gridz sink list
gridz publish --sink ens --grid grid.json`}</code>
      </pre>
      <p>
        For ENS publish you need an RPC URL and a wallet/signer in your environment — same as any
        on-chain write. gridz.bio&apos;s web UI handles this for <code>*.gridz.eth</code> users via
        browser signing + server registrar.
      </p>

      <h2>Commands</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>gridz init -t &lt;template&gt;</code>
            </td>
            <td>
              Create <code>gridz.yaml</code> from a template (<code>minimal</code>, etc.).
            </td>
          </tr>
          <tr>
            <td>
              <code>gridz grid validate [path]</code>
            </td>
            <td>Check config shape and required fields.</td>
          </tr>
          <tr>
            <td>
              <code>gridz grid build [path] -o grid.json</code>
            </td>
            <td>Sign all cells and produce a Grid JSON file.</td>
          </tr>
          <tr>
            <td>
              <code>gridz grid verify &lt;grid.json&gt;</code>
            </td>
            <td>Verify every attestation in a built Grid.</td>
          </tr>
          <tr>
            <td>
              <code>gridz cell add &lt;key&gt; &lt;value&gt;</code>
            </td>
            <td>Append a cell to your <code>gridz.yaml</code>.</td>
          </tr>
          <tr>
            <td>
              <code>gridz identity whoami</code>
            </td>
            <td>Show the active signer derived from env / keystore.</td>
          </tr>
          <tr>
            <td>
              <code>gridz publish --sink &lt;name&gt;</code>
            </td>
            <td>Push a signed Grid to a sink (ENS, sqlite, memory, …).</td>
          </tr>
          <tr>
            <td>
              <code>gridz sink list</code>
            </td>
            <td>List available sink adapters.</td>
          </tr>
          <tr>
            <td>
              <code>gridz sink test &lt;name&gt;</code>
            </td>
            <td>Probe connectivity for a sink.</td>
          </tr>
          <tr>
            <td>
              <code>gridz schema &lt;key&gt;</code>
            </td>
            <td>Look up the schema for a cell key.</td>
          </tr>
        </tbody>
      </table>

      <p>
        Add <code>--json</code> to any command for machine-readable output. See the{" "}
        <code>examples/minimal-cli</code> project for a complete script that publishes to SQLite and
        renders static HTML.
      </p>
    </>
  );
}

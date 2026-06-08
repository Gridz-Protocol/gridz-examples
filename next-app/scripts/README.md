# gridz.bio scripts

## Demo profile (`demo.gridz.eth`)

Spritz-style widget showcase signed by a dedicated demo wallet, published via the
same EAS + registrar flow as real users.

### Env

| Variable | Role |
|----------|------|
| `GRIDZ_SIGNER_KEY` | Signs demo cells (EIP-712) — **not** the registrar |
| `REGISTRAR_PRIVATE_KEY` or `DEPLOYER_PRIVATE_KEY` | Writes EAS attestations on-chain |
| `GRIDZ_RESOLVER`, `EAS_ADDRESS`, `CELL_SCHEMA` | Same as production publish |

Optional: `GRIDZ_DEMO_SUBJECT` (default `demo.gridz.eth`).

### Publish

From repo root:

```bash
pnpm demo:publish
```

Or from `examples/next-app`:

```bash
pnpm publish-demo
```

### Verify

```bash
pnpm demo:verify
```

Checks the profile API returns alias, url, stats, poll, and `gridz.keys`.

### Data

Fixture: `scripts/__fixtures__/demoProfile.ts` (fictional **Nova Chen** — not a real person).

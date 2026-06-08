/** Canonical on-chain addresses for gridz.bio (Base mainnet). Override via env in production. */
export const GRIDZ_CHAIN_ID = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? process.env.GRIDZ_CHAIN_ID ?? "8453");

export const GRIDZ_BASE_MAINNET = {
  chainId: 8453,
  chainName: "Base",
  gridzResolver: (process.env.NEXT_PUBLIC_GRIDZ_RESOLVER ?? "0x73c5e3944B780D4927c403d351A4F94875DC57B3") as `0x${string}`,
  eas: (process.env.NEXT_PUBLIC_EAS_ADDRESS ?? "0x4200000000000000000000000000000000000021") as `0x${string}`,
  easSchemaRegistry: "0x4200000000000000000000000000000000000020" as const,
  cellSchema: (process.env.NEXT_PUBLIC_CELL_SCHEMA ??
    "0x394d8e67b1470cbdb7fa6c7d15d15d295ca81d822b55267939751a8a686abb87") as `0x${string}`,
  registrarAddress: (process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS ??
    "0xEBE4ceb499Ad95DC1e5662E3a223Ec8cc0a555d9") as `0x${string}`,
  rpc: process.env.NEXT_PUBLIC_GRIDZ_RPC_URL ?? "https://base.publicnode.com",
  easExplorer: "https://base.easscan.org",
  ensBase: process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth",
} as const;

/** Legacy Ethereum L1 deployment (pre–Base migration). */
export const GRIDZ_ETHEREUM_MAINNET_LEGACY = {
  chainId: 1,
  chainName: "Ethereum",
  gridzResolver: "0x190a9c0D29bCca03efeA85dcDF8F4b283e32dc52" as const,
  eas: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587" as const,
  easExplorer: "https://easscan.org",
} as const;

export function gridzDeploymentsMarkdown(): string {
  const d = GRIDZ_BASE_MAINNET;
  return `| Item | Value |
|------|-------|
| Chain | ${d.chainName} (\`${d.chainId}\`) |
| GridzResolver (proxy) | \`${d.gridzResolver}\` |
| EAS | \`${d.eas}\` |
| EAS SchemaRegistry | \`${d.easSchemaRegistry}\` |
| gridz.cell.v1 schema UID | \`${d.cellSchema}\` |
| Registrar (editor publish) | \`${d.registrarAddress}\` |
| ENS subject suffix | \`*.${d.ensBase}\` |
| EAS explorer | ${d.easExplorer} |`;
}

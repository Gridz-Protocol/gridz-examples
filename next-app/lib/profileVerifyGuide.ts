import { siteHomeUrl } from "./subjectFromHost";

export function profileApiUrl(subject: string): string {
  return `${siteHomeUrl()}/api/profile/${encodeURIComponent(subject)}`;
}

export function profileVerifyApiUrl(subject: string): string {
  return `${siteHomeUrl()}/api/verify/${encodeURIComponent(subject)}`;
}

export function profileVerifyDocsUrl(): string {
  return `${siteHomeUrl()}/docs/verification`;
}

export function profileApiDocsUrl(): string {
  return `${siteHomeUrl()}/docs/api`;
}

export function curlFetchSnippet(subject: string): string {
  return `curl -s "${profileApiUrl(subject)}" | jq .`;
}

export function verifyTypeScriptSnippet(subject: string): string {
  return `// One-shot report (recommended)
const { report } = await fetch("${profileVerifyApiUrl(subject)}").then((r) => r.json());

// Or fetch grid + verify with Base EAS RPC:
import { verifyGrid } from "@gridz/core";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const { grid } = await fetch("${profileApiUrl(subject)}").then((r) => r.json());
const client = createPublicClient({ chain: base, transport: http("https://base.publicnode.com") });
const report = await verifyGrid(grid, {
  allowDelegated: true,
  eas: {
    chainId: 8453,
    easAddress: "0x4200000000000000000000000000000000000021",
    cellSchemaUid: "0x394d8e67b1470cbdb7fa6c7d15d15d295ca81d822b55267939751a8a686abb87",
    resolverAddress: "0x73c5e3944B780D4927c403d351A4F94875DC57B3",
    subjectEns: "${subject}",
    readContract: (args) => client.readContract(args),
  },
});`;
}

export function verifyPythonSnippet(subject: string): string {
  return `from gridz import verify_grid
import httpx

grid = httpx.get("${profileApiUrl(subject)}").json()["grid"]
report = verify_grid(grid)`;
}

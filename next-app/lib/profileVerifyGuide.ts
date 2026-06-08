import { siteHomeUrl } from "./subjectFromHost";

export function profileApiUrl(subject: string): string {
  return `${siteHomeUrl()}/api/profile/${encodeURIComponent(subject)}`;
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
  return `import { verifyGrid } from "@gridz/core";

const res = await fetch("${profileApiUrl(subject)}");
const { grid } = await res.json();

const report = await verifyGrid(grid);
// report.ok === true → root + cell signatures check out`;
}

export function verifyPythonSnippet(subject: string): string {
  return `from gridz import verify_grid
import httpx

grid = httpx.get("${profileApiUrl(subject)}").json()["grid"]
report = verify_grid(grid)`;
}

import { loadDraftBundle } from "./drafts";
import { bundleIsPublished } from "./profileSource";

const PREFIX = "gridz:draft:";

/** Subjects with unsigned local edits in this browser (excludes published baselines). */
export function listDraftSubjects(): string[] {
  if (typeof window === "undefined") return [];
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const subject = key.slice(PREFIX.length);
    const bundle = loadDraftBundle(subject);
    if (bundle && !bundleIsPublished(bundle)) out.push(subject);
  }
  return out.sort();
}

import { loadDraftBundle } from "./drafts";

const PREFIX = "gridz:draft:";

export function listDraftSubjects(): string[] {
  if (typeof window === "undefined") return [];
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const subject = key.slice(PREFIX.length);
    if (loadDraftBundle(subject)) out.push(subject);
  }
  return out.sort();
}

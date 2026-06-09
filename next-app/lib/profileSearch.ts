import { DEMO_PROFILE_SUBJECT } from "./demoProfile";
import { listDraftSubjects } from "./listDrafts";
import { bundleIsPublished } from "./profileSource";
import { listRecentProfiles } from "./recentProfiles";
import { toEnsSubname } from "./ensNames";

const ENS_BASE = process.env.NEXT_PUBLIC_GRIDZ_ENS_BASE ?? "gridz.eth";
const MAX_SUGGESTIONS = 5;

export type ProfileSearchStatus = "published" | "draft" | "unknown";

export interface ProfileSearchMatch {
  subject: string;
  alias: string;
  displayName?: string;
  status: ProfileSearchStatus;
}

function aliasFromSubject(subject: string): string {
  return subject.split(".")[0] ?? subject;
}

function queryAlias(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
  if (!trimmed) return "";
  return trimmed.includes(".") ? (trimmed.split(".")[0] ?? trimmed) : trimmed;
}

export function resolveSearchSubject(raw: string): string {
  const trimmed = raw.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
  if (!trimmed) return "";
  return trimmed.includes(".") ? trimmed : toEnsSubname(trimmed, ENS_BASE);
}

/** Local subjects to match against (featured, recent, drafts, exact typed name). */
export function buildSearchPool(extraSubject?: string): string[] {
  const pool = new Set<string>([
    DEMO_PROFILE_SUBJECT,
    ...listRecentProfiles(),
    ...listDraftSubjects(),
  ]);
  if (extraSubject) pool.add(extraSubject.toLowerCase());
  return [...pool];
}

function scoreMatch(subject: string, aliasQ: string, fullQ: string): number | null {
  const alias = aliasFromSubject(subject).toLowerCase();
  if (alias === aliasQ) return 0;
  if (alias.startsWith(aliasQ)) return 1;
  if (alias.includes(aliasQ)) return 2;
  if (fullQ && subject.includes(fullQ)) return 3;
  return null;
}

export function rankLocalMatches(query: string, subjects: string[], limit = MAX_SUGGESTIONS): string[] {
  const aliasQ = queryAlias(query);
  const fullQ = query.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
  if (!aliasQ) return [];

  const ranked = subjects
    .map((subject) => {
      const score = scoreMatch(subject, aliasQ, fullQ);
      return score == null ? null : { subject, score };
    })
    .filter((row): row is { subject: string; score: number } => row != null)
    .sort((a, b) => a.score - b.score || a.subject.localeCompare(b.subject));

  return [...new Set(ranked.map((r) => r.subject))].slice(0, limit);
}

export function localProfileMatches(query: string): string[] {
  const exact = resolveSearchSubject(query);
  return rankLocalMatches(query, buildSearchPool(exact || undefined));
}

export async function enrichProfileMatch(
  subject: string,
  displayName?: string,
): Promise<ProfileSearchMatch> {
  const alias = aliasFromSubject(subject);
  let status: ProfileSearchStatus = "unknown";
  let name = displayName;

  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(subject)}`);
    const data = (await res.json()) as {
      ok: boolean;
      grid?: { subject?: { display_name?: string } };
    };
    if (data.ok && data.grid) {
      status = "published";
      name = data.grid.subject?.display_name ?? name;
    }
  } catch {
    // keep unknown
  }

  if (status === "unknown" && typeof window !== "undefined") {
    const { loadDraftBundle } = await import("./drafts");
    const bundle = loadDraftBundle(subject);
    if (bundle) {
      status = bundleIsPublished(bundle) ? "published" : "draft";
      name = bundle.fields.alias.trim() || name;
    }
  }

  return {
    subject,
    alias,
    displayName: name ?? alias,
    status,
  };
}

export async function searchProfileMatches(query: string): Promise<ProfileSearchMatch[]> {
  const subjects = localProfileMatches(query);
  if (subjects.length === 0) return [];
  return Promise.all(subjects.map((subject) => enrichProfileMatch(subject)));
}

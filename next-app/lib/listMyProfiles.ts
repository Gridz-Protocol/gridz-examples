import { loadDraftBundle } from "./drafts";
import { listDraftSubjects } from "./listDrafts";
import { isProfileOwner, ownerDidFromGrid } from "./profileOwner";
import { hasPublishedBaseline } from "./profileSource";

const PREFIX = "gridz:draft:";

export interface ListMyProfilesOptions {
  walletAddress?: string | null;
  chainId?: number;
  registrarAddress?: string | null;
}

/** Profiles published from this browser (signed baseline matches connected wallet when set). */
export function listOwnedProfileSubjects(opts: ListMyProfilesOptions = {}): string[] {
  if (typeof window === "undefined") return [];
  const { walletAddress, chainId = 8453, registrarAddress } = opts;
  const out: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const subject = key.slice(PREFIX.length);
    const bundle = loadDraftBundle(subject);
    if (!bundle?.signedBaseline || !hasPublishedBaseline(bundle.signedBaseline)) continue;

    if (walletAddress) {
      if (!isProfileOwner(bundle.signedBaseline, walletAddress, chainId, registrarAddress)) continue;
    } else if (!ownerDidFromGrid(bundle.signedBaseline, chainId, registrarAddress)) {
      continue;
    }

    out.push(subject);
  }

  return out.sort();
}

/** Drafts + owned profiles for the My profiles menu (excludes recently viewed). */
export function listMyProfileSubjects(opts: ListMyProfilesOptions = {}): {
  drafts: string[];
  owned: string[];
} {
  const drafts = listDraftSubjects();
  const owned = listOwnedProfileSubjects(opts).filter((subject) => !drafts.includes(subject));
  return { drafts, owned };
}

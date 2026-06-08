import type { Grid } from "@gridz/core";

const PREFIX = "gridz:draft:";

export function draftKey(subject: string): string {
  return `${PREFIX}${subject.toLowerCase()}`;
}

export function loadDraft(subject: string): Grid | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(subject));
    return raw ? (JSON.parse(raw) as Grid) : null;
  } catch {
    return null;
  }
}

export function saveDraft(subject: string, grid: Grid): void {
  localStorage.setItem(draftKey(subject), JSON.stringify(grid));
}

export function clearDraft(subject: string): void {
  localStorage.removeItem(draftKey(subject));
}

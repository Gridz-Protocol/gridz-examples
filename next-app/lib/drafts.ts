import type { Grid } from "@gridz/core";
import { fieldsFromGrid, type ProfileEditorState } from "./profileFields";

const PREFIX = "gridz:draft:";

export interface DraftBundle {
  version: 2;
  fields: ProfileEditorState;
  /** Last wallet-signed grid — used to reuse attestations on the next publish. */
  signedBaseline: Grid | null;
  savedAt: string;
}

export function draftKey(subject: string): string {
  return `${PREFIX}${subject.toLowerCase()}`;
}

function isGrid(value: unknown): value is Grid {
  return Boolean(value && typeof value === "object" && "schema_version" in value && "cells" in value);
}

function migrateV1Grid(grid: Grid): DraftBundle {
  return {
    version: 2,
    fields: fieldsFromGrid(grid),
    signedBaseline: grid,
    savedAt: new Date().toISOString(),
  };
}

export function loadDraftBundle(subject: string): DraftBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(subject));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && (parsed as DraftBundle).version === 2) {
      return parsed as DraftBundle;
    }
    if (isGrid(parsed)) return migrateV1Grid(parsed);
    return null;
  } catch {
    return null;
  }
}

/** @deprecated Use loadDraftBundle — returns signed baseline or migrated grid for compat. */
export function loadDraft(subject: string): Grid | null {
  const bundle = loadDraftBundle(subject);
  if (!bundle) return null;
  return bundle.signedBaseline;
}

export function saveDraftBundle(subject: string, bundle: DraftBundle): void {
  localStorage.setItem(draftKey(subject), JSON.stringify(bundle));
}

export function saveDraftFields(
  subject: string,
  fields: ProfileEditorState,
  signedBaseline: Grid | null = loadDraftBundle(subject)?.signedBaseline ?? null,
): void {
  saveDraftBundle(subject, {
    version: 2,
    fields,
    signedBaseline,
    savedAt: new Date().toISOString(),
  });
}

export function saveSignedBaseline(subject: string, fields: ProfileEditorState, grid: Grid): void {
  saveDraftBundle(subject, {
    version: 2,
    fields: fieldsFromGrid(grid),
    signedBaseline: grid,
    savedAt: new Date().toISOString(),
  });
}

/** @deprecated Use saveDraftFields or saveSignedBaseline. */
export function saveDraft(subject: string, grid: Grid): void {
  saveSignedBaseline(subject, fieldsFromGrid(grid), grid);
}

export function clearDraft(subject: string): void {
  localStorage.removeItem(draftKey(subject));
}

export function hasLocalDraft(subject: string): boolean {
  return loadDraftBundle(subject) !== null;
}

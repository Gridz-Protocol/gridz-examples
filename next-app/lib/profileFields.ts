import type { Grid } from "@gridz/core";

export interface StatRow {
  label: string;
  value: string;
}

export interface ProfileEditorState {
  alias: string;
  description: string;
  url: string;
  avatar: string;
  twitter: string;
  github: string;
  bsky: string;
  statsEnabled: boolean;
  stats: StatRow[];
  pollEnabled: boolean;
  pollQuestion: string;
  pollOptions: string[];
  linkEnabled: boolean;
  linkLabel: string;
  linkUrl: string;
}

export const DEFAULT_PROFILE_FIELDS: ProfileEditorState = {
  alias: "",
  description: "",
  url: "",
  avatar: "",
  twitter: "",
  github: "",
  bsky: "",
  statsEnabled: false,
  stats: [
    { label: "Followers", value: "" },
    { label: "Projects", value: "" },
  ],
  pollEnabled: false,
  pollQuestion: "",
  pollOptions: ["", ""],
  linkEnabled: false,
  linkLabel: "",
  linkUrl: "",
};

function cellString(grid: Grid | null | undefined, key: string): string {
  const v = grid?.cells.find((c) => c.key === key)?.value;
  return typeof v === "string" ? v : "";
}

function cellObject(grid: Grid | null | undefined, key: string): Record<string, unknown> | null {
  const v = grid?.cells.find((c) => c.key === key)?.value;
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

export function fieldsFromGrid(grid: Grid | null | undefined): ProfileEditorState {
  if (!grid) return { ...DEFAULT_PROFILE_FIELDS };

  const statsCell = grid.cells.find((c) => c.key === "gridz.stats");
  let stats: StatRow[] = DEFAULT_PROFILE_FIELDS.stats;
  let statsEnabled = false;
  if (statsCell) {
    statsEnabled = true;
    const raw = statsCell.value;
    if (Array.isArray(raw)) {
      stats = raw.map((row) => {
        const r = row as { label?: string; value?: unknown };
        return { label: r.label ?? "", value: String(r.value ?? "") };
      });
    } else if (raw && typeof raw === "object") {
      stats = Object.entries(raw as Record<string, unknown>).map(([label, value]) => ({
        label,
        value: String(value),
      }));
    }
    if (stats.length === 0) stats = [{ label: "", value: "" }];
  }

  const pollCell = grid.cells.find((c) => c.key === "gridz.poll");
  let pollEnabled = false;
  let pollQuestion = "";
  let pollOptions = ["", ""];
  if (pollCell) {
    pollEnabled = true;
    const poll = cellObject(grid, "gridz.poll");
    pollQuestion = typeof poll?.q === "string" ? poll.q : "";
    pollOptions = Array.isArray(poll?.options)
      ? (poll.options as string[]).map(String)
      : ["", ""];
    while (pollOptions.length < 2) pollOptions.push("");
  }

  const linkCell = grid.cells.find((c) => c.key === "gridz.social_link");
  let linkEnabled = false;
  let linkLabel = "";
  let linkUrl = "";
  if (linkCell) {
    linkEnabled = true;
    const link = cellObject(grid, "gridz.social_link");
    if (link) {
      linkLabel = typeof link.label === "string" ? link.label : "";
      linkUrl = typeof link.url === "string" ? link.url : "";
    } else if (typeof linkCell.value === "string") {
      linkUrl = linkCell.value;
    }
  }

  return {
    alias: cellString(grid, "alias"),
    description: cellString(grid, "description"),
    url: cellString(grid, "url"),
    avatar: cellString(grid, "avatar"),
    twitter: cellString(grid, "com.twitter"),
    github: cellString(grid, "com.github"),
    bsky: cellString(grid, "social.bsky"),
    statsEnabled,
    stats,
    pollEnabled,
    pollQuestion,
    pollOptions,
    linkEnabled,
    linkLabel,
    linkUrl,
  };
}

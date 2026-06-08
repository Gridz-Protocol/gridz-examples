import type { Grid } from "@gridz/core";

export interface StatRow {
  label: string;
  value: string;
}

export interface GuestbookEntry {
  text: string;
  author: string;
}

export interface TokenEntry {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
}

export interface ProfileEditorState {
  alias: string;
  description: string;
  url: string;
  avatar: string;
  twitter: string;
  github: string;
  bsky: string;
  discord: string;
  telegram: string;
  statsEnabled: boolean;
  stats: StatRow[];
  pollEnabled: boolean;
  pollQuestion: string;
  pollOptions: string[];
  linkEnabled: boolean;
  linkLabel: string;
  linkUrl: string;
  messageMeEnabled: boolean;
  messageMeUrl: string;
  availabilityEnabled: boolean;
  availabilityStatus: "available" | "busy";
  availabilityMessage: string;
  currentlyEnabled: boolean;
  currentlyTitle: string;
  currentlySubtitle: string;
  currentlyEmoji: string;
  countdownEnabled: boolean;
  countdownLabel: string;
  countdownTarget: string;
  clockEnabled: boolean;
  clockTimezone: string;
  textEnabled: boolean;
  textContent: string;
  guestbookEnabled: boolean;
  guestbookEntries: GuestbookEntry[];
  tokensEnabled: boolean;
  tokens: TokenEntry[];
}

export const DEFAULT_PROFILE_FIELDS: ProfileEditorState = {
  alias: "",
  description: "",
  url: "",
  avatar: "",
  twitter: "",
  github: "",
  bsky: "",
  discord: "",
  telegram: "",
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
  messageMeEnabled: false,
  messageMeUrl: "",
  availabilityEnabled: false,
  availabilityStatus: "available",
  availabilityMessage: "",
  currentlyEnabled: false,
  currentlyTitle: "",
  currentlySubtitle: "",
  currentlyEmoji: "🚀",
  countdownEnabled: false,
  countdownLabel: "",
  countdownTarget: "",
  clockEnabled: false,
  clockTimezone: "America/New_York",
  textEnabled: false,
  textContent: "",
  guestbookEnabled: false,
  guestbookEntries: [{ text: "", author: "" }],
  tokensEnabled: false,
  tokens: [{ chainId: 1, address: "", symbol: "", name: "" }],
};

function cellString(grid: Grid | null | undefined, key: string): string {
  const v = grid?.cells.find((c) => c.key === key)?.value;
  return typeof v === "string" ? v : "";
}

function cellObject(grid: Grid | null | undefined, key: string): Record<string, unknown> | null {
  const v = grid?.cells.find((c) => c.key === key)?.value;
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}


function parseTokens(grid: Grid): TokenEntry[] {
  const cell = grid.cells.find((c) => c.key === "gridz.tokens");
  if (!cell || typeof cell.value !== "object" || cell.value === null || Array.isArray(cell.value)) {
    return [{ chainId: 1, address: "", symbol: "", name: "" }];
  }
  const raw = (cell.value as { tokens?: unknown }).tokens;
  if (!Array.isArray(raw) || raw.length === 0) return [{ chainId: 1, address: "", symbol: "", name: "" }];
  return raw.map((t) => {
    const row = t as { chainId?: number; address?: string; symbol?: string; name?: string };
    return {
      chainId: typeof row.chainId === "number" ? row.chainId : 1,
      address: typeof row.address === "string" ? row.address : "",
      symbol: typeof row.symbol === "string" ? row.symbol : "",
      name: typeof row.name === "string" ? row.name : "",
    };
  });
}

function parseGuestbook(grid: Grid): GuestbookEntry[] {
  const cell = grid.cells.find((c) => c.key === "gridz.guestbook");
  if (!cell || !Array.isArray(cell.value)) return [{ text: "", author: "" }];
  return (cell.value as GuestbookEntry[]).map((e) => ({
    text: e.text ?? "",
    author: e.author ?? "",
  }));
}

export function fieldsFromGrid(grid: Grid | null | undefined): ProfileEditorState {
  if (!grid) return { ...DEFAULT_PROFILE_FIELDS };

  const statsCell = grid.cells.find((c) => c.key === "gridz.stats");
  let stats = DEFAULT_PROFILE_FIELDS.stats;
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

  const poll = cellObject(grid, "gridz.poll");
  const pollEnabled = Boolean(grid.cells.find((c) => c.key === "gridz.poll"));
  const link = cellObject(grid, "gridz.social_link");
  const linkCell = grid.cells.find((c) => c.key === "gridz.social_link");
  const avail = cellObject(grid, "gridz.availability_status");
  const cur = cellObject(grid, "gridz.currently");
  const count = cellObject(grid, "gridz.countdown");
  const msg = grid.cells.find((c) => c.key === "gridz.message_me");

  return {
    alias: cellString(grid, "alias"),
    description: cellString(grid, "description"),
    url: cellString(grid, "url"),
    avatar: cellString(grid, "avatar"),
    twitter: cellString(grid, "com.twitter"),
    github: cellString(grid, "com.github"),
    bsky: cellString(grid, "social.bsky"),
    discord: cellString(grid, "com.discord"),
    telegram: cellString(grid, "org.telegram"),
    statsEnabled,
    stats,
    pollEnabled,
    pollQuestion: typeof poll?.q === "string" ? poll.q : "",
    pollOptions: Array.isArray(poll?.options) ? (poll.options as string[]).map(String) : ["", ""],
    linkEnabled: Boolean(linkCell),
    linkLabel: typeof link?.label === "string" ? link.label : "",
    linkUrl: typeof link?.url === "string" ? link.url : typeof linkCell?.value === "string" ? linkCell.value : "",
    messageMeEnabled: Boolean(msg),
    messageMeUrl: msg ? (typeof msg.value === "string" ? msg.value : "") : "",
    availabilityEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.availability_status")),
    availabilityStatus:
      typeof avail?.status === "string" && avail.status.toLowerCase().includes("busy") ? "busy" : "available",
    availabilityMessage: typeof avail?.message === "string" ? avail.message : "",
    currentlyEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.currently")),
    currentlyTitle: typeof cur?.title === "string" ? cur.title : "",
    currentlySubtitle: typeof cur?.subtitle === "string" ? cur.subtitle : "",
    currentlyEmoji: typeof cur?.emoji === "string" ? cur.emoji : "🚀",
    countdownEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.countdown")),
    countdownLabel: typeof count?.label === "string" ? count.label : "",
    countdownTarget: typeof count?.target === "string" ? count.target.slice(0, 16) : "",
    clockEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.clock" || c.key === "timezone")),
    clockTimezone: cellString(grid, "gridz.clock") || cellString(grid, "timezone") || "America/New_York",
    textEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.text")),
    textContent: cellString(grid, "gridz.text"),
    guestbookEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.guestbook")),
    guestbookEntries: parseGuestbook(grid),
    tokensEnabled: Boolean(grid.cells.find((c) => c.key === "gridz.tokens")),
    tokens: parseTokens(grid),
  };
}

export function isWidgetEnabled(fields: ProfileEditorState, id: string): boolean {
  const map: Record<string, boolean> = {
    stats: fields.statsEnabled,
    poll: fields.pollEnabled,
    link: fields.linkEnabled,
    message_me: fields.messageMeEnabled,
    availability: fields.availabilityEnabled,
    currently: fields.currentlyEnabled,
    countdown: fields.countdownEnabled,
    clock: fields.clockEnabled,
    text: fields.textEnabled,
    guestbook: fields.guestbookEnabled,
    tokens: fields.tokensEnabled,
  };
  return map[id] ?? false;
}

export function setWidgetEnabled(
  fields: ProfileEditorState,
  id: string,
  enabled: boolean,
): ProfileEditorState {
  const patch: Partial<ProfileEditorState> = {};
  if (id === "stats") patch.statsEnabled = enabled;
  if (id === "poll") patch.pollEnabled = enabled;
  if (id === "link") patch.linkEnabled = enabled;
  if (id === "message_me") patch.messageMeEnabled = enabled;
  if (id === "availability") patch.availabilityEnabled = enabled;
  if (id === "currently") patch.currentlyEnabled = enabled;
  if (id === "countdown") patch.countdownEnabled = enabled;
  if (id === "clock") patch.clockEnabled = enabled;
  if (id === "text") patch.textEnabled = enabled;
  if (id === "guestbook") patch.guestbookEnabled = enabled;
  if (id === "tokens") patch.tokensEnabled = enabled;
  return { ...fields, ...patch };
}

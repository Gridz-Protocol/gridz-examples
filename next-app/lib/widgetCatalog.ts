export type WidgetKind =
  | "stats"
  | "poll"
  | "link"
  | "availability"
  | "currently"
  | "countdown"
  | "clock"
  | "text"
  | "guestbook"
  | "message_me";

export interface WidgetCatalogEntry {
  id: WidgetKind;
  icon: string;
  name: string;
  description: string;
  spritz?: string;
}

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  { id: "stats", icon: "📊", name: "Stats", description: "Number tiles — followers, launches, posts", spritz: "Companies / Rockets" },
  { id: "poll", icon: "🗳️", name: "Poll", description: "Ask visitors a question with vote bars", spritz: "Which company excites you?" },
  { id: "currently", icon: "🚀", name: "Currently", description: "What you're building or focused on", spritz: "Currently Building" },
  { id: "availability", icon: "🟢", name: "Status", description: "Available or busy indicator", spritz: "Busy / Available" },
  { id: "countdown", icon: "⏱️", name: "Countdown", description: "Live countdown to an event", spritz: "Mars Mission" },
  { id: "clock", icon: "🕐", name: "Local time", description: "Live clock for your timezone", spritz: "Texas Time" },
  { id: "text", icon: "💬", name: "Quote", description: "Short quote or announcement", spritz: "Motivational quote" },
  { id: "guestbook", icon: "📝", name: "Guestbook", description: "Pinned visitor messages you curate", spritz: "Leave your mark" },
  { id: "link", icon: "🔗", name: "Featured link", description: "Newsletter, site, or project card" },
  { id: "message_me", icon: "✉️", name: "Contact button", description: "DM / contact CTA in profile header", spritz: "DM me" },
];

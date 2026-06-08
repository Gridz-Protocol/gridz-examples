import type { ProfileEditorState } from "../../lib/profileFields";

/**
 * Spritz-style showcase profile (elonmusk-inspired widget gallery). Lives at demo.gridz.eth.
 * Parody / demo only — lives in __fixtures__ (exempt from check-no-mock-data).
 */
export const DEMO_ENS_SUBJECT = "demo.gridz.eth";

export const DEMO_PROFILE_FIELDS: ProfileEditorState = {
  alias: "Elon Musk",
  description: "CEO of Tesla, SpaceX, X & xAI. Making life multiplanetary 🚀",
  url: "https://x.com/elonmusk",
  avatar:
    "https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop1%29.jpg",
  twitter: "elonmusk",
  github: "elonmusk",
  bsky: "elonmusk.bsky.social",
  discord: "elonmusk",
  telegram: "elonmusk",
  statsEnabled: true,
  stats: [
    { label: "Companies", value: "6" },
    { label: "Rockets Landed", value: "287" },
    { label: "X Posts", value: "42K" },
    { label: "Starlink Sats", value: "6.2K" },
  ],
  pollEnabled: true,
  pollQuestion: "Which company excites you most?",
  pollOptions: ["SpaceX", "Tesla", "Neuralink", "xAI"],
  linkEnabled: true,
  linkLabel: "xAI — Grok",
  linkUrl: "https://x.ai",
  messageMeEnabled: true,
  messageMeUrl: "https://x.com/elonmusk",
  availabilityEnabled: true,
  availabilityStatus: "busy",
  availabilityMessage: "Reviewing Starship Mk3",
  currentlyEnabled: true,
  currentlyTitle: "Starship",
  currentlySubtitle: "Making life multiplanetary",
  currentlyEmoji: "🚀",
  countdownEnabled: true,
  countdownLabel: "Mars Mission",
  countdownTarget: "2030-01-01T12:00",
  clockEnabled: true,
  clockTimezone: "America/Chicago",
  textEnabled: true,
  textContent:
    "When something is important enough, you do it even if the odds are not in your favor.",
  guestbookEnabled: true,
  guestbookEntries: [
    { text: "Take us to Mars! 🚀", author: "SpaceEnthusiast" },
    { text: "FSD is amazing! Thank you!", author: "TeslaOwner" },
    { text: "xAI is the future of AI safety", author: "AIResearcher" },
    { text: "Starship landing was incredible 🔥", author: "StarbaseFan" },
    { text: "Grok beats every other assistant", author: "PowerUser" },
  ],
};

import type { ProfileEditorState } from "../../lib/profileFields";

/**
 * Fictional showcase profile (Spritz-style widget gallery). Lives at demo.gridz.eth.
 * Data is in __fixtures__ — exempt from check-no-mock-data.
 */
export const DEMO_ENS_SUBJECT = "demo.gridz.eth";

export const DEMO_PROFILE_FIELDS: ProfileEditorState = {
  alias: "Nova Chen",
  description: "CEO of Stellar Dynamics, OrbitLink & NeuraSys. Making life multiplanetary 🚀",
  url: "https://gridz.bio/for-ai",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gridz-demo-nova",
  twitter: "novachen",
  github: "gridz-protocol",
  bsky: "nova.gridz.bio",
  discord: "nova_gridz",
  telegram: "gridzdemo",
  statsEnabled: true,
  stats: [
    { label: "Companies", value: "6" },
    { label: "Launches", value: "287" },
    { label: "Posts", value: "42K" },
  ],
  pollEnabled: true,
  pollQuestion: "Which venture excites you most?",
  pollOptions: ["Stellar Dynamics", "OrbitLink", "NeuraSys", "DeepField AI"],
  linkEnabled: true,
  linkLabel: "Gridz for AI",
  linkUrl: "https://gridz.bio/for-ai",
  messageMeEnabled: true,
  messageMeUrl: "https://gridz.bio/claim",
  availabilityEnabled: true,
  availabilityStatus: "busy",
  availabilityMessage: "In a Starship review",
  currentlyEnabled: true,
  currentlyTitle: "Starship Mk3",
  currentlySubtitle: "Making life multiplanetary",
  currentlyEmoji: "🚀",
  countdownEnabled: true,
  countdownLabel: "Mars mission",
  countdownTarget: "2030-01-01T12:00",
  clockEnabled: true,
  clockTimezone: "America/Chicago",
  textEnabled: true,
  textContent:
    "When something is important enough, you do it even if the odds are not in your favor.",
  guestbookEnabled: true,
  guestbookEntries: [
    { text: "Take us to Mars! 🚀", author: "SpaceEnthusiast" },
    { text: "Autopilot is incredible — thank you!", author: "Driver42" },
    { text: "NeuraSys is the future of safe AI", author: "AIResearcher" },
  ],
};

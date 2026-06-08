/** Local visitor poll votes until shared on-chain / API tallies ship. */

function voteKey(subject: string, cellId: string): string {
  return `gridz:poll-vote:${subject.toLowerCase()}:${cellId}`;
}

export function getLocalPollVote(subject: string, cellId: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(voteKey(subject, cellId));
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export function setLocalPollVote(subject: string, cellId: string, optionIndex: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(voteKey(subject, cellId), String(optionIndex));
}

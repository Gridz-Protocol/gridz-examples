/** ~14s per on-chain tx; each cell = EAS attest + resolver link. */
export function estimatePublishMs(cellCount: number): number {
  const txs = Math.max(cellCount * 2, 2);
  const ms = txs * 14_000;
  return Math.min(Math.max(ms, 45_000), 20 * 60_000);
}

export function formatPublishEta(seconds: number): string {
  if (seconds < 60) return `~${Math.max(1, seconds)}s remaining`;
  const m = Math.ceil(seconds / 60);
  return m === 1 ? "~1 min remaining" : `~${m} min remaining`;
}

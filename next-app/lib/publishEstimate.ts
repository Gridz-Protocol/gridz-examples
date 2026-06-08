/** ~14s per on-chain tx (EAS attest + resolver link, both from user wallet). */
const MS_PER_TX = 14_000;

export function estimatePublishTxCount(cellCount: number): number {
  const n = Math.max(cellCount, 0);
  if (n === 0) return 0;
  return n * 2;
}

export function estimatePublishMs(cellCount: number): number {
  const txs = Math.max(estimatePublishTxCount(cellCount), 1);
  const ms = txs * MS_PER_TX;
  return Math.min(Math.max(ms, 30_000), 20 * 60_000);
}

export function formatPublishEta(seconds: number): string {
  if (seconds < 60) return `~${Math.max(1, seconds)}s remaining`;
  const m = Math.ceil(seconds / 60);
  return m === 1 ? "~1 min remaining" : `~${m} min remaining`;
}

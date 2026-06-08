"use client";

import { useWallet } from "../lib/wallet";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { address, connecting, connect, disconnect } = useWallet();

  if (address) {
    return (
      <button type="button" className="site-btn site-btn--ghost" onClick={disconnect}>
        {shortAddr(address)}
      </button>
    );
  }

  return (
    <button type="button" className="site-btn site-btn--primary" onClick={connect} disabled={connecting}>
      {connecting ? "Connecting…" : "Connect wallet"}
    </button>
  );
}

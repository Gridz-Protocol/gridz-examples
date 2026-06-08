"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GRIDZ_CHAIN_ID } from "../lib/wagmiConfig";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            className="wallet-connect"
            {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button type="button" className="site-btn site-btn--primary" onClick={openConnectModal}>
                    Connect wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== GRIDZ_CHAIN_ID) {
                return (
                  <button type="button" className="wallet-chip__warn" onClick={openChainModal}>
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="wallet-chip">
                  <span className="wallet-chip__network">{chain.name}</span>
                  <button type="button" className="site-btn site-btn--ghost wallet-chip__addr" onClick={openAccountModal}>
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

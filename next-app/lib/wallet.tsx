"use client";

import { useCallback } from "react";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import type { Hex, WalletClient } from "viem";
import { GRIDZ_CHAIN_ID } from "./wagmiConfig";

export interface PreparedWallet {
  address: Hex;
  walletClient: WalletClient;
  chainId: number;
}

function chainLabel(chainId: number): string {
  if (chainId === 1) return "Ethereum Mainnet";
  if (chainId === 11155111) return "Sepolia";
  return `Chain ${chainId}`;
}

export function walletChainLabel(chainId: number): string {
  return chainLabel(chainId);
}

/** RainbowKit + wagmi wallet surface used across the app. */
export function useWallet() {
  const targetChainId = GRIDZ_CHAIN_ID;
  const { address, chainId, isConnected, isConnecting, isReconnecting } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const isCorrectChain = chainId === targetChainId;
  const connecting = isConnecting || isReconnecting;

  const openWalletModal = useCallback(() => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!isCorrectChain) {
      openChainModal?.();
    }
  }, [isConnected, isCorrectChain, openChainModal, openConnectModal]);

  const prepareWallet = useCallback(async (): Promise<PreparedWallet> => {
    if (!isConnected || !address) {
      openConnectModal?.();
      throw new Error("Connect your wallet using the modal, then try again.");
    }

    if (chainId !== targetChainId) {
      openChainModal?.();
      try {
        await switchChainAsync({ chainId: targetChainId });
      } catch {
        throw new Error(`Switch to ${chainLabel(targetChainId)} in your wallet, then try again.`);
      }
    }

    if (!walletClient) {
      throw new Error("Wallet is still loading — wait a moment and try again.");
    }

    return {
      address,
      walletClient,
      chainId: targetChainId,
    };
  }, [
    address,
    chainId,
    isConnected,
    openChainModal,
    openConnectModal,
    switchChainAsync,
    targetChainId,
    walletClient,
  ]);

  const connect = useCallback(async () => {
    if (!isConnected) {
      openConnectModal?.();
      return null;
    }
    return prepareWallet();
  }, [isConnected, openConnectModal, prepareWallet]);

  return {
    address: address ?? null,
    chainId: chainId ?? targetChainId,
    targetChainId,
    connecting,
    walletClient: walletClient ?? null,
    publicClient,
    hasProvider: true,
    isConnected,
    isCorrectChain,
    connect,
    disconnect: () => disconnect(),
    prepareWallet,
    openWalletModal,
  };
}

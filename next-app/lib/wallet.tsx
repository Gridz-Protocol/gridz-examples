"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Chain,
  type Hex,
  type WalletClient,
} from "viem";
import { mainnet, sepolia } from "viem/chains";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

interface WalletState {
  address: Hex | null;
  chainId: number;
  chain: Chain;
  connecting: boolean;
  walletClient: WalletClient | null;
  publicClient: ReturnType<typeof createPublicClient>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

function chainForId(chainId: number): Chain {
  return chainId === 11155111 ? sepolia : mainnet;
}

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const defaultChainId = Number(process.env.NEXT_PUBLIC_GRIDZ_CHAIN_ID ?? process.env.GRIDZ_CHAIN_ID ?? "1");
  const [address, setAddress] = useState<Hex | null>(null);
  const [chainId, setChainId] = useState(defaultChainId);
  const [connecting, setConnecting] = useState(false);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const chain = useMemo(() => chainForId(chainId), [chainId]);
  const rpc = process.env.NEXT_PUBLIC_GRIDZ_RPC_URL ?? "https://ethereum.publicnode.com";

  const publicClient = useMemo(
    () => createPublicClient({ chain, transport: http(rpc) }),
    [chain, rpc],
  );

  const refresh = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;
    try {
      const accounts = (await provider.request({ method: "eth_accounts" })) as Hex[];
      if (accounts[0]) {
        setAddress(accounts[0]);
        setWalletClient(createWalletClient({ chain, transport: custom(provider) }));
      }
      const hexChain = (await provider.request({ method: "eth_chainId" })) as string;
      setChainId(Number.parseInt(hexChain, 16));
    } catch {
      /* ignore */
    }
  }, [chain]);

  useEffect(() => {
    void refresh();
    const provider = getProvider();
    if (!provider?.on) return;
    const onAccounts = (accounts: unknown) => {
      const list = accounts as Hex[];
      if (list[0]) {
        setAddress(list[0]);
        setWalletClient(createWalletClient({ chain, transport: custom(provider) }));
      } else {
        setAddress(null);
        setWalletClient(null);
      }
    };
    const onChain = (id: unknown) => setChainId(Number.parseInt(String(id), 16));
    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [chain, refresh]);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      alert("No Ethereum wallet found. Install MetaMask or another browser wallet.");
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as Hex[];
      setAddress(accounts[0] ?? null);
      setWalletClient(createWalletClient({ chain, transport: custom(provider) }));
      await refresh();
    } finally {
      setConnecting(false);
    }
  }, [chain, refresh]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletClient(null);
  }, []);

  const value: WalletState = {
    address,
    chainId,
    chain,
    connecting,
    walletClient,
    publicClient,
    connect,
    disconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

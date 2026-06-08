import { buildGrid, type Grid, type Hex, type Signer } from "@gridz/core";
import type { WalletClient } from "viem";
import { DEFAULT_THEME } from "./defaultTheme";

export interface ProfileFields {
  alias: string;
  description: string;
  url: string;
}

function walletSigner(walletClient: WalletClient, chainId: number, address: Hex): Signer {
  return {
    async did() {
      return `did:pkh:eip155:${chainId}:${address.toLowerCase()}`;
    },
    format: () => "eip712-raw" as const,
    async signTypedData(params) {
      const signature = await walletClient.signTypedData({
        account: address,
        ...params,
        primaryType: params.primaryType,
      } as never);
      return { signature, signerAddress: address };
    },
    async signMessage(message) {
      return walletClient.signMessage({ account: address, message: message as never });
    },
  };
}

export async function buildProfileGrid(
  fields: ProfileFields,
  ensName: string,
  walletClient: WalletClient,
  chainId: number,
  resolver: Hex,
  signerAddress: Hex,
): Promise<Grid> {
  const signer = walletSigner(walletClient, chainId, signerAddress);
  const did = await signer.did();

  return buildGrid(signer, {
    subject: { type: "human", did, ens: ensName, display_name: fields.alias },
    theme: DEFAULT_THEME,
    chainId,
    verifyingContract: resolver,
    cells: [
      {
        id: "alias",
        key: "alias",
        value: fields.alias,
        position: { x: 0, y: 0, w: 1, h: 1 },
        size: "1x1",
      },
      {
        id: "description",
        key: "description",
        value: fields.description,
        position: { x: 1, y: 0, w: 2, h: 1 },
        size: "2x1",
      },
      {
        id: "url",
        key: "url",
        value: fields.url,
        position: { x: 0, y: 1, w: 1, h: 1 },
        size: "1x1",
      },
    ],
  });
}
